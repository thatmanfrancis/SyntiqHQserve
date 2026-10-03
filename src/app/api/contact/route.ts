import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EnquiryBudget, EnquiryService } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { sendEnquiryConfirmation, sendEnquiryNotification } from "@/server/enquiry-email";
import { getClientIp, isRateLimited } from "@/server/rate-limit";
import { isEmailSuppressed } from "@/server/suppression";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().toLowerCase().max(254),
  company: z.string().trim().max(150).optional(),
  service: z.enum(EnquiryService),
  budget: z.enum(EnquiryBudget).optional(),
  message: z.string().trim().min(10).max(5000),
  // Hidden field that people never see. Bots fill it in.
  website: z.string().optional(),
});

const thankYou = "Thanks for getting in touch. We'll reply within 24 hours.";

// This route saves a contact form enquiry, emails it to the company inbox and sends the person a confirmation
// POST /api/contact
export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`contact:${getClientIp(request)}`, 5, 60)) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "You've sent a few messages already. Please wait an hour or email contact@syntiqhq.com.",
        },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Please add your name, a valid email, what you need and a message of at least 10 characters.",
        },
        { status: 400 },
      );
    }

    const { website, company, ...details } = result.data;

    // Bots get the same reply as people, so they can't tell they were caught
    if (website) {
      return NextResponse.json({ message: thankYou }, { status: 201 });
    }

    const enquiry = await prisma.enquiry.create({
      data: { ...details, company: company || null },
    });

    const notified = await sendEnquiryNotification(enquiry);

    if (notified) {
      await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { notifiedAt: new Date() },
      });
    }

    // Not outreach, but we still never email anyone on the do-not-contact list
    if (!(await isEmailSuppressed(enquiry.email))) {
      await sendEnquiryConfirmation(enquiry);
    }

    return NextResponse.json({ message: thankYou }, { status: 201 });
  } catch (error) {
    console.error("Contact form failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Your message couldn't be sent. Please email contact@syntiqhq.com instead.",
      },
      { status: 500 },
    );
  }
}
