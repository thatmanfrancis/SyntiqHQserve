import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { SEQUENCE, getOptOutReason } from "@/server/outreach";
import { buildOutreachEmail } from "@/server/outreach-templates";
import { getReviewUrl } from "@/server/reviews";
import { getUnsubscribeUrl } from "@/server/suppression";

const templateQuerySchema = z.object({
  leadId: z.string({ error: "Lead is required" }).min(1),
  contactId: z.string().min(1).optional(),
  step: z.coerce.number().int().min(0).max(3).optional(),
});

// This route builds a personalised email for a lead from the templates, ready to edit and send.
// If no step is given, it picks the next step in the Day 0/3/7/14 sequence. Nothing is saved.
// GET /api/admin/outreach/template?leadId=&contactId=&step=(0|1|2|3)
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
    const result = templateQuerySchema.safeParse(searchParams);

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

    const lead = await prisma.lead.findUnique({
      where: { id: query.leadId },
      include: {
        company: true,
        reviews: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
        outreach: {
          where: { sequenceStep: { not: null }, sentAt: { not: null } },
          orderBy: { sentAt: "desc" },
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

    const contactId = query.contactId ?? lead.contactId;
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

    const lastSentStep = lead.outreach[0]?.sequenceStep ?? null;
    const step = query.step ?? (lastSentStep === null ? 0 : lastSentStep + 1);

    if (step > 3) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "The follow-up sequence for this lead is finished.",
        },
        { status: 400 },
      );
    }

    const latestReview = lead.reviews[0];
    const reviewUrl = latestReview ? getReviewUrl(latestReview.slug) : null;
    const unsubscribeUrl = contact
      ? getUnsubscribeUrl(contact.unsubscribeToken)
      : null;

    const email = buildOutreachEmail(step, {
      firstName: contact?.firstName ?? "there",
      companyName: lead.company.name,
      industry: lead.company.industry,
      city: lead.company.city,
      reviewUrl,
      unsubscribeUrl,
    });

    return NextResponse.json({
      template: {
        leadId: lead.id,
        contactId: contact?.id ?? null,
        to: contact?.email ?? null,
        sequenceStep: step,
        type: SEQUENCE[step].type,
        label: SEQUENCE[step].label,
        subject: email.subject,
        body: email.body,
        reviewUrl,
        unsubscribeUrl,
      },
    });
  } catch (error) {
    console.error("Building outreach template failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
