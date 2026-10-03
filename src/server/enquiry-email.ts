import type { Enquiry } from "@/generated/prisma/client";

const serviceLabels: Record<Enquiry["service"], string> = {
  NEW_WEBSITE: "New website",
  BOOKING: "Booking & intake",
  REDESIGN: "Redesign current site",
  APP: "Web or mobile app",
  CARE: "Monthly care & support",
  OTHER: "Something else",
};

const budgetLabels: Record<NonNullable<Enquiry["budget"]>, string> = {
  UNDER_5K: "Under $5,000",
  FROM_5K_TO_10K: "$5,000 – $10,000",
  FROM_10K_TO_25K: "$10,000 – $25,000",
  OVER_25K: "Over $25,000",
  NOT_SURE: "Not sure yet",
};

const inbox = process.env.CONTACT_INBOX_EMAIL ?? "contact@syntiqhq.com";

// Emails a new enquiry to the company inbox. Replying goes straight to the person who sent it.
export function sendEnquiryNotification(enquiry: Enquiry) {
  const text = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Company: ${enquiry.company ?? "Not given"}`,
    `Looking for: ${serviceLabels[enquiry.service]}`,
    `Budget: ${enquiry.budget ? budgetLabels[enquiry.budget] : "Not given"}`,
    "",
    enquiry.message,
  ].join("\n");

  return sendEmail({
    to: inbox,
    replyTo: enquiry.email,
    subject: `New enquiry from ${enquiry.name}: ${serviceLabels[enquiry.service]}`,
    text,
  });
}

// Lets the person know their message arrived. It never repeats their message, because anyone can
// type someone else's email into the form and we don't want it used to send them arbitrary text.
export function sendEnquiryConfirmation(enquiry: Enquiry) {
  const firstName = enquiry.name.split(" ")[0];

  const text = [
    `Hi ${firstName},`,
    "",
    "Thanks for getting in touch with SyntiqHQ. Your message reached us, and Francis will reply within 24 hours.",
    "",
    "If you think of anything else in the meantime, just reply to this email.",
    "",
    "SyntiqHQ",
    "https://syntiqhq.com",
  ].join("\n");

  return sendEmail({
    to: enquiry.email,
    replyTo: inbox,
    subject: "We've got your message",
    text,
  });
}

// Sends a plain-text email through Resend. Returns false instead of throwing,
// so a failed email never stops the enquiry from being saved.
async function sendEmail(email: { to: string; replyTo: string; subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error("Email not sent: RESEND_API_KEY or CONTACT_FROM_EMAIL is missing.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email.to,
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
      }),
    });

    if (!response.ok) {
      console.error("Email not sent:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email not sent:", error);
    return false;
  }
}
