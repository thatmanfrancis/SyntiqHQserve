import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  LeadStatus,
  OutreachChannel,
  OutreachType,
} from "@/generated/prisma/enums";
import { isEmailSuppressed } from "@/server/suppression";

// The follow-up sequence from the brief: Day 0, 3, 7 and 14, then stop.
export const SEQUENCE = [
  { step: 0, type: "INITIAL", day: 0, label: "Initial email" },
  { step: 1, type: "REMINDER", day: 3, label: "Reminder" },
  { step: 2, type: "FOLLOW_UP", day: 7, label: "Follow-up with a new observation" },
  { step: 3, type: "BREAKUP", day: 14, label: "Close-the-loop email" },
] as const;

export const outreachSchema = z.object({
  contactId: z.string().min(1).nullable().optional(),
  channel: z.enum(OutreachChannel).optional(),
  type: z.enum(OutreachType).optional(),
  sequenceStep: z.number().int().min(0).max(3).nullable().optional(),
  subject: z.string().trim().max(300).nullable().optional(),
  body: z.string().trim().max(20000).nullable().optional(),
  reviewUrl: z.url({ protocol: /^https?$/ }).trim().nullable().optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
});

export const createOutreachSchema = outreachSchema.extend({
  leadId: z.string({ error: "Lead is required" }).min(1),
  // Use SENT to log something you've already sent, e.g. a LinkedIn message
  status: z.enum(["DRAFT", "SCHEDULED", "SENT"]).optional(),
});

export const editOutreachSchema = outreachSchema.extend({
  // SENT is only set through the send route
  status: z.enum(["DRAFT", "SCHEDULED", "CANCELLED"]).optional(),
});

// Returns a reason if this person must not be contacted, or null if it's fine.
export async function getOptOutReason(
  leadStatus: LeadStatus,
  contact: { status: string; email: string | null } | null,
) {
  if (leadStatus === "DO_NOT_CONTACT") {
    return "This lead is marked Do Not Contact.";
  }
  if (contact?.status === "UNSUBSCRIBED") {
    return "This contact has unsubscribed.";
  }
  if (contact?.email && (await isEmailSuppressed(contact.email))) {
    return "This email is on the do-not-contact list.";
  }
  return null;
}

const statusesBeforeReply: LeadStatus[] = [
  "RESEARCHING",
  "QUALIFIED",
  "AUDIT_READY",
  "CONTACTED",
  "FOLLOW_UP_1",
  "FOLLOW_UP_2",
];

// True while the lead is still in the early pipeline (they haven't replied yet)
export function isBeforeReply(status: LeadStatus) {
  return statusesBeforeReply.includes(status);
}

// Only moves a lead forward through the early pipeline, never backwards
// and never once they've replied or gone further.
export function moveLeadForward(current: LeadStatus, target: LeadStatus) {
  const currentIndex = statusesBeforeReply.indexOf(current);
  const targetIndex = statusesBeforeReply.indexOf(target);
  if (currentIndex === -1 || targetIndex === -1) return current;
  return targetIndex > currentIndex ? target : current;
}

const statusAfterStep: Record<number, LeadStatus> = {
  0: "CONTACTED",
  1: "FOLLOW_UP_1",
  2: "FOLLOW_UP_2",
  3: "FOLLOW_UP_2",
};

const channelNames: Record<OutreachChannel, string> = {
  EMAIL: "Email",
  LINKEDIN: "LinkedIn message",
  PHONE: "Call",
  OTHER: "Message",
};

// Marks an outreach as sent and updates the lead: contacted dates, pipeline status
// and when the next follow-up in the sequence is due.
export async function markOutreachSent(outreachId: string, userId: string) {
  const sentAt = new Date();

  const outreach = await prisma.outreach.update({
    where: { id: outreachId },
    data: { status: "SENT", sentAt },
    include: { lead: { include: { company: { select: { name: true } } } } },
  });

  const lead = outreach.lead;
  const firstContactedAt = lead.firstContactedAt ?? sentAt;
  const step = outreach.sequenceStep;

  let status = moveLeadForward(lead.status, "CONTACTED");
  let nextAction = lead.nextAction;
  let nextActionAt = lead.nextActionAt;

  if (step !== null) {
    status = moveLeadForward(lead.status, statusAfterStep[step]);
    const nextStep = SEQUENCE[step + 1];

    if (nextStep) {
      nextAction = `Send ${nextStep.label.toLowerCase()}`;
      nextActionAt = new Date(
        firstContactedAt.getTime() + nextStep.day * 24 * 60 * 60 * 1000,
      );
    } else {
      nextAction = "No reply after the final email. Mark as lost or revisit later.";
      nextActionAt = null;
    }
  }

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      firstContactedAt,
      lastContactedAt: sentAt,
      status,
      nextAction,
      nextActionAt,
    },
  });

  await prisma.activityLog.create({
    data: {
      type: "OUTREACH_SENT",
      description: `${channelNames[outreach.channel]} to ${lead.company.name}${outreach.subject ? `: "${outreach.subject}"` : ""}`,
      userId,
      companyId: lead.companyId,
      contactId: outreach.contactId,
      leadId: lead.id,
      metadata: { outreachId: outreach.id, sequenceStep: step },
    },
  });

  return prisma.outreach.findUniqueOrThrow({ where: { id: outreachId } });
}

// Leads whose next sequence email is due today or overdue, with which step to send next.
// Leads that replied, unsubscribed or finished the sequence are left out.
export async function getFollowUpsDue() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const leads = await prisma.lead.findMany({
    where: {
      status: { in: ["CONTACTED", "FOLLOW_UP_1", "FOLLOW_UP_2"] },
      nextActionAt: { lte: endOfToday },
      company: { archivedAt: null },
      OR: [
        { contactId: null },
        { contact: { status: { not: "UNSUBSCRIBED" } } },
      ],
    },
    orderBy: { nextActionAt: "asc" },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, fullName: true, email: true } },
      outreach: {
        where: { sequenceStep: { not: null }, sentAt: { not: null } },
        orderBy: { sentAt: "desc" },
        take: 1,
        select: { sequenceStep: true, sentAt: true },
      },
    },
  });

  return leads
    .map((lead) => {
      const lastSent = lead.outreach[0];
      if (!lastSent || lastSent.sequenceStep === null) return null;

      const nextStep = SEQUENCE[lastSent.sequenceStep + 1];
      if (!nextStep || !lead.nextActionAt) return null;

      return {
        leadId: lead.id,
        company: lead.company,
        contact: lead.contact,
        nextStep: nextStep.step,
        nextStepLabel: nextStep.label,
        lastSentAt: lastSent.sentAt,
        dueAt: lead.nextActionAt,
        isOverdue: lead.nextActionAt < startOfToday,
      };
    })
    .filter((followUp) => followUp !== null);
}
