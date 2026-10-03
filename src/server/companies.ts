import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  CompanySize,
  Industry,
  OpportunityLevel,
  WebsiteStatus,
} from "@/generated/prisma/enums";

const optionalText = z.string().trim().max(5000).nullable().optional();
const optionalUrl = z
  .url({ protocol: /^https?$/ })
  .trim()
  .nullable()
  .optional();

export const companySchema = z.object({
  name: z
    .string({ error: "Company name is required" })
    .trim()
    .min(1, "Company name is required")
    .max(200),
  website: optionalUrl,
  domain: optionalText,
  industry: z.enum(Industry).nullable().optional(),
  country: optionalText,
  city: optionalText,
  companySize: z.enum(CompanySize).optional(),
  websiteStatus: z.enum(WebsiteStatus).optional(),
  websiteOpportunity: z.enum(OpportunityLevel).optional(),
  description: optionalText,
  linkedinUrl: optionalUrl,
  phone: optionalText,
  source: optionalText,
  sourceUrl: optionalUrl,
  notes: optionalText,
});

// "https://www.northstar.com/about" -> "northstar.com"
export function getDomain(website: string) {
  return new URL(website).hostname.replace(/^www\./, "");
}

// "Northstar Consulting" -> "northstar-consulting", or "northstar-consulting-2" if taken
export async function createUniqueSlug(name: string) {
  const baseSlug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company";

  let slug = baseSlug;
  let number = 2;

  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${number}`;
    number++;
  }

  return slug;
}
