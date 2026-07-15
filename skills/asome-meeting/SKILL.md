---
name: asome-meeting
description: >
  Schedule meetings on the ASOME calendar (hola@asomelab.com) using ASOME's
  naming, reminder, and Meet conventions — resolving attendee emails from history.
  Trigger: "agenda una reunion", "schedule a meeting", "crear reunion",
  "sprint review", "daily", "kick-off", "reunion con", "meeting with",
  "agendar", "poné una reunion".
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Schedule Meeting

Creates a Google Calendar event on the ASOME calendar following ASOME conventions:
title format, standard reminders, Google Meet, and attendee-email resolution. Runs
against the Google Calendar MCP — no repo or `.asome/config.json` needed.

**Executes directly — no preview step.** For irreversible ambiguity (missing date,
unknown external email) ask ONE question, then create.

> **Prerequisite**: Google Calendar MCP connected. Organizer calendar is
> `hola@asomelab.com` (resolve via `list_calendars` — it is the ASOME workspace calendar,
> timezone `America/Argentina/Tucuman`).

---

## Fixed defaults (always apply)

| Field | Value |
|---|---|
| `calendarId` | `hola@asomelab.com` |
| `timeZone` | `America/Argentina/Tucuman` |
| `addGoogleMeetUrl` | `true` |
| `notificationLevel` | `ALL` (attendees get the invite) |
| Duration (if unspecified) | 30 min |
| Reminders | **email 60m + popup 30m + popup 5m before** — never vary |

```jsonc
"overrideReminders": [
  { "method": "email", "minutes": 60 },
  { "method": "popup", "minutes": 30 },
  { "method": "popup", "minutes": 5 }
]
```

For client/partner meetings also set `guestPermissions.guestsCanInviteOthers: false`.

---

## Title conventions

This skill accepts **any** meeting. The table below is the default naming — pick the
closest row; if none fits, use the **catch-all** rule. Never refuse or block a meeting
because it doesn't match a row.

| Meeting kind | Format | Example |
|---|---|---|
| Client / partner | `ASOME <> {Client} \| {Type}` | `ASOME <> DeWall \| Sprint Review` |
| Recurring team ritual | `ASOME <> {Client} \| {Ritual}` | `ASOME <> DeWall \| Daily Meeting` |
| Internal ASOME-only | `ASOME \| {Type}` | `ASOME \| Sprint Planning` |
| 1:1 / external individual | `{Descriptive} — {Person} ({context})` | `Primera reunión — Ingrid Brito (Las Colinas)` |
| Internal quick / 1:1 | `Reunión — {Person}` | `Reunión — Solana Avila` |
| Personal block (no guests) | `{Descriptive}` | `Focus — Roadmap Q3` |
| **Catch-all (anything else)** | clear descriptive title; keep the user's wording | — |

Common `{Type}` values: `Daily Meeting`, `Sprint Review`, `Sprint Planning`,
`Kick-Off Meeting`, `OnBoarding`, `Retro`, `Sync`, `Discovery`, `Demo`.

**Multi-party** (2+ clients): `ASOME <> {ClientA} <> {ClientB} | {Type}`.

---

## Attendee email resolution (order)

1. **Explicit** — user gives the email → use it verbatim.
2. **"correo normal / no el de asome"** — the person's personal email is wanted, NOT
   `@asomelab.com`. Search history (see step 4) for it. Deleted workspace users
   (`firstname.lastname@asomelab.com`) bounce — do not use them.
3. **ASOME team member** — pattern `firstname.lastname@asomelab.com`
   (e.g. `melina.silva@asomelab.com`, `santiago.brizuela@asomelab.com`,
   `felicitas.buteler@asomelab.com`). Confirm against a recent event's attendee list.
4. **Unknown external** — resolve from history before asking:
   - `list_events(fullText: "{Client}")` on `hola@asomelab.com` → copy attendee emails.
   - Gmail `search_threads("{name}")` → read `toRecipients` / sender.
   - Only if nothing found → ask the user for that one email. **Never guess an external
     address** — a wrong invite emails the wrong person.

---

## Steps

1. Resolve missing **date** (map "mañana"/"hoy" to an ISO date) and **time**. If a
   related email/thread already states the agreed slot, trust it. If no date can be
   inferred → ask ONE question.
2. Resolve each attendee email per the table above.
3. Match the **title** to the meeting kind. For a client whose past events exist,
   reuse the exact `ASOME <> {Client} | …` prefix seen in history.
4. `create_event` with the fixed defaults + resolved fields.
5. Report: title, local date/time range, attendees + invite status, Meet URL, reminders,
   and flag any same-day conflicts / back-to-back slots.

---

## Meeting shapes (all supported)

- **One-off** — default. `startTime` / `endTime`.
- **Recurring** — pass `recurrenceData` as RRULE, e.g. daily standup:
  `["RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"]`; weekly review:
  `["RRULE:FREQ=WEEKLY;BYDAY=TH"]`. Set the first occurrence as start/end.
- **All-day** — `allDay: true` (start/end treated as dates).
- **No attendees** (personal block / focus / reminder) — omit `attendees`; still gets the
  standard reminders unless the user says otherwise. Consider
  `eventType: "FOCUS_TIME"` or `OUT_OF_OFFICE` when the user asks for a block, not a meeting.
- **In-person** — set `location` and skip Meet only if the user says it's presencial;
  otherwise Meet stays on.

The fixed defaults (calendar, timezone, reminders, invite notifications) apply to **every**
shape unless the user explicitly overrides one.

---

## Known gotchas

- Reminders are **fixed** (60m email / 30m / 5m popup) — this is a saved user preference,
  not per-meeting. Do not fall back to Calendar defaults.
- The ASOME calendar is `hola@asomelab.com`, NOT the user's primary calendar. Always set
  `calendarId` explicitly.
- Former team members' `@asomelab.com` addresses are deleted and bounce — prefer personal
  emails for anyone no longer at ASOME.
- `timeZone` param overrides any offset in the ISO string — always pass
  `America/Argentina/Tucuman` so DST/offset mistakes can't happen.
- Adding attendees sends real invites (`notificationLevel: ALL`). Confirm the email is
  right before creating — resolve from history, don't guess.
