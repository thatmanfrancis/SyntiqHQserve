# MASTER PROJECT BRIEF — SYNTIQHQ

> **Every AI agent / developer must read this file before making any change to this repository.**
> It defines what SyntiqHQ is, what we are building, and the order we build it in.

---

## 0. CURRENT FOCUS (READ FIRST)

**We are building the BACKEND first. No frontend work right now.**

- This repository (`syntiqhqserve`) is the **backend / server** for SyntiqHQ.
- Do **not** build admin UI pages, public review page UI, styling, or marketing website changes unless explicitly asked.
- Work is broken into **small, reviewable chunks**. Finish and verify one chunk before starting the next.
- Backend scope right now:
  - PostgreSQL + Prisma 7 schema, migrations, generated client
  - Database utility (`src/lib/prisma.ts` or equivalent)
  - Authentication (users, password hashing, sessions) — server side
  - Server-side data access / services for every entity
  - Validation of all inputs
  - API route handlers / server actions for CRUD and workflow operations
  - Suppression / unsubscribe logic (server side)
  - Review token generation, publish/expiry logic, view tracking (server side)
- Frontend sections in this brief (Sections 3–6, 52–57, 81 etc.) are **context only** for now, so the backend supports them later.

### Locked backend decisions

- **API style:** admin frontend will live in this same Next.js app, but the backend exposes **REST route handlers** (`src/app/api/...`) backed by a **service layer** (`src/server/...`) so Server Actions can reuse the same services later.
- **Auth:** password hashing with `bcryptjs` (cost 12); database-backed sessions (`Session` model, hashed token) in an httpOnly secure cookie; Next 16 `proxy.ts` for optimistic checks + authoritative checks in every admin handler/service.
- **Validation:** `zod`, one schema module per entity, used server-side for every input.
- **Industry:** Prisma enum from the brief's list (Section 71).
- **Unsubscribe:** random `unsubscribeToken` stored on `Contact`; suppression keyed by email.
- **Outreach types:** `INITIAL / FOLLOW_UP / REMINDER / BREAKUP / MANUAL / OTHER` + optional `sequenceStep` — no numbered follow-up enums/fields.
- **Prisma config file:** `prisma.config.ts` (not `prisma7.config.ts`), using `env("DATABASE_URL")`.

Backend chunk order (adapted from Section 79):

1. Foundation — confirm Next.js/Prisma versions, Prisma 7 config, schema, migration, client, db utility
2. Auth — User model, password hashing, sessions, route protection for `/admin/*` and admin APIs
3. Companies / Contacts / Leads — CRUD, search, filtering, status changes, activity logging
4. Reviews / ReviewPoints — CRUD, unpredictable token, publish, expiry, noindex flag, public read endpoint (published data only), view count
5. Outreach — records, follow-up tracking, templates, review + unsubscribe links, suppression check before send
6. Suppression — unsubscribe token endpoint, suppression table, do-not-contact logic
7. Tasks — CRUD, due dates, follow-ups due queries
8. Proposals / Deals — tracking, pipeline
9. Dashboard queries — pipeline metrics, follow-ups due, recent activity
10. Hardening — validation, error handling, security, performance

---

## 1. PROJECT OVERVIEW

I am building a digital product agency called **SyntiqHQ**.

### Brand
- **Brand name:** SyntiqHQ
- **Domain:** `syntiqhq.com`
- **Primary business email:** `francis@syntiqhq.com`
- **General contact email:** `contact@syntiqhq.com`
- **Founder/lead:** Francis
- **Location:** Nigeria
- **Market:** Global / international
- **Business model:** B2B digital product development agency
- **Primary objective:** Acquire international clients and earn revenue in USD.

SyntiqHQ is intended to look like a serious international digital product studio rather than a generic local freelance web-development business.

The agency should be able to work with businesses across different industries. Healthcare was initially considered as a target vertical, but **SyntiqHQ is NOT a healthcare-only agency**.

Potential industries: Healthcare, SaaS, Real Estate, Professional Services, Finance, Education, Hospitality, E-commerce, Construction, Logistics, Technology, Travel, Marketing, Legal, Other.

The website should communicate broad capability while allowing targeted outreach campaigns by industry.

---

## 2. WHY SYNTIQHQ EXISTS

