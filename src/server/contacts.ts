import { z } from "zod";
import { ContactRole } from "@/generated/prisma/enums";

const optionalText = z.string().trim().max(5000).nullable().optional();

export const contactSchema = z.object({
  firstName: z
    .string({ error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(100),
  lastName: z.string().trim().max(100).nullable().optional(),
  email: z.email().trim().toLowerCase().nullable().optional(),
  phone: optionalText,
  jobTitle: optionalText,
  role: z.enum(ContactRole).optional(),
  linkedinUrl: z.url({ protocol: /^https?$/ }).trim().nullable().optional(),
  // UNSUBSCRIBED is only set by the unsubscribe flow, never by hand
  status: z.enum(["ACTIVE", "INACTIVE", "UNKNOWN"]).optional(),
  isPrimary: z.boolean().optional(),
  notes: optionalText,
});

export function getFullName(firstName: string, lastName?: string | null) {
  return lastName ? `${firstName} ${lastName}` : firstName;
}