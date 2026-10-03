import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { LeadStatus, ProposalStatus } from "@/generated/prisma/enums";

export const proposalSchema = z.object({
  title: z.string({ error: "Title is required" }).trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  amount: z.number({ error: "Amount is required" }).min(0),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter code like USD")
    .optional(),
  validUntil: z.coerce.date().nullable().optional(),
  documentUrl: z
    .url({ protocol: /^https?$/, error: "Document link must start with https://" })
    .trim()
    .nullable()
    .optional(),
});

export const createProposalSchema = proposalSchema.extend({
  companyId: z.string().min(1).nullable().optional(),
  leadId: z.string().min(1).nullable().optional(),
});

export const editProposalSchema = proposalSchema.partial().extend({
  status: z.enum(ProposalStatus).optional(),
});

// Lead statuses that come before a proposal. Sending a proposal moves these leads to PROPOSAL_SENT.
export const statusesBeforeProposal: LeadStatus[] = [
  "RESEARCHING",
  "QUALIFIED",
  "AUDIT_READY",
  "CONTACTED",
  "FOLLOW_UP_1",
  "FOLLOW_UP_2",
  "REPLIED",
  "MEETING_BOOKED",
];

// Proposal numbers look like SYN-2026-0001 and count up within each year
export async function createProposalNumber() {
  const prefix = `SYN-${new Date().getFullYear()}-`;

  const latest = await prisma.proposal.findFirst({
    where: { proposalNumber: { startsWith: prefix } },
    orderBy: { proposalNumber: "desc" },
  });

  const lastNumber = latest
    ? Number(latest.proposalNumber.slice(prefix.length))
    : 0;

  return prefix + String(lastNumber + 1).padStart(4, "0");
}