The agency is being created as an independent business to build my own client pipeline and stop relying entirely on employment/contract work.

The objective is not simply "We make websites." It is to position SyntiqHQ as a technical partner that helps businesses improve how they present themselves and operate digitally.

Eventually sellable: website design/development, redesigns, web apps, mobile apps, product development, ongoing support, graphics/design, animation/motion, more later.

**Do not overbuild the service offering immediately.** Initial core services:

1. Websites & website redesigns
2. Web applications
3. Mobile applications
4. Ongoing support/improvements

---

## 3. BRAND DIRECTION

- Dark / near-black background
- Off-white text
- Electric/cobalt blue accent, primary approximately `#2563EB`
- Minimal, premium, modern, calm, technical, professional, international

Should feel like a **premium digital product studio**, not a template marketplace or cheap freelance portfolio.

Avoid: excessive gradients, flashy animations, fake statistics, fake testimonials, fake client logos, fake awards, fake case-study results, generic AI marketing language, buzzwords, "10x your business" claims. Everything should feel believable.

---

## 4. CURRENT WEBSITE

Built in Next.js, deployed at `https://syntiq-hq.vercel.app/`. Production domain: `https://syntiqhq.com`.

- **Hero:** "Websites that reflect the true caliber of your business." Supporting text targets law practices, clinics, consultancies. CTAs: Start a Conversation, Explore Our Work.
- **Services:** Websites & redesigns; Web & mobile applications; Support & improvements.
- **Selected work:** Hausevo (property platform), Evalocal (client project), Healthcare design exploration.
- **Process:** Currently says "finished product in four weeks" — should become: "Most website projects take approximately 4–6 weeks depending on scope, integrations, content and feedback." Do not promise four weeks universally.
- **Pricing:** Firm Flagship — website projects from **$5,000 USD**; Intake Upgrade — improvements to an existing digital experience; Ongoing Care Retainer — from about **$500/month**; web/mobile apps quoted by scope. Keep this structure unless there is a strong reason.
- **FAQ:** Clients work directly with Francis. Based in Nigeria, working remotely/worldwide.
- **Footer:** "Thoughtful websites. Useful apps. A partner for what comes next." / "Based in Nigeria. Working worldwide."

---

## 5. WEBSITE POSITIONING CHANGE

Current positioning is too narrow (law firms, clinics, consultancies). Position around **digital products for businesses**; industry-specific targeting happens in outreach.

- **Hero:** "Digital products for businesses ready to grow."
- **Supporting copy:** "SyntiqHQ designs and engineers high-performing websites, web applications and mobile products for businesses that want their digital presence to match the quality of what they do."
- **Service labels:** Websites · Web Apps · Mobile Apps
- **Industries further down:** Healthcare · Professional Services · Technology · Real Estate · Hospitality · E-commerce · Education · etc.

---

## 6. WEBSITE TRUST REQUIREMENTS

A prospect receiving an email from `francis@syntiqhq.com` should be able to: open the site, understand what SyntiqHQ does, see real work, understand services and process, see it works internationally, find a clear contact path, feel it is legitimate, see professional branding, and know a real technical person is behind it.

Do NOT fabricate: clients, testimonials, reviews, revenue, team members, case-study metrics, awards, certifications, partnerships.

---

## 7. EMAIL INFRASTRUCTURE

- `francis@syntiqhq.com` — cold outreach, client conversations, proposals, business communication.
- `contact@syntiqhq.com` — general enquiries, website contact forms.

Current setup has involved Cloudflare DNS/Email Routing and ZeptoMail. **ZeptoMail is transactional email infrastructure, not a human mailbox.** `francis@syntiqhq.com` should be a real mailbox that sends and receives. Do not assume ZeptoMail provides an inbox.

---

## 8. PAYMENT INFRASTRUCTURE

Nomba has been considered for international payments. Keep infrastructure cheap until revenue.

**Do not build payment processing into the CRM.** The CRM is for sales and lead management, not accounting. Later, separate modules may be added for Clients, Projects, Contracts, Invoices, Payments, Expenses — do not mix them into the initial prospecting CRM.

---

## 9. THE CORE BUSINESS ENGINE

The most important part is the **prospecting → personalized audit → outreach → follow-up → meeting → proposal → client** pipeline.

