import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  OutreachChannel,
  OutreachStatus,
  OutreachType,
} from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import {
  SEQUENCE,
  createOutreachSchema,
  getOptOutReason,
  markOutreachSent,
} from "@/server/outreach";
import { getReviewUrl } from "@/server/reviews";
import { getUnsubscribeUrl } from "@/server/suppression";

const listQuerySchema = z.object({
  status: z.enum(OutreachStatus).optional(),
  channel: z.enum(OutreachChannel).optional(),
  type: z.enum(OutreachType).optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  sentFrom: z.coerce.date().optional(),
  sentTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

// This route lists outreach (the communication history), newest first, with filters
// GET /api/admin/outreach?status=&channel=&type=&leadId=&contactId=&companyId=&sentFrom=&sentTo=&page=&pageSize=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You need to be logged in.",
        },
        { status: 401 },
      );
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = listQuerySchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const query = result.data;

    const where: Prisma.OutreachWhereInput = {
      status: query.status,
      channel: query.channel,
      type: query.type,
      leadId: query.leadId,
      contactId: query.contactId,
      lead: query.companyId ? { companyId: query.companyId } : undefined,
      sentAt:
        query.sentFrom || query.sentTo
          ? { gte: query.sentFrom, lte: query.sentTo }
          : undefined,
    };

    const [outreach, total] = await Promise.all([
      prisma.outreach.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          contact: { select: { id: true, fullName: true, email: true } },
          lead: {
            select: {
              id: true,
              status: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.outreach.count({ where }),
    ]);

    return NextResponse.json({
      outreach,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing outreach failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route creates an outreach record for a lead (a draft, a scheduled message, or one you've already sent).
// Review and unsubscribe links are filled in automatically. Opted-out contacts are blocked.
// POST /api/admin/outreach
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You need to be logged in.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    if (body === null) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "The request body must be valid JSON.",
        },
        { status: 400 },
      );
    }
    const result = createOutreachSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { status, ...data } = result.data;

    const lead = await prisma.lead.findUnique({
      where: { id: data.leadId },
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Lead not found.",
        },
        { status: 404 },
      );
    }

    const contactId = data.contactId ?? lead.contactId;
    const contact = contactId
      ? await prisma.contact.findUnique({ where: { id: contactId } })
      : null;

    if (contactId && (!contact || contact.companyId !== lead.companyId)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Contact not found for this lead's company.",
        },
        { status: 400 },
      );
    }

    const channel = data.channel ?? "EMAIL";

    if (channel === "EMAIL" && !contact?.email) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Email outreach needs a contact with an email address.",
        },
        { status: 400 },
      );
    }

    const optOutReason = await getOptOutReason(lead.status, contact);

    if (optOutReason) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: optOutReason,
        },
        { status: 403 },
      );
    }

    const latestReview = lead.reviews[0];
    const step = data.sequenceStep ?? null;

    const outreach = await prisma.outreach.create({
      data: {
        ...data,
        contactId,
        channel,
        type: data.type ?? (step !== null ? SEQUENCE[step].type : "MANUAL"),
        sequenceStep: step,
        status: status === "SCHEDULED" ? "SCHEDULED" : "DRAFT",
        reviewUrl:
          data.reviewUrl ??
          (latestReview ? getReviewUrl(latestReview.slug) : null),
        unsubscribeUrl:
          contact && channel === "EMAIL"
            ? getUnsubscribeUrl(contact.unsubscribeToken)
            : null,
      },
    });

    if (status === "SENT") {
      const sentOutreach = await markOutreachSent(outreach.id, user.id);
      return NextResponse.json({ outreach: sentOutreach }, { status: 201 });
    }

    return NextResponse.json({ outreach }, { status: 201 });
  } catch (error) {
    console.error("Creating outreach failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
