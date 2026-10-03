import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { LeadPriority, LeadStatus } from "@/generated/prisma/enums";

export const leadSchema = z.object({
  contactId: z.string().min(1).nullable().optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  status: z.enum(LeadStatus).optional(),
  priority: z.enum(LeadPriority).optional(),
  leadScore: z.number().int().min(0).max(100).nullable().optional(),
  buyingSignal: z.string().trim().max(1000).nullable().optional(),
  buyingSignalUrl: z
    .url({ protocol: /^https?$/ })
    .trim()
    .nullable()
    .optional(),
  estimatedValue: z.number().min(0).nullable().optional(),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter code like USD")
    .optional(),
  nextAction: z.string().trim().max(500).nullable().optional(),
  nextActionAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const createLeadSchema = leadSchema.extend({
  companyId: z.string({ error: "Company is required" }).min(1),
});

// Makes sure the contact belongs to the lead's company and the assigned user exists.
// Returns an error message, or null if everything is fine.
export async function checkLeadLinks(
  companyId: string,
  contactId?: string | null,
  assignedToId?: string | null,
) {
  if (contactId) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });
    if (!contact || contact.companyId !== companyId) {
      return "Contact not found for this company.";
    }
  }

  if (assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });
    if (!assignedUser || !assignedUser.isActive) {
      return "Assigned user not found.";
    }
  }

  return null;
}

// Makes sure the company and lead exist, and that the lead belongs to the company.
// When only a lead is given, the company is taken from the lead.
export async function checkCompanyAndLead(
  companyId: string | null | undefined,
  leadId: string | null | undefined,
) {
  if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return { error: "Lead not found.", companyId: null };
    }
    if (companyId && companyId !== lead.companyId) {
      return {
        error: "That lead belongs to a different company.",
        companyId: null,
      };
    }
    return { error: null, companyId: lead.companyId };
  }

  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return { error: "Company not found.", companyId: null };
    }
    return { error: null, companyId };
  }

  return { error: null, companyId: null };
}
