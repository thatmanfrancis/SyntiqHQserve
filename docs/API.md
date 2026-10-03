# SyntiqHQ API reference

> **Read this before building any frontend screen.** Every endpoint the backend has is listed here,
> with what it takes, what it returns and what it does behind the scenes.
> The checklist at the bottom maps each screen to its endpoints so nothing is left unused.
>
> When you add or change an endpoint, update this file in the same change.

---

## How the API works

- **Base URL:** same app, so call relative paths like `/api/admin/leads`.
- **Auth:** `POST /api/auth/login` sets an httpOnly cookie (`syntiq_session`, 30 days). The browser sends it automatically on same-origin requests. There is no token to store in the frontend.
- **Admin routes** (`/api/admin/*`) return `401` without a valid session. Admin pages (`/admin/*`) redirect to `/login` when there's no session cookie.
- **Public routes** (`/api/reviews/:slug`, `/api/unsubscribe/:token`) need no login.
- **Request bodies** are JSON. Send `Content-Type: application/json`.
- **Dates** are ISO strings both ways (`"2026-10-03T12:00:00.000Z"`).
- **Money** (`estimatedValue`, `amount`, `value`) is sent as a number but comes back as a **string** (e.g. `"4500"`), because it's stored as an exact decimal.
- **Optional fields** can be left out to keep their current value, or sent as `null` to clear them.
- **Errors** always look like this, so show `message` to the user:

  ```json
  { "error": "Invalid request", "message": "Company name is required" }
  ```

  | Status | Meaning |
  | --- | --- |
  | 400 | Bad input (the message says what's wrong) |
  | 401 | Not logged in |
  | 403 | Not allowed (e.g. contact has opted out) |
  | 404 | Not found |
  | 409 | Already exists |
  | 410 | Gone (expired review) |
  | 429 | Too many requests (login, unsubscribe and public review are rate limited) |
  | 500 | Server error |

- **Invalid JSON** in a request body returns `400` with "The request body must be valid JSON."
- **Rate limits** (per IP address):

  | Route | Limit |
  | --- | --- |
  | `POST /api/auth/login` | 10 attempts per 15 minutes |
  | `POST /api/unsubscribe/:token` | 30 per 15 minutes |
  | `GET /api/reviews/:slug` | 60 per minute |

- **Lists** that are paginated take `page` (default 1) and `pageSize` (default 25, max 100) and return:

  ```json
  { "companies": [...], "total": 120, "page": 1, "pageSize": 25 }
  ```

- **Activity log:** almost every change writes an activity entry automatically. The frontend never creates them; it only reads them (company detail, lead detail, dashboard).

---

## Enum values

Use these exact strings in filters, selects and bodies.

| Enum | Values |
| --- | --- |
| Industry | `HEALTHCARE` `SAAS` `REAL_ESTATE` `PROFESSIONAL_SERVICES` `FINANCE` `EDUCATION` `HOSPITALITY` `ECOMMERCE` `CONSTRUCTION` `LOGISTICS` `TECHNOLOGY` `TRAVEL` `MARKETING` `LEGAL` `OTHER` |
| CompanySize | `SOLO` `SMALL` `MEDIUM` `LARGE` `ENTERPRISE` `UNKNOWN` |
| WebsiteStatus | `NO_WEBSITE` `POOR` `OUTDATED` `AVERAGE` `GOOD` `EXCELLENT` |
| OpportunityLevel | `LOW` `MEDIUM` `HIGH` |
| LeadPriority | `LOW` `MEDIUM` `HIGH` |
| LeadStatus | `RESEARCHING` `QUALIFIED` `AUDIT_READY` `CONTACTED` `FOLLOW_UP_1` `FOLLOW_UP_2` `REPLIED` `MEETING_BOOKED` `PROPOSAL_SENT` `NEGOTIATING` `WON` `LOST` `NOT_INTERESTED` `DO_NOT_CONTACT` |
| ContactRole | `FOUNDER` `CEO` `OWNER` `DIRECTOR` `MANAGING_DIRECTOR` `MARKETING_DIRECTOR` `HEAD_OF_DIGITAL` `CTO` `COO` `OTHER` |
| ContactStatus | `ACTIVE` `INACTIVE` `UNKNOWN` `UNSUBSCRIBED` (UNSUBSCRIBED is set by the system only) |
| ReviewStatus | `DRAFT` `READY` `PUBLISHED` `ARCHIVED` (PUBLISHED is set by the publish route only) |
| OutreachChannel | `EMAIL` `LINKEDIN` `PHONE` `OTHER` |
| OutreachType | `INITIAL` `REMINDER` `FOLLOW_UP` `BREAKUP` `MANUAL` `OTHER` |
| OutreachStatus | `DRAFT` `SCHEDULED` `SENT` `DELIVERED` `REPLIED` `BOUNCED` `FAILED` `CANCELLED` |
| TaskType | `RESEARCH` `AUDIT` `RECORD_VIDEO` `OUTREACH` `FOLLOW_UP` `MEETING` `PROPOSAL` `GENERAL` |
| TaskStatus | `PENDING` `IN_PROGRESS` `COMPLETED` `CANCELLED` |
| TaskPriority | `LOW` `MEDIUM` `HIGH` `URGENT` |
| ProposalStatus | `DRAFT` `SENT` `VIEWED` `ACCEPTED` `REJECTED` `EXPIRED` `CANCELLED` |
| DealStatus | `OPEN` `WON` `LOST` |
| EnquiryService | `NEW_WEBSITE` `BOOKING` `REDESIGN` `APP` `CARE` `OTHER` |
| EnquiryBudget (USD) | `UNDER_5K` `FROM_5K_TO_10K` `FROM_10K_TO_25K` `OVER_25K` `NOT_SURE` |

---

## Auth

### `POST /api/auth/login`
Body: `{ email, password }`
Returns: `{ user: { id, email, name, role } }` and sets the session cookie.
Errors: `400` missing fields, `401` wrong email or password, `429` too many attempts.

### `POST /api/auth/logout`
Ends the session and clears the cookie. Returns `{ message }`.

### `GET /api/auth/me`
Returns `{ user: { id, email, name, role } }`, or `401` if not logged in. Use it on app load to know who's logged in.

---

## Dashboard

### `GET /api/admin/dashboard`
Everything the dashboard needs in one call. Archived companies are left out.

```json
{
  "cards": {
    "totalProspects": 0, "qualified": 0, "contacted": 0, "replies": 0,
    "meetings": 0, "proposalsSent": 0, "won": 0, "lost": 0,
    "followUpsDue": 0, "reviewsReady": 0, "reviewsPublished": 0
  },
  "wonValue": [{ "currency": "USD", "value": "4500" }],
  "pipeline": [{ "status": "RESEARCHING", "count": 3 }, "...every LeadStatus in order"],
  "followUpsDue": ["same shape as GET /api/admin/outreach/follow-ups"],
  "tasksDue": ["open tasks due today or overdue (max 20), each with isOverdue"],
  "recentActivity": ["last 20 activity entries with user { id, name } and company { id, name }"]
}
```

- `contacted` = leads that have been contacted at least once. `replies` = outreach marked as replied. `proposalsSent` = proposals that have been sent.
- `wonValue` is grouped by currency because deals can be in different currencies.

---

## Companies

### `GET /api/admin/companies`
Query: `search` (name or domain), `industry`, `country`, `companySize`, `websiteStatus`, `websiteOpportunity`, `archived` (`true`/`false`, default `false`), `sort` (`newest` `oldest` `name` `updated`), `page`, `pageSize`.
Returns: `{ companies, total, page, pageSize }`. Each company includes its primary contact and counts of related records.

### `POST /api/admin/companies`
Body:

| Field | Notes |
| --- | --- |
| `name` | **required** |
| `website`, `linkedinUrl`, `sourceUrl` | must start with `http://` or `https://` |
| `industry`, `companySize`, `websiteStatus`, `websiteOpportunity` | enums |
| `domain`, `country`, `city`, `description`, `phone`, `source`, `notes` | text |

`domain` is filled from `website` automatically. Returns `{ company }` (201).

### `GET /api/admin/companies/:id`
Returns `{ company }` with contacts, leads, reviews, tasks, proposals, deals and the last 50 activity entries. This powers the prospect detail page.

### `PATCH /api/admin/companies/:id`
Any company field. Returns `{ company }`.

### `DELETE /api/admin/companies/:id`
**Archives** the company (hidden from lists, history kept). Returns `{ message }`. List archived ones with `?archived=true`.

---

## Contacts

### `GET /api/admin/companies/:id/contacts`
Returns `{ contacts }` for a company, primary contact first.

### `POST /api/admin/companies/:id/contacts`
Body:

| Field | Notes |
| --- | --- |
| `firstName` | **required** |
| `lastName`, `phone`, `jobTitle`, `notes` | text |
| `email` | valid email, stored lowercase |
| `role` | ContactRole |
| `linkedinUrl` | http(s) link |
| `status` | `ACTIVE` `INACTIVE` `UNKNOWN` |
| `isPrimary` | boolean |

- The first contact of a company becomes primary automatically. Setting `isPrimary: true` moves primary from the old contact.
- If the email is on the suppression list, the contact is saved as `UNSUBSCRIBED`.

Returns `{ contact }` (201).

### `GET /api/admin/contacts/:id`
Returns `{ contact }` with company, leads and outreach history.

### `PATCH /api/admin/contacts/:id`
Same fields as create. An unsubscribed contact stays unsubscribed. Returns `{ contact }`.

### `DELETE /api/admin/contacts/:id`
Deletes the contact. Activity history stays on the company. Returns `{ message }`.

---

## Leads (prospects pipeline)

### `GET /api/admin/leads`
Query: `search` (company name or domain), `status`, `priority`, `assignedTo` (user id, `me` or `unassigned`), `industry`, `country`, `companySize`, `websiteStatus`, `websiteOpportunity`, `nextActionDue=true` (next action is now or earlier), `sort` (`newest` `updated` `priority` `score` `nextAction`), `page`, `pageSize`.
Returns: `{ leads, total, page, pageSize }` with company, contact and assigned user.

### `POST /api/admin/leads`
Body:

| Field | Notes |
| --- | --- |
| `companyId` | **required** |
| `contactId` | must belong to the company |
| `assignedToId` | defaults to you; `null` for unassigned |
| `status`, `priority` | enums |
| `leadScore` | 0–100 |
| `buyingSignal` | text |
| `buyingSignalUrl` | http(s) link |
| `estimatedValue` | number |
| `currency` | 3 letters, default `USD` |
| `nextAction`, `nextActionAt` | text and date |
| `notes` | text |

Returns `{ lead }` (201).

### `GET /api/admin/leads/:id`
Returns `{ lead }` with company, contact, assigned user, reviews, outreach, tasks, proposals, deal and the last 50 activity entries.

### `PATCH /api/admin/leads/:id`
Same fields as create (except `companyId`). A status change is logged as "moved from A to B". Returns `{ lead }`.

### `DELETE /api/admin/leads/:id`
For leads created by mistake. For real outcomes, set status `LOST` or `NOT_INTERESTED` instead. Returns `{ message }`.

---

## Reviews (personalised audits)

### `GET /api/admin/reviews`
Query: `search`, `status`, `companyId`, `leadId`, `page`, `pageSize`.
Returns: `{ reviews, total, page, pageSize }`. Each review includes `reviewUrl`, the public link.

### `POST /api/admin/reviews`
Body:

| Field | Notes |
| --- | --- |
| `companyId` | **required** |
| `leadId` | optional |
| `title`, `introduction`, `conclusion`, `ctaText` | text |
| `status` | `DRAFT` `READY` `ARCHIVED` |
| `videoUrl` | must start with `https://` |
| `videoProvider` | e.g. `loom` |
| `ctaUrl` | `https://` or `mailto:` |
| `expiresAt` | date |
| `points` | up to 20 of `{ title, description, category?, recommendation? }`, shown in the order sent |

Returns `{ review }` (201) with `reviewUrl`.

### `GET /api/admin/reviews/:id`
Returns `{ review }` with points, company, lead and `reviewUrl`. Use it for the admin preview too.

### `PATCH /api/admin/reviews/:id`
Same fields as create. Sending `points` **replaces** the whole list. Setting `status` on a published review unpublishes it. Returns `{ review }`.

### `DELETE /api/admin/reviews/:id`
Deletes the review. Its public link stops working. Returns `{ message }`.

### `POST /api/admin/reviews/:id/publish`
Publishes the review so its public link works. It needs at least one point, and `expiresAt` must not be in the past. Returns `{ review }` with `reviewUrl`, ready to copy into outreach.

### `DELETE /api/admin/reviews/:id/publish`
Unpublishes the review (back to `READY`). The public link stops working. Returns `{ review }`.

### `GET /api/reviews/:slug` (public)
For the prospect's review page at `/review/:slug`. No login needed. Every call counts as a view.

```json
{ "review": { "companyName", "title", "introduction", "videoUrl", "videoProvider",
              "points": [{ "title", "description", "category", "recommendation" }],
              "conclusion", "ctaText", "ctaUrl", "noIndex", "publishedAt" } }
```

`404` if it doesn't exist or isn't published, `410` if expired. The page must be `noindex`.

---

## Outreach

### `GET /api/admin/outreach`
Query: `status`, `channel`, `type`, `leadId`, `contactId`, `companyId`, `sentFrom`, `sentTo` (dates), `page`, `pageSize`.
Returns: `{ outreach, total, page, pageSize }`, newest first.

### `GET /api/admin/outreach/template?leadId=&contactId=&step=`
Builds a personalised email from the Day 0/3/7/14 templates. **Nothing is saved.** Leave out `step` to get the next step in the sequence automatically; `contactId` defaults to the lead's contact.

```json
{ "template": { "leadId", "contactId", "to", "sequenceStep", "type", "label",
                "subject", "body", "reviewUrl", "unsubscribeUrl" } }
```

`403` if the contact has opted out. `400` if the sequence is already finished.

### `POST /api/admin/outreach`
Saves an outreach record. Use it to save the template output as a draft, schedule it, or log something already sent.

| Field | Notes |
| --- | --- |
| `leadId` | **required** |
| `contactId` | must belong to the lead's company; required for `EMAIL` (and needs an email) |
| `channel` | default `EMAIL` |
| `type` | defaults from `sequenceStep`, otherwise `MANUAL` |
| `sequenceStep` | 0–3 |
| `subject`, `body` | text |
| `reviewUrl` | filled from the latest published review if left out |
| `scheduledAt` | date |
| `status` | `DRAFT` (default), `SCHEDULED`, or `SENT` to log one already sent |

`unsubscribeUrl` is always added. Returns `{ outreach }` (201). `403` if the contact unsubscribed, is suppressed, or the lead is `DO_NOT_CONTACT`.

### `GET /api/admin/outreach/:id`
Returns `{ outreach }` with lead and contact.

### `PATCH /api/admin/outreach/:id`
Edits a `DRAFT` or `SCHEDULED` outreach (same fields as create; `status` can be `DRAFT` `SCHEDULED` `CANCELLED`). Sent outreach can't be edited. Returns `{ outreach }`.

### `DELETE /api/admin/outreach/:id`
Deletes a `DRAFT`, `SCHEDULED` or `CANCELLED` outreach. Sent ones are history. Returns `{ message }`.

### `POST /api/admin/outreach/:id/send`
Marks it as sent after you've sent it from your mailbox or LinkedIn. No body. Suppression is checked again first.
- The lead's contacted dates are set.
- The lead moves forward in the pipeline (`CONTACTED`, then `FOLLOW_UP_1`, then `FOLLOW_UP_2`).
- The lead's next action is set to the next sequence email, due on Day 3, 7 or 14 counted from the first contact.

Returns `{ outreach }`.

### `POST /api/admin/outreach/:id/reply`
Marks it as replied. No body.
- The lead moves to `REPLIED`.
- Unsent drafts and scheduled outreach for the lead are cancelled.
- A "Reply to {name}" task is created.

Returns `{ outreach }`.

### `POST /api/admin/outreach/:id/bounce`
Body (optional): `{ errorMessage }`. Marks it as bounced and creates a "Find a new email for {name}" task. Returns `{ outreach }`.

### `GET /api/admin/outreach/follow-ups`
Leads whose next sequence email is due today or overdue.

```json
{ "followUps": [{ "leadId", "company": { "id", "name" }, "contact": { "id", "fullName", "email" },
                  "nextStep", "nextStepLabel", "lastSentAt", "dueAt", "isOverdue" }],
  "total": 1 }
```

Typical flow: click a follow-up → `GET /template?leadId=` → edit → `POST /outreach` → send from mailbox → `POST /outreach/:id/send`.

---

## Suppression (do-not-contact list)

### `GET /api/admin/suppression`
Query: `search`, `page`, `pageSize`. Returns `{ suppressions, total, page, pageSize }`.

### `POST /api/admin/suppression`
Body: `{ email, reason?, companyName?, notes? }`.
- Every contact with that email becomes `UNSUBSCRIBED`.
- Their leads move to `DO_NOT_CONTACT`.

Returns `{ suppression }` (201). `409` if the email is already on the list.

### `DELETE /api/admin/suppression/:id`
Removes a **manual** entry added by mistake; affected contacts go back to `ACTIVE`. People who unsubscribed through the link can't be removed (`403`). Returns `{ message }`.

### `POST /api/unsubscribe/:token` (public)
For the `/unsubscribe/:token` page. Call it once when the page loads. Calling it again is harmless. Returns `{ message: "You're unsubscribed." }`, or `404` for an invalid link.

---

## Tasks

### `GET /api/admin/tasks`
Query: `search` (title), `status` (a TaskStatus or `open` for pending + in progress), `priority`, `type`, `assignedTo` (user id, `me`, `unassigned`), `companyId`, `leadId`, `due` (`today` `overdue` `upcoming` `none`), `sort` (`due` default, `newest` `updated` `priority`), `page`, `pageSize`.
Returns: `{ tasks, total, page, pageSize }` with assigned user, company and lead.
- `due` filters by date only; add `status=open` to hide completed and cancelled tasks.
- Tasks of archived companies are hidden.

### `POST /api/admin/tasks`
Body:

| Field | Notes |
| --- | --- |
| `title` | **required** |
| `description` | text |
| `type`, `status`, `priority` | enums |
| `dueAt` | date |
| `assignedToId` | defaults to you; `null` for unassigned |
| `companyId` | optional |
| `leadId` | optional; if given without `companyId`, the lead's company is used |

Returns `{ task }` (201).

### `GET /api/admin/tasks/:id`
Returns `{ task }` with assigned user, company and lead (with contact).

### `PATCH /api/admin/tasks/:id`
Any task field. Send `{ "status": "COMPLETED" }` to complete it; this sets `completedAt` and logs it. Changing it back to another status clears `completedAt`. Returns `{ task }`.

### `DELETE /api/admin/tasks/:id`
Deletes the task and logs the deletion. Returns `{ message }`.

**Automatic tasks:** the backend creates tasks on its own in four cases. Each goes to the lead's owner, and a task is skipped if the same open one already exists:

| Event | Task |
| --- | --- |
| Prospect replies | "Reply to {name}", due today, high priority |
| Email bounces | "Find a new email for {name}", due today |
| Proposal sent | "Follow up on proposal {number}", due in 3 days |
| Deal won | "Kick off the project with {company}", due in 2 days |

---

## Proposals

### `GET /api/admin/proposals`
Query: `search` (title, proposal number or company name), `status`, `companyId`, `leadId`, `sort` (`newest` `updated` `amount` `validUntil`), `page`, `pageSize`.
Returns: `{ proposals, total, page, pageSize }` with company, lead and creator.

### `POST /api/admin/proposals`
Body:

| Field | Notes |
| --- | --- |
| `title` | **required** |
| `amount` | **required**, number |
| `companyId` or `leadId` | at least one; the lead's company is used if only `leadId` is given |
| `description` | text |
| `currency` | 3 letters, default `USD` |
| `validUntil` | date |
| `documentUrl` | http(s) link |

Created as `DRAFT` with an automatic number like `SYN-2026-0001`. Returns `{ proposal }` (201).

### `GET /api/admin/proposals/:id`
Returns `{ proposal }` with company, lead (with contact) and creator.

### `PATCH /api/admin/proposals/:id`
Any field above (not company or lead) plus `status`.
- `SENT`, `VIEWED` and `ACCEPTED` record their date the first time.
- The **first** time it's sent, the lead moves to `PROPOSAL_SENT` and a follow-up task is created.
- The **first** time it's accepted, an `OPEN` deal is opened for the lead (same title, amount and currency), unless the lead already has a deal. The lead moves to `NEGOTIATING`. Mark the deal `WON` once it's signed.
- Every status change is logged.

Returns `{ proposal, openedDeal }`. `openedDeal` is the new deal when accepting opened one, otherwise `null`; show a "Deal opened" message when it's set.

### `DELETE /api/admin/proposals/:id`
Only drafts can be deleted (`400` otherwise; cancel sent ones with `status: "CANCELLED"`). Returns `{ message }`.

---

## Deals

### `GET /api/admin/deals`
Query: `search` (title or company name), `status`, `companyId`, `sort` (`newest` `updated` `value` `expectedClose`), `page`, `pageSize`.
Returns: `{ deals, total, page, pageSize }` with company and lead.

### `POST /api/admin/deals`
Body: `{ leadId (required), value (required), title?, currency?, expectedCloseAt?, notes? }`.
- The title defaults to "{Company} deal" and the currency to the lead's currency.
- A lead can only have one deal (`409`).

Returns `{ deal }` (201).

### `GET /api/admin/deals/:id`
Returns `{ deal }` with company and lead (with contact).

### `PATCH /api/admin/deals/:id`
Any field above (not the lead) plus `status`.

| Status | Effect |
| --- | --- |
| `WON` | Sets `closedAt`, moves the lead to `WON`, creates a kick-off task |
| `LOST` | Sets `closedAt`, moves the lead to `LOST` |
| `OPEN` (reopen) | Clears `closedAt`, moves the lead to `NEGOTIATING` |

Returns `{ deal }`.

### `DELETE /api/admin/deals/:id`
For deals created by mistake. The lead's status is left alone. Returns `{ message }`.

---

## Contact form

### `POST /api/contact` (public)
For the website's contact form. No login needed.

| Field | Rules |
| --- | --- |
| `name` | required, up to 100 characters |
| `email` | required, valid email |
| `company` | optional, up to 150 characters |
| `service` | required, EnquiryService |
| `budget` | optional, EnquiryBudget |
| `message` | required, 10 to 5000 characters |
| `website` | hidden spam trap; leave it empty and visually hide the input |

- Saves an `Enquiry`, then emails it to `CONTACT_INBOX_EMAIL` through Resend, with reply-to set to the sender.
- Sends the person a short confirmation from `CONTACT_FROM_EMAIL` with reply-to set to the inbox. It never repeats their message, and it's skipped if their email is on the suppression list.
- If an email fails, the enquiry is still saved and the response is the same. `notifiedAt` stays empty when the inbox notification failed.
- Limited to 5 messages per hour per IP (`429`).

Returns `{ message: "Thanks for getting in touch. We'll reply within 24 hours." }` (201). `400` with a readable `message` if a field is invalid.

---

## Frontend coverage checklist

Each screen and the endpoints it should use. When building a screen, tick off every endpoint listed for it.

| Screen | Endpoints |
| --- | --- |
| Login | `POST /api/auth/login` |
| App shell (header, logout) | `GET /api/auth/me`, `POST /api/auth/logout` |
| Dashboard | `GET /api/admin/dashboard`; follow-up rows link to the outreach composer; task rows use `PATCH /api/admin/tasks/:id` to complete |
| Prospects list | `GET /api/admin/leads` (all filters), `POST /api/admin/companies` + `POST /api/admin/leads` for "new prospect" |
| Companies list / archive | `GET /api/admin/companies` (incl. `archived=true`), `DELETE /api/admin/companies/:id` |
| Prospect detail | `GET /api/admin/companies/:id`, `PATCH /api/admin/companies/:id`, `GET`/`PATCH`/`DELETE /api/admin/leads/:id` |
| Contacts (on prospect detail) | `GET`/`POST /api/admin/companies/:id/contacts`, `GET`/`PATCH`/`DELETE /api/admin/contacts/:id` |
| Reviews list | `GET /api/admin/reviews` |
| Review editor + preview | `POST /api/admin/reviews`, `GET`/`PATCH`/`DELETE /api/admin/reviews/:id`, `POST`/`DELETE /api/admin/reviews/:id/publish` |
| Public review page `/review/:slug` | `GET /api/reviews/:slug` |
| Outreach list / history | `GET /api/admin/outreach`, `GET /api/admin/outreach/:id` |
| Outreach composer | `GET /api/admin/outreach/template`, `POST /api/admin/outreach`, `PATCH`/`DELETE /api/admin/outreach/:id` |
| Outreach actions | `POST /api/admin/outreach/:id/send`, `/reply`, `/bounce` |
| Follow-ups due | `GET /api/admin/outreach/follow-ups` |
| Tasks | `GET`/`POST /api/admin/tasks`, `GET`/`PATCH`/`DELETE /api/admin/tasks/:id` |
| Proposals | `GET`/`POST /api/admin/proposals`, `GET`/`PATCH`/`DELETE /api/admin/proposals/:id` |
| Deals | `GET`/`POST /api/admin/deals`, `GET`/`PATCH`/`DELETE /api/admin/deals/:id` |
| Suppression | `GET`/`POST /api/admin/suppression`, `DELETE /api/admin/suppression/:id` |
| Public unsubscribe page `/unsubscribe/:token` | `POST /api/unsubscribe/:token` |
| Public contact page `/contact` | `POST /api/contact` |