The system should help me: find businesses, research them, store prospects, identify decision makers, analyze their website, create personalized review pages, generate outreach information, track emails, follow-ups, replies, meetings, proposals, deals, and prevent contacting people who opted out.

---

## 10. PROSPECTING STRATEGY

Sources: Google, Google Maps, LinkedIn, company directories, government/company registries, startup databases, industry directories, search engines.

Search pattern: **industry + city/country** (e.g. "law firms Toronto", "private clinics London", "SaaS companies Manchester").

Not mass email. **Highly personalized outbound**: ~5–10 prospects/day, later 10–20/day.

---

## 11. IDEAL PROSPECT

Generally **5–200 employees**. More important: money, a real business, meaningful digital presence, reachable decision maker, website/product opportunity, need for development, signs of growth.

Buying signals: new location, expansion, hiring, new product/service, funding, rebrand, new leadership, new market, poor/outdated website, major growth, new digital initiative.

---

## 12. DECISION MAKERS

Founder, CEO, Managing Director, Director, Head of Marketing, Head of Digital, CTO, COO.

Store: name, email, phone, job title, LinkedIn, role, primary contact flag. Multiple contacts per company.

---

## 13. WEBSITE AUDIT PROCESS

Identify **real opportunities**, don't insult the prospect.

- **Design:** visual quality, layout, branding consistency, typography, hierarchy
- **Mobile:** responsiveness, navigation, touch targets, usability
- **Performance:** page speed, large images, unnecessary scripts, loading
- **UX:** navigation, information architecture, clarity, user journey
- **Conversion:** CTA clarity, contact flow, booking flow, lead capture, trust signals
- **Accessibility:** contrast, typography, keyboard usability, semantic structure
- **Trust:** social proof, contact info, professional presentation, clear services, credibility

Framing: "Where we see an opportunity", not "What's wrong with your website."

---

## 14. SECURITY LANGUAGE

Do NOT tell prospects their site has "security vulnerabilities" unless an authorized security assessment was performed. Discuss UX, performance, conversion, mobile, accessibility, design, technical improvements instead.

---

## 15. PERSONALIZED REVIEW PAGES

Each prospect gets a personalized review page, e.g. `syntiqhq.com/review/<unpredictable-token>`. Avoid predictable URLs like `/review/northstar-consulting`.

Review pages must be: noindex, not in site navigation, accessible only via the unique link, personalized.

---

## 16. REVIEW PAGE CONTENT

- **Header:** "A few ideas for [Company]"
- **Introduction:** personalized message
- **Video:** personalized 60–90s video (Loom or other). Store video URL + provider.
- **What we noticed:** ~3 observations (e.g. 01 Mobile experience, 02 Conversion path, 03 Trust/positioning)
- **What we'd change:** a recommendation per observation
- **CTA:** e.g. "If improving this is already on your roadmap, let's talk." Points to contact form, email, booking link, etc. CTA text and URL are customizable.

---

## 17. REVIEW DATA MODEL

A review belongs to: Company, Lead, Creator.

Fields: title, unique slug/token, status, introduction, video URL, video provider, conclusion, CTA text, CTA URL, published date, expiry date, view count, last viewed, noindex flag, public/private status.

Each review has multiple **ReviewPoints**: title, description, category, recommendation, sort order.

---

## 18. OUTREACH EMAIL

Example:

**Subject:** Quick idea for [Company]

> Hi [First Name],
>
> I came across [Company] while researching [industry] businesses in [city].
>
> I spent a few minutes going through the website and noticed three things I'd improve, particularly around the digital experience.
>
> I recorded a short walkthrough here:
>
> [Review Link]
>
> I'm Francis, lead engineer at SyntiqHQ. We design and build websites, web applications and mobile products for growing businesses.
>
> If improving the site is already on your roadmap, I'd be happy to discuss it.
>
> Either way, I hope the review is useful.
>
> Francis
> Lead Engineer
> SyntiqHQ
> syntiqhq.com
>
> P.S. If you'd rather not receive messages from me, just let me know.

The system should eventually generate personalized outreach from data in the prospect record.

---

## 19. FOLLOW-UP STRATEGY

- **Day 0:** initial outreach
- **Day 3:** short reminder
- **Day 7:** additional useful observation
- **Day 14:** close-the-loop message

