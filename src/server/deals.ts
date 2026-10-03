import { z } from "zod";
import { DealStatus } from "@/generated/prisma/enums";

export const dealSchema = z.object({
  title: z.string().trim().min(1, "Title can't be empty").max(200).optional(),
  value: z.number({ error: "Value is required" }).min(0),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter code like USD")
    .optional(),
  expectedCloseAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const createDealSchema = dealSchema.extend({
  leadId: z.string({ error: "Lead is required" }).min(1),
});

export const editDealSchema = dealSchema.partial().extend({
  status: z.enum(DealStatus).optional(),
});
