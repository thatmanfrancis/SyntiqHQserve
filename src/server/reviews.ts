import { randomBytes } from "node:crypto";
import { z } from "zod";

const optionalText = z.string().trim().max(10000).nullable().optional();

const pointSchema = z.object({
  title: z
    .string({ error: "Each observation needs a title" })
    .trim()
    .min(1, "Each observation needs a title")
    .max(200),
  description: z
    .string({ error: "Each observation needs a description" })
    .trim()
    .min(1, "Each observation needs a description")
    .max(5000),
  category: z.string().trim().max(100).nullable().optional(),
  recommendation: optionalText,
});

export const reviewSchema = z.object({
  leadId: z.string().min(1).nullable().optional(),
  title: z.string().trim().max(200).nullable().optional(),
  // PUBLISHED is only set through the publish route
  status: z.enum(["DRAFT", "READY", "ARCHIVED"]).optional(),
  introduction: optionalText,
  videoUrl: z
    .url({ protocol: /^https$/, error: "Video link must start with https://" })
    .trim()
    .nullable()
    .optional(),
  videoProvider: z.string().trim().max(50).nullable().optional(),
  conclusion: optionalText,
  ctaText: z.string().trim().max(200).nullable().optional(),
  // mailto: is allowed so the CTA can open an email to Francis
  ctaUrl: z
    .url({
      protocol: /^(https?|mailto)$/,
      error: "CTA link must start with https:// or mailto:",
    })
    .trim()
    .nullable()
    .optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  // The full list of observations, in display order
  points: z.array(pointSchema).max(20).optional(),
});

export const createReviewSchema = reviewSchema.extend({
  companyId: z.string({ error: "Company is required" }).min(1),
});

// A random, unguessable token used in the public review link
export function createReviewSlug() {
  return randomBytes(16).toString("base64url");
}

export function getReviewUrl(slug: string) {
  const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://syntiqhq.com";
  return `${siteUrl}/review/${slug}`;
}