Then stop. Do not endlessly email prospects.

---

## 20. COMPLIANCE / UNSUBSCRIBE

Every outbound email must have an opt-out, e.g. `syntiqhq.com/unsubscribe/[unique-token]`. Clicking shows "You're unsubscribed." No login required. The suppression is recorded.

Do not rely only on lead status — use a dedicated **Suppression** table. A suppressed email must never be selected for future outreach.

Compliance varies by jurisdiction (UK B2B rules on identification/opt-out; Canada's stricter commercial electronic messaging rules). Make opt-out easy and permanent. **Do not build anything designed to bypass anti-spam rules.**

---

## 21. INITIAL CRM / ADMIN PANEL

Replaces the spreadsheet. **Internal tool for SyntiqHQ, not a SaaS CRM.** Keep it focused; put everything in one place.

---

## 22. ADMIN MVP FEATURES

1. **Authentication:** email, password, session, user role, active/inactive status. Architecture should allow multiple internal users eventually.
2. **Dashboard:** total prospects, qualified, contacted, replies, meetings, proposals, won, lost, follow-ups due, reviews ready, reviews published. No vanity metrics.

---

## 23. PROSPECT MANAGEMENT

Create/edit/delete-archive company, add contacts, assign lead, change lead status, change priority, add notes, add buying signal, add source, add website analysis, create review, view outreach history, create tasks, create proposal, mark deal won/lost.

---

## 24. COMPANY FIELDS

Name, slug, website, domain, industry, country, city, company size, website status, website opportunity, description, LinkedIn, phone, lead source, source URL, notes, created, updated.

## 25. CONTACT FIELDS

Name, email, phone, job title, role, LinkedIn, status, primary contact, notes, created, updated. Multiple per company.

## 26. LEAD PIPELINE

```text
Researching
Qualified
Audit Ready
Contacted
Follow-up 1
Follow-up 2
Replied
Meeting Booked
Proposal Sent
Negotiating
Won
Lost
Not Interested
Do Not Contact
```

Status must be easy to update. A table is fine initially instead of Kanban.

## 27. LEAD PRIORITY

High, Medium, Low. A simple numeric `leadScore` — no AI scoring.

## 28. BUYING SIGNAL

Store buying signal + URL/source. Examples: hiring, expansion, new service, rebrand, funding, new location, new product.

## 29. OUTREACH TRACKING

Do NOT create `followUp1`, `followUp2`, `followUp3` fields. Every communication is an independent `Outreach` record (unlimited history).

Fields: lead, contact, channel, type, status, subject, body, review URL, unsubscribe URL, provider, provider message ID, sent, delivered, replied, bounced timestamps, error, created.

## 30. OUTREACH TYPES / CHANNELS

Types: Initial, Follow-up, Reminder, Breakup/close loop, Manual, Other.
Channels: Email, LinkedIn, Phone, Other (email primary initially).

## 31. TASKS

Fields: title, description, type, status, priority, due date, completed date, assigned user, company, lead.

- Statuses: Pending, In Progress, Completed, Cancelled
- Priorities: Low, Medium, High, Urgent
- Types: Research, Audit, Outreach, Follow-up, Meeting, Proposal, General

## 32. PROPOSALS

Fields: company, lead, created by, title, proposal number, status, description, amount, currency, valid until, document URL, sent, viewed, accepted dates.
Statuses: Draft, Sent, Viewed, Accepted, Rejected, Expired. No PDF generation initially.

## 33. DEALS

Fields: company, lead, title, status, value, currency, expected close date, closed date, notes.
Statuses: Open, Won, Lost. Sales-focused — no accounting.

## 34. SUPPRESSION

Fields: email (unique), reason, source, company name, unsubscribed date, notes.
**Before sending outreach, check whether the email is suppressed. If yes: do not send.**

## 35. ACTIVITY LOG

Examples: company created, contact created, lead status changed, review created/published, outreach sent, reply received, task completed, proposal sent, deal won/lost, contact unsubscribed.
Fields: activity type, description, user, company, contact, metadata JSON, created.

---

## 36. DATABASE ARCHITECTURE

Stack: **Next.js, PostgreSQL, Prisma ORM 7, TypeScript**. Relational and normalized.

Core entities: `User, Company, Contact, Lead, Review, ReviewPoint, Outreach, Task, Proposal, Deal, Suppression, ActivityLog`.

```text
Company
 ├── Contacts
 ├── Leads
 ├── Reviews
 ├── Outreach
 ├── Tasks
 ├── Proposals
 ├── Deals
 └── ActivityLogs

Lead
 ├── Company
 ├── Contact
 ├── Assigned User
 ├── Reviews
 ├── Outreach
 ├── Tasks
 ├── Proposal
 └── Deal

Review
 └── ReviewPoints
```

## 37. PRISMA 7 REQUIREMENTS

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Do NOT use `provider = "prisma-client-js"`. The database URL belongs in `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

`.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

## 38. PRISMA 7 DATABASE CONNECTION

Use the PostgreSQL driver adapter.

```bash
npm install @prisma/client@7 @prisma/adapter-pg pg dotenv
npm install -D prisma@7
```

```ts
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});
```

Use the project's existing `@/` alias if configured.

## 39. DATABASE ENUMS

`UserRole, CompanySize, WebsiteStatus, OpportunityLevel, LeadPriority, LeadStatus, ContactRole, ContactStatus, ReviewStatus, OutreachChannel, OutreachType, OutreachStatus, TaskStatus, TaskPriority, TaskType, ProposalStatus, DealStatus, ActivityType`. Use enums where values are controlled and predictable.

## 40. USER MODEL

`id, email, name, passwordHash, role, isActive, createdAt, updatedAt`. Relations: tasks, activity logs, reviews created, proposals created, assigned leads. Roles: `ADMIN`, `MEMBER`.

## 41. COMPANY MODEL

`id, name, slug, website, domain, industry, country, city, companySize, websiteStatus, websiteOpportunity, description, linkedinUrl, phone, source, sourceUrl, notes, createdAt, updatedAt`. Relations: contacts, leads, reviews, activities, tasks, proposals, deals.

## 42. CONTACT MODEL

`id, companyId, name, email, phone, jobTitle, role, linkedinUrl, status, isPrimary, notes, createdAt, updatedAt`. Relations: company, leads, outreach, activities.

## 43. LEAD MODEL

`id, companyId, contactId, assignedToId, status, priority, leadScore, buyingSignal, buyingSignalUrl, estimatedValue, currency, nextAction, nextActionAt, firstContactedAt, lastContactedAt, notes, createdAt, updatedAt`. Relations: company, contact, assignedUser, reviews, outreach, tasks, proposal, deal.

## 44. REVIEW MODEL

`id, companyId, leadId, createdById, title, slug, status, introduction, videoUrl, videoProvider, conclusion, ctaText, ctaUrl, isPublic, noIndex, publishedAt, expiresAt, viewCount, lastViewedAt, createdAt, updatedAt`. Relations: company, lead, createdBy, points.

## 45. REVIEW POINT MODEL

`id, reviewId, title, description, category, recommendation, order, createdAt, updatedAt`.

## 46. OUTREACH MODEL

`id, leadId, contactId, channel, type, status, subject, body, reviewUrl, unsubscribeUrl, provider, providerId, sentAt, deliveredAt, repliedAt, bouncedAt, errorMessage, createdAt, updatedAt`.

## 47. TASK MODEL

`id, title, description, type, status, priority, dueAt, completedAt, assignedToId, companyId, leadId, createdAt, updatedAt`.

## 48. PROPOSAL MODEL

`id, companyId, leadId, createdById, title, proposalNumber, status, description, amount, currency, validUntil, documentUrl, sentAt, viewedAt, acceptedAt, createdAt, updatedAt`.

## 49. DEAL MODEL

`id, companyId, leadId, title, status, value, currency, expectedCloseAt, closedAt, notes, createdAt, updatedAt`. A lead has at most one deal initially.

## 50. SUPPRESSION MODEL

`id, email (unique), reason, source, companyName, unsubscribedAt, notes, createdAt`.

## 51. ACTIVITY LOG MODEL

`id, type, description, userId, companyId, contactId, metadata (JSON), createdAt`.

---

## 52. INITIAL ADMIN NAVIGATION (frontend — later)

Dashboard, Prospects, Reviews, Outreach, Tasks, Proposals, Deals, Suppression, Settings. Do not create 20 unnecessary nav items.

## 53. PROSPECTS PAGE (backend must support these queries)

- Search
- Filter by: industry, country, company size, website status, opportunity, priority, lead status, assigned user
- Sort by: date, priority, score, next action
- Columns: Company, Industry, Location, Contact, Website Status, Opportunity, Priority, Lead Status, Score, Next Action, Updated

## 54. PROSPECT DETAIL PAGE (backend must provide this data)

Company info; contact info; lead info (status, priority, score, buying signal, estimated value, next action + date); reviews (status, URL, video); outreach timeline (emails, follow-ups, replies, bounces); tasks; proposal status; deal status/value; activity timeline.

## 55. REVIEW BUILDER FLOW

Create Review → Select Company → Select Lead → Introduction → Video → Observations #1–3 → Recommendations → CTA → Preview → Publish → Copy review URL.

## 56. REVIEW BUILDER

Dynamic review points (title, category, description, recommendation), "+ Add observation", reordering supported.

## 57. PUBLIC REVIEW PAGE UI (frontend — later)

```text
SyntiqHQ
────────────────────
A few ideas for [Company]
We spent some time reviewing your current digital experience...
[Video]
What we noticed
01 [Observation]
02 [Observation]
03 [Observation]
What we'd change
[Recommendations]
[CTA]
SyntiqHQ
Digital products for businesses ready to grow.
```

Responsive, premium, no admin UI visible.

## 58. REVIEW PRIVACY

- `<meta name="robots" content="noindex,nofollow" />` (or Next.js metadata equivalent)
- `noIndex = true` by default in the database
- Unpredictable identifiers/tokens for review URLs
- Support `expiresAt`; if expired, show an expired page instead of old content

## 59. UNSUBSCRIBE

Route `/unsubscribe/[token]`:

1. Validate token
2. Identify email
3. Add email to suppression table
4. Mark relevant contact/lead as do-not-contact if appropriate
5. Show confirmation ("You're unsubscribed.")

No account creation, no multi-step flow.

## 60. ADMIN AUTHENTICATION

- No plaintext passwords; secure password hashing
- Secure sessions
- Protect every admin route — no access to `/admin/*` (and admin APIs) without authentication
- Never expose Prisma/database credentials to the client
- All database mutations happen server-side

## 61. NEXT.JS ARCHITECTURE

Prefer the App Router. Potential structure (adjust to existing codebase):

```text
src/
  app/
    (public)/
      page.tsx
      review/[slug]/page.tsx
      unsubscribe/[token]/page.tsx
    admin/
      layout.tsx
      page.tsx
      prospects/ reviews/ outreach/ tasks/ proposals/ deals/ suppression/ settings/
    api/
      ...
  components/
    ui/ admin/ reviews/ forms/
  lib/
    prisma.ts
    auth/
    validations/
    utils/
  generated/
    prisma/
```

**Before modifying the project, inspect the existing repository and preserve useful existing code rather than replacing everything.**

## 62. TECHNICAL PRINCIPLES

TypeScript, Next.js App Router, PostgreSQL, Prisma 7, server-side DB operations, Server Actions / Route Handlers where appropriate, proper validation, proper error handling, responsive and accessible UI (when UI is built). Keep code understandable. No unnecessary libraries. Don't overengineer simple CRUD.

## 63. VALIDATION

Validate emails, URLs, required company fields, lead status, dates, currency, proposal amounts, review data, outreach data. Use one consistent validation approach throughout.

## 64. SECURITY

- Never expose database credentials or password hashes
- Never trust client input; validate server-side
- Protect admin routes; prevent unauthorized mutations and review editing
- Sanitize/validate URLs
- Protect unsubscribe from abuse where appropriate
- Public review routes expose **only intentionally published review data** — never private CRM information

## 65. SEARCH / FILTERING

Must eventually answer queries like:

- "All high-priority healthcare prospects in Canada whose websites are outdated and who haven't been contacted."
- "All prospects requiring follow-up today."
- "All review pages that are drafted but haven't been published."

Filtering must be built into the data model from the beginning.

## 66. DASHBOARD

Cards: Total Prospects, Contacted, Replies, Meetings, Proposals, Won.
Sections: follow-ups due today; recent activity (review published, outreach sent, reply received, proposal sent); pipeline counts (Researching → Qualified → Audit Ready → Contacted → Replied → Meeting → Proposal → Negotiating → Won).

## 67. DO NOT OVERBUILD

First version is an **internal sales/lead-management tool**. Do NOT build initially: AI lead scoring, AI scraping, mass scraping, mass email infrastructure, complex marketing automation, accounting, invoicing, payroll, client portal, complex permissions, multi-tenant SaaS, advanced analytics, complex workflow automation, huge CRM feature sets, AI-generated audits, AI-generated proposals.

First make **Research → Review → Outreach → Follow-up → Meeting → Proposal → Deal** extremely easy.

## 68. FUTURE FEATURES

- Client management: Client, Project, Contract, Invoice, Payment, Expense
- Email provider integration
- Calendar / meeting scheduling
- AI assistance (research, audit help, email personalization, follow-up suggestions, proposals) — assists, never replaces judgment
- Analytics: reply/meeting/proposal/close rates, revenue by industry/country, outreach performance

## 69. SALES FUNNEL

```text
Find business → Research → Create company → Add decision maker → Evaluate website
→ Qualify lead → Create personalized review → Publish review → Send personalized email
→ Track outreach → Follow up → Receive reply → Book meeting → Send proposal
→ Negotiate → Win deal → Convert to client
```

Unsubscribe path: `Email → Unsubscribe → Suppression → DO NOT CONTACT`.

## 70. SPREADSHEET REPLACEMENT

Old spreadsheet columns: Lead ID, Company, Industry, Country, City, Website, Company Size, Website Status, Website Opportunity, Decision Maker, Job Title, LinkedIn, Email, Lead Source, Lead Score, Priority, Audit Video, Outreach Status, Date Contacted, Follow-up 1, Follow-up 2, Last Contact, Response, Next Action, Deal Value, Notes.

**Do not recreate this as one giant table.** Normalize into Company, Contact, Lead, Review, Outreach, Task, Proposal, Deal, Suppression, ActivityLog.

## 71. DROPDOWN VALUES

- **Industry:** Healthcare, SaaS, Real Estate, Professional Services, Finance, Education, Hospitality, E-commerce, Construction, Logistics, Technology, Travel, Marketing, Legal, Other
- **Website Status:** No Website, Poor, Outdated, Average, Good, Excellent
- **Priority:** High, Medium, Low
- **Outreach Status:** Not Contacted, Researching, Audit Ready, Contacted, Follow-up 1, Follow-up 2, Replied, Meeting Booked, Proposal Sent, Negotiating, Won, Lost, Not Interested, Do Not Contact

Enums may be slightly improved, but don't lose these business concepts.

## 72. CASE STUDIES

Hausevo (property/real-estate platform), Evalocal (client project), Healthcare design exploration (concept). Be honest whether something is client work, personal project, concept, or exploration. Never present a concept as paid client work.

## 73. DOMAIN

Production: `https://syntiqhq.com`. Temporary: `https://syntiq-hq.vercel.app/`. When connecting: HTTPS works, `www` behavior intentional, DNS correct, email DNS not broken, contact form works, production env vars correct.

## 74. CONTACT FORM

Fields: Name, Company, Email, What do you need?, Message. Goes to the company inbox. Must not expose internal DB info. Eventually enquiries may become prospects/leads in the admin.

## 75. ANALYTICS

Once the website is stable: page views, traffic source, key CTA clicks, contact submissions, review-page visits. Don't overbuild.

## 76. REVIEW-PAGE ANALYTICS

`viewCount` and `lastViewedAt` answer "Did the prospect open the review?" Keep it simple, not invasive.

## 77. OUTREACH PHILOSOPHY

Not "send as many emails as possible" — "send fewer, more relevant messages that demonstrate actual thought." Each message should answer: Why this company? Why now? What did we notice? Why should they care? What can they do next? The personalized review is the main differentiator.

## 78. INTERNAL ADMIN EXPERIENCE

Morning: open dashboard → see follow-ups due, prospects awaiting audit, replies, meetings today. Click a prospect → see everything. Create review with 3 observations → publish → copy link → outreach → system shows who needs follow-up → record reply → create proposal → mark deal won. This is the core product.

## 79. DEVELOPMENT APPROACH (original full phases)

Build incrementally — never everything at once.

1. **Foundation** — inspect project, confirm Next.js / TypeScript / styling, configure PostgreSQL + Prisma 7, schema, migration, generate client, db utility
2. **Authentication** — admin login, sessions, protected admin layout, User model
3. **Admin shell** — sidebar, header, dashboard, navigation *(frontend — deferred)*
4. **Companies / Prospects** — Company, Contact, Lead CRUD, search, filtering, status changes
5. **Reviews** — Review + ReviewPoint CRUD, builder, preview, publish, public page, noindex, unique token
6. **Outreach** — history, follow-up tracking, templates, review links, unsubscribe links
7. **Suppression** — unsubscribe route, suppression table, do-not-contact logic
8. **Tasks** — create, due dates, follow-ups, dashboard reminders
9. **Proposals / Deals** — tracking, pipeline
10. **Polish** — search, filters, empty/loading/error states, responsiveness, accessibility, security, performance

See Section 0 for the current backend-first ordering.

## 80. IMPORTANT DEVELOPMENT RULE

**Inspect the existing repository before writing code.** Do not assume it is empty. Identify existing routes, components, styling, UI components, database setup, env vars, auth, form components, package versions. Integrate into the existing architecture. Do not unnecessarily rewrite the public website.

## 81. ADMIN DESIGN (frontend — later)

Same brand language (dark/near-black, off-white, cobalt blue, clean typography, minimal, strong spacing, subtle borders), but usability over marketing aesthetics — a professional internal operations tool.

## 82. TWO PRODUCTS — DO NOT MIX CONCERNS

1. **Public SyntiqHQ website** — convince prospects SyntiqHQ is a credible digital product agency (marketing-focused).
2. **Internal SyntiqHQ admin panel** — acquire and manage clients efficiently (operations/sales-focused).

## 83. SUCCESS CRITERIA

Without a spreadsheet, I can:

```text
Create prospect → Add contact → Qualify prospect → Record website observations
→ Create personalized review → Publish review → Copy review URL → Prepare outreach
→ Track outreach → Track follow-up → Record reply → Schedule/record meeting
→ Create proposal → Track deal → Mark won/lost → Suppress unsubscribed contacts
```

If that workflow works smoothly, the MVP is successful.

## 84. WHAT THE AI SHOULD DO

You are the development AI for SyntiqHQ. **Actually build it**, don't just explain.

1. Inspect the existing project structure
2. Identify Next.js version and dependencies
3. Identify whether Prisma is installed
4. Identify whether PostgreSQL is configured
5. Identify existing authentication
6. Identify the existing UI/design system
7. Identify existing public routes/components
8. Identify what should be preserved
9. Compare the project against this spec
10. Create a practical implementation plan
11. Implement in logical phases (backend first — see Section 0)

Don't ask unnecessary questions when reasonable defaults exist. If a decision is genuinely needed, explain it and give the recommended implementation. No unnecessary features. Prioritize a working MVP.

## 85. CODING RULES

- TypeScript, Next.js App Router, PostgreSQL, Prisma 7 (current architecture)
- Server/database logic stays server-side
- Proper validation; handle loading, error and empty states
- Modular components, no giant files, no duplicate logic
- No unnecessary dependencies; reusable UI components
- Responsive admin and public review pages (when UI is built)
- Protect private routes; never expose secrets; no hardcoded production credentials; use env vars
- Never fabricate business data
- Don't over-engineer

## 86. MOST IMPORTANT PRODUCT PRINCIPLE

The application should make me **faster at selling SyntiqHQ**. Evaluate every feature against:

> Does this help me find prospects, understand them, personalize outreach, follow up, close deals, or avoid contacting people who opted out?

If not, it probably doesn't belong in the first version.

---

## START HERE (for each new work session)

1. Re-read Section 0 (current focus) of this file.
2. Inspect the current repo state (schema, `src/`, config, package versions).
3. State what is implemented, what's next, and any conflicts with this spec.
4. Implement the next backend chunk only, then verify it (type-check, Prisma validate/generate, etc.).

**End goal:** a polished SyntiqHQ public website plus a private internal CRM/admin system that turns prospect research into personalized outreach and ultimately clients.
