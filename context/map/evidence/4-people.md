# Evidence: people

**Source:** authorship in `.work/git-log.txt` (12-month window 2025-10-26..2026-10-19, HEAD 0f19cc46ef), via `.work/scan.py` (`load`, `attribute`, `is_noise`). No forge access (`gh` missing); no file contents read.

## Baseline and filters
- Counted commits in window: 1870. Excluded as people: bots (cal-com-ci, mintlify, github-actions, coderabbitai) and `devin-ai-integration[bot]` (16 counted commits = AI agent activity, never a person). Remaining human counted commits: **1853**.
- Identities merged by e-mail, then by identical name (union-find, e-mails never printed): contract says 190 names / 194 e-mails; after merging **183 distinct humans** in window (e.g. one person appearing under a GitHub handle and a real name). Names below are display names as in git.
- **Two epochs, two teams.** Pre-conversion (Cal.com staff era, 2025-10-26..2026-04-15): 1750 human commits, ~180 people, heaviest 2025-11..2026-02 (243/444/575/294 commits per month). Post-conversion (`ab21c7f8`..HEAD): **103 human counted commits by 59 people**; raw post commits per month: Apr 38, May 8, Jun 29, Jul 12, Aug 6, Sep 14, Oct 3 (110 incl. bots/agent/uncounted). Top post contributors: Romit 20, Anirban Singha 10, Chayan Das 5, Gaurav Kumar 4; 47 of 59 have exactly 1 commit (drive-by contributors).
- Team-wide share ceiling: the largest author holds 8.3% of window commits (Anik Dhabal Babu 153), top 15 hold 52%. A "concentrated" capability below = top person ≥20% of the capability's commits AND ≥3× their team-wide share (false-signals rule 6 satisfied: team ≫ 3 humans; but post-conversion team is a trickle, see Unknowns).
- Capability attribution: a commit counts once per capability touched (non-noise files only); a person's share = their commits touching the capability / all human counted commits touching it. Totals therefore overlap across capabilities.
- **Who is still active at HEAD (last human commit, any commit incl. uncounted):** nearly every prolific pre-conversion author stopped on or before the conversion: Keith Williams 2026-04-15, Benny Joo 2026-04-15, Peer Richelsen 2026-04-15, Pedro Castro 2026-04-16 (their post commits are conversion-day cleanup), Anik Dhabal Babu 2026-03-10, Eunjae Lee 2026-03-12, Dhairyashil Shinde 2026-03-04, sean-brydon 2026-02-23, Alex van Andel 2026-03-24, Hariom Balhara 2026-03-19, Volnei Munhoz 2026-02-26, Morgan 2026-03-13, Rajiv Sahal 2026-03-18, Udit Takkar 2026-03-19, Joe Au-Yeung 2026-03-09. Still active after conversion: Romit (last 2026-05-05, 20 commits), Anirban Singha (last 2026-08-08), shafi-VM (2026-09-04), Aykut Güney / Md. Shalah Uddin / Kartik Saini (2026-10-18/19). Commits in the last 60 days of window (since 2026-08-19): 16 distinct people, 1 commit each (all drive-by).
- Commit counts per person: most are `evidence`; "still on the team" is `unknown` (see Unknowns).

## People per capability
Format: person commits (share of capability's human commits, first-last in window, last overall). Topic groups = most-touched path prefixes and conventional-commit types of that person's commits in the capability. Rows: whole window (W) then post-conversion (P). 22 capabilities: all high/medium criticality plus ranked top-5 by counted changes (booking, public-api, platform-infra, accounts, foundations; removed-ee/companion as history-only).


### Booking (`booking`, high)
Human commits: window 359 by 55 people; post 18 by 10.

- W: Anik Dhabal Babu 48 (13%, 2025-10→2026-02-23, last overall 2026-03-10); Hariom Balhara 44 (12%, 2025-10→2026-03-09, last overall 2026-03-19); Eunjae Lee 34 (9%, 2025-10→2026-03-11, last overall 2026-03-12); Benny Joo 28 (8%, 2025-10→2026-03-04, last overall 2026-04-15)
  - Anik Dhabal Babu: paths `packages/features/bookings` (31), `apps/web/playwright` (16), `apps/web/app` (7); types fix 37, test 5, other 3
  - Hariom Balhara: paths `packages/features/booking-audit` (239), `packages/features/bookings` (95), `packages/trpc/server` (34); types feat 12, chore 12, fix 11
  - Eunjae Lee: paths `apps/web/modules` (133), `apps/web/components` (43), `packages/features/bookings` (13); types feat 14, fix 13, refactor 6
- P: Romit 6 (33%, 2026-04→2026-05-05, last overall 2026-05-05); Anirban Singha 4 (22%, 2026-04→2026-08-01, last overall 2026-08-08); Kartik Saini 1 (6%, 2026-10→2026-10-18, last overall 2026-10-18)

### Availability (`availability`, high)
Human commits: window 100 by 32 people; post 4 by 4.

- W: Benny Joo 18 (18%, 2025-12→2026-02-24, last overall 2026-04-15); Keith Williams 7 (7%, 2025-10→2026-01-12, last overall 2026-04-15); Eunjae Lee 6 (6%, 2025-10→2026-02-16, last overall 2026-03-12); Alex van Andel 6 (6%, 2025-11→2026-01-30, last overall 2026-03-24)
  - Benny Joo: paths `packages/trpc/server` (19), `apps/web/modules` (18), `packages/features/schedules` (13); types refactor 18
  - Keith Williams: paths `packages/trpc/server` (5), `apps/web/playwright` (2), `packages/features/troubleshooter` (2); types fix 2, refactor 2, revert 1
  - Eunjae Lee: paths `packages/trpc/server` (9), `packages/lib/holidays` (4), `apps/web/modules` (2); types refactor 4, fix 1, feat 1
- P: Md. Shalah Uddin 1 (25%, 2026-10→2026-10-18, last overall 2026-10-18); Kartik Saini 1 (25%, 2026-10→2026-10-18, last overall 2026-10-18); lucadapice 1 (25%, 2026-06→2026-06-19, last overall 2026-06-19)

### Event types (`event-types`, high)
Human commits: window 154 by 45 people; post 11 by 7.

- W: Benny Joo 20 (13%, 2025-10→2026-02-23, last overall 2026-04-15); Anik Dhabal Babu 10 (6%, 2025-10→2026-02-23, last overall 2026-03-10); Keith Williams 10 (6%, 2025-10→2026-01-27, last overall 2026-04-15); Dhairyashil Shinde 9 (6%, 2025-10→2026-01-27, last overall 2026-03-04)
  - Benny Joo: paths `apps/web/modules` (50), `packages/features/eventtypes` (25), `packages/trpc/server` (5); types refactor 18, fix 2
  - Anik Dhabal Babu: paths `packages/features/eventtypes` (8), `packages/trpc/server` (5), `apps/web/app` (2); types fix 4, test 1, other 1
  - Keith Williams: paths `packages/trpc/server` (12), `packages/features/eventtypes` (8), `packages/prisma/migrations` (1); types refactor 4, perf 3, fix 2
- P: Romit 4 (36%, 2026-04→2026-04-28, last overall 2026-05-05); Anirban Singha 2 (18%, 2026-06→2026-07-09, last overall 2026-08-08); Paul Albrecht 1 (9%, 2026-09→2026-09-09, last overall 2026-09-09)

### Calendars (`calendars`, high)
Human commits: window 90 by 24 people; post 2 by 2.

- W: Volnei Munhoz 16 (18%, 2025-11→2026-02-26, last overall 2026-02-26); Eunjae Lee 11 (12%, 2025-10→2026-02-13, last overall 2026-03-12); Benny Joo 10 (11%, 2025-12→2026-02-09, last overall 2026-04-15); Alex van Andel 9 (10%, 2025-10→2026-02-13, last overall 2026-03-24)
  - Volnei Munhoz: paths `packages/features/calendar-subscription` (30), `packages/features/selectedCalendar` (9), `packages/app-store/googlecalendar` (9); types feat 4, fix 3, chore 3
  - Eunjae Lee: paths `packages/features/calendars` (37), `apps/web/modules` (4), `packages/features/selectedCalendar` (3); types feat 5, fix 4, refactor 2
  - Benny Joo: paths `packages/features/calendars` (16), `packages/features/selectedCalendar` (5), `apps/web/modules` (5); types refactor 8, fix 2
- P: Kartik Saini 1 (50%, 2026-10→2026-10-18, last overall 2026-10-18); Shreyas 1 (50%, 2026-07→2026-07-07, last overall 2026-07-07)

### Conferencing (`conferencing`, medium)
Human commits: window 44 by 21 people; post 2 by 2.

- W: Volnei Munhoz 6 (14%, 2026-01→2026-02-20, last overall 2026-02-26); Udit Takkar 6 (14%, 2025-11→2026-02-11, last overall 2026-03-19); Anik Dhabal Babu 4 (9%, 2025-11→2026-01-17, last overall 2026-03-10); Benny Joo 3 (7%, 2025-12→2026-04-15, last overall 2026-04-15)
  - Volnei Munhoz: paths `packages/app-store/tandemvideo` (2), `packages/app-store/webex` (2), `apps/web/modules` (2); types fix 2, chore 2, style 1
  - Udit Takkar: paths `packages/app-store/dailyvideo` (4), `apps/web/modules` (3), `apps/web/app` (2); types feat 3, fix 2, perf 1
  - Anik Dhabal Babu: paths `packages/app-store/zoomvideo` (2), `packages/app-store/office365video` (2), `packages/features/conferencing` (1); types fix 3, refactor 1
- P: Bryan Varela 1 (50%, 2026-06→2026-06-16, last overall 2026-06-16); Benny Joo 1 (50%, 2026-04→2026-04-15, last overall 2026-04-15)

### Payments (`payments`, high)
Human commits: window 53 by 23 people; post 4 by 2.

- W: Anik Dhabal Babu 8 (15%, 2025-10→2026-02-04, last overall 2026-03-10); Benny Joo 6 (11%, 2025-11→2026-02-23, last overall 2026-04-15); Joe Au-Yeung 5 (9%, 2025-11→2026-01-19, last overall 2026-03-09); shafi-VM 3 (6%, 2026-07→2026-09-04, last overall 2026-09-04)
  - Anik Dhabal Babu: paths `packages/app-store/hitpay` (5), `packages/app-store/_utils` (3), `packages/app-store/stripepayment` (2); types fix 5, test 3
  - Benny Joo: paths `packages/app-store/stripepayment` (8), `packages/features/bookings` (3), `packages/app-store/btcpayserver` (3); types refactor 5, fix 1
  - Joe Au-Yeung: paths `packages/features/bookings` (6), `packages/app-store/stripepayment` (3), `packages/trpc/server` (2); types fix 2, refactor 2, chore 1
- P: shafi-VM 3 (75%, 2026-07→2026-09-04, last overall 2026-09-04); Mandar Joshi 1 (25%, 2026-05→2026-05-03, last overall 2026-05-03)

### Webhooks (`webhooks`, medium)
Human commits: window 44 by 21 people; post 2 by 2.

- W: Syed Ali Shahbaz 10 (23%, 2025-12→2026-02-19, last overall 2026-03-02); Eunjae Lee 4 (9%, 2025-11→2026-02-16, last overall 2026-03-12); Pedro Castro 3 (7%, 2026-02→2026-04-01, last overall 2026-04-16); Benny Joo 3 (7%, 2025-12→2026-02-23, last overall 2026-04-15)
  - Syed Ali Shahbaz: paths `packages/features/webhooks` (128), `packages/features/di` (28), `packages/trpc/server` (9); types chore 6, feat 2, fix 1
  - Eunjae Lee: paths `apps/web/modules` (3), `apps/web/app` (2), `packages/trpc/server` (1); types refactor 3, fix 1
  - Pedro Castro: paths `packages/trpc/server` (9), `apps/web/modules` (6); types fix 2, other 1
- P: Romit 1 (50%, 2026-05→2026-05-01, last overall 2026-05-05); Qiaochu Hu 1 (50%, 2026-04→2026-04-22, last overall 2026-04-22)

### Apps marketplace (`apps-marketplace`, medium)
Human commits: window 197 by 49 people; post 7 by 5.

- W: Anik Dhabal Babu 24 (12%, 2025-10→2026-02-07, last overall 2026-03-10); Joe Au-Yeung 18 (9%, 2025-11→2026-02-23, last overall 2026-03-09); Volnei Munhoz 18 (9%, 2025-11→2026-02-20, last overall 2026-02-26); Benny Joo 15 (8%, 2025-10→2026-02-23, last overall 2026-04-15)
  - Anik Dhabal Babu: paths `packages/app-store/pipedrive-crm` (6), `apps/web/playwright` (5), `packages/app-store/routing-forms` (5); types fix 12, test 4, other 3
  - Joe Au-Yeung: paths `packages/app-store/salesforce` (47), `packages/app-store/routing-forms` (12), `packages/app-store/_utils` (5); types feat 10, fix 3, other 3
  - Volnei Munhoz: paths `packages/app-store/_utils` (13), `packages/app-store-cli/src` (9), `apps/web/components` (4); types fix 6, chore 5, perf 2
- P: Anirban Singha 3 (43%, 2026-06→2026-07-09, last overall 2026-08-08); cognicores 1 (14%, 2026-08→2026-08-04, last overall 2026-08-04); Mandar Joshi 1 (14%, 2026-05→2026-05-03, last overall 2026-05-03)

### Identity (`identity`, high)
Human commits: window 136 by 38 people; post 6 by 3.

- W: sean-brydon 15 (11%, 2025-10→2026-02-13, last overall 2026-02-23); Anik Dhabal Babu 11 (8%, 2025-10→2026-03-10, last overall 2026-03-10); Pedro Castro 10 (7%, 2025-12→2026-04-14, last overall 2026-04-16); Joe Au-Yeung 8 (6%, 2025-10→2026-03-09, last overall 2026-03-09)
  - sean-brydon: paths `packages/features/auth` (10), `apps/web/playwright` (8), `apps/web/app` (5); types feat 5, other 4, fix 4
  - Anik Dhabal Babu: paths `apps/web/playwright` (8), `packages/features/auth` (3), `apps/web/lib` (2); types fix 5, test 4, other 1
  - Pedro Castro: paths `packages/features/auth` (25), `apps/web/app` (8), `apps/web/modules` (1); types fix 7, chore 2, other 1
- P: Romit 3 (50%, 2026-04→2026-05-01, last overall 2026-05-05); Anirban Singha 2 (33%, 2026-06→2026-06-22, last overall 2026-08-08); Benny Joo 1 (17%, 2026-04→2026-04-15, last overall 2026-04-15)

### Accounts (`accounts`, medium)
Human commits: window 276 by 52 people; post 12 by 7.

- W: sean-brydon 55 (20%, 2025-10→2026-02-13, last overall 2026-02-23); Eunjae Lee 18 (7%, 2025-10→2026-03-05, last overall 2026-03-12); Benny Joo 18 (7%, 2025-12→2026-02-23, last overall 2026-04-15); Anik Dhabal Babu 14 (5%, 2025-11→2026-03-10, last overall 2026-03-10)
  - sean-brydon: paths `apps/web/modules` (234), `apps/web/app` (34), `packages/features/shell` (9); types feat 20, fix 14, chore 14
  - Eunjae Lee: paths `apps/web/modules` (56), `apps/web/app` (17), `apps/web/components` (5); types feat 11, refactor 4, fix 2
  - Benny Joo: paths `apps/web/modules` (28), `packages/features/users` (6), `packages/trpc/server` (6); types refactor 16, other 1, fix 1
- P: Chayan Das 3 (25%, 2026-06→2026-06-18, last overall 2026-07-01); Romit 3 (25%, 2026-04→2026-05-05, last overall 2026-05-05); Anirban Singha 2 (17%, 2026-06→2026-06-22, last overall 2026-08-08)

### Notifications (`notifications`, medium)
Human commits: window 37 by 20 people; post 3 by 3.

- W: Benny Joo 6 (16%, 2025-11→2026-02-23, last overall 2026-04-15); Rajiv Sahal 4 (11%, 2026-01→2026-02-25, last overall 2026-03-18); Anik Dhabal Babu 4 (11%, 2026-01→2026-02-02, last overall 2026-03-10); Udit Takkar 3 (8%, 2025-11→2026-01-16, last overall 2026-03-19)
  - Benny Joo: paths `apps/web/modules` (2), `packages/emails/lib` (2), `apps/web/app` (1); types refactor 3, fix 2, other 1
  - Rajiv Sahal: paths `packages/emails/src` (5), `packages/emails/templates` (2), `packages/emails/email-manager.ts` (2); types fix 2, feat 1, init 1
  - Anik Dhabal Babu: paths `packages/emails/src` (3), `packages/emails/email-manager.test.ts` (1), `packages/emails/templates` (1); types fix 3, refactor 1
- P: Gaurav Kumar 1 (33%, 2026-07→2026-07-05, last overall 2026-08-05); Romit 1 (33%, 2026-05→2026-05-01, last overall 2026-05-05); Pedro Castro 1 (33%, 2026-04→2026-04-16, last overall 2026-04-16)

### Embeds (`embeds`, medium)
Human commits: window 40 by 18 people; post 2 by 2.

- W: Hariom Balhara 10 (25%, 2025-11→2026-02-20, last overall 2026-03-19); Volnei Munhoz 8 (20%, 2025-12→2026-01-19, last overall 2026-02-26); Benny Joo 5 (12%, 2026-01→2026-02-09, last overall 2026-04-15); Pedro Castro 2 (5%, 2025-12→2026-02-03, last overall 2026-04-16)
  - Hariom Balhara: paths `packages/embeds/embed-core` (24), `packages/embeds/LIFECYCLE.md` (2), `packages/embeds/embed-react` (2); types fix 5, feat 2, test 1
  - Volnei Munhoz: paths `packages/embeds/embed-core` (17), `packages/embeds/embed-snippet` (4), `packages/embeds/embed-react` (3); types fix 4, chore 2, other 1
  - Benny Joo: paths `apps/web/modules` (5), `packages/embeds/embed-core` (2); types refactor 5
- P: Anujmishra2004 1 (50%, 2026-09→2026-09-14, last overall 2026-09-14); Mandar Joshi 1 (50%, 2026-05→2026-05-03, last overall 2026-05-03)

### Admin & safety (`admin-safety`, medium)
Human commits: window 88 by 20 people; post 1 by 1.

- W: Eunjae Lee 34 (39%, 2025-10→2026-03-12, last overall 2026-03-12); Benny Joo 8 (9%, 2025-12→2026-02-23, last overall 2026-04-15); sean-brydon 6 (7%, 2026-01→2026-02-12, last overall 2026-02-23); Hariom Balhara 5 (6%, 2025-11→2026-03-19, last overall 2026-03-19)
  - Eunjae Lee: paths `packages/features/flags` (59), `packages/features/feature-opt-in` (56), `apps/web/modules` (27); types feat 13, fix 10, refactor 8
  - Benny Joo: paths `apps/web/modules` (19), `packages/features/watchlist` (7), `packages/trpc/server` (6); types refactor 7, fix 1
  - sean-brydon: paths `packages/trpc/server` (8), `apps/web/modules` (5), `packages/features/flags` (4); types feat 5, fix 1
- P: Chayan Das 1 (100%, 2026-06→2026-06-18, last overall 2026-07-01)

### Public API v2/atoms (`public-api`, high)
Human commits: window 327 by 50 people; post 11 by 10.

- W: Morgan 56 (17%, 2025-10→2026-02-05, last overall 2026-03-13); Rajiv Sahal 35 (11%, 2025-10→2026-03-18, last overall 2026-03-18); Alex van Andel 28 (9%, 2025-11→2026-03-24, last overall 2026-03-24); Benny Joo 26 (8%, 2025-10→2026-04-15, last overall 2026-04-15)
  - Morgan: paths `apps/api/v2/src` (333), `packages/platform/types/event-types` (8), `packages/platform/types/bookings` (6); types fix 20, feat 17, chore 15
  - Rajiv Sahal: paths `apps/api/v2/src` (84), `packages/platform/types/bookings` (9), `packages/platform/atoms/hooks` (7); types feat 12, fix 11, chore 8
  - Alex van Andel: paths `apps/api/v2/src` (21), `apps/api/v1/trigger.version.js` (10), `apps/api/v2/trigger.version.ts` (10); types chore 16, fix 4, feat 3
- P: Pranavvv 2 (18%, 2026-06→2026-06-08, last overall 2026-06-08); 陈志谦 1 (9%, 2026-09→2026-09-20, last overall 2026-09-20); JackAnsh23 1 (9%, 2026-09→2026-09-06, last overall 2026-09-06)

### Platform infra (`platform-infra`, high)
Human commits: window 475 by 46 people; post 14 by 8.

- W: Keith Williams 95 (20%, 2025-10→2026-04-15, last overall 2026-04-15); Alex van Andel 46 (10%, 2025-10→2026-02-16, last overall 2026-03-24); Volnei Munhoz 42 (9%, 2025-10→2026-02-12, last overall 2026-02-26); Anik Dhabal Babu 39 (8%, 2025-10→2026-02-13, last overall 2026-03-10)
  - Keith Williams: paths `.github/workflows/devin-conflict-resolver.yml` (14), `.github/workflows/pr.yml` (14), `.github/workflows/stale-pr-devin-completion.yml` (10); types fix 32, chore 22, feat 18
  - Alex van Andel: paths `apps/web/package.json` (31), `apps/web/trigger.version.ts` (10), `apps/web/middleware.ts` (6); types chore 35, fix 5, other 3
  - Volnei Munhoz: paths `biome.json` (12), `packages/eslint-plugin/src/rules` (10), `package.json` (8); types chore 16, other 12, fix 10
- P: Romit 7 (50%, 2026-04→2026-05-01, last overall 2026-05-05); Anirban Singha 1 (7%, 2026-06→2026-06-22, last overall 2026-08-08); Bandhan Majumder 1 (7%, 2026-06→2026-06-16, last overall 2026-06-27)

### Foundations (`foundations`, medium)
Human commits: window 268 by 55 people; post 12 by 10.

- W: Eunjae Lee 29 (11%, 2025-10→2026-03-05, last overall 2026-03-12); Benny Joo 27 (10%, 2025-10→2026-02-24, last overall 2026-04-15); Hariom Balhara 18 (7%, 2025-10→2026-03-06, last overall 2026-03-19); Volnei Munhoz 17 (6%, 2025-11→2026-01-21, last overall 2026-02-26)
  - Eunjae Lee: paths `apps/web/modules` (44), `packages/features/data-table` (27), `packages/features/di` (17); types feat 14, refactor 7, fix 6
  - Benny Joo: paths `packages/lib/server` (18), `packages/trpc/server` (16), `packages/features/di` (10); types refactor 22, fix 3, other 1
  - Hariom Balhara: paths `packages/features/di` (7), `packages/lib/server` (4), `packages/trpc/server` (2); types fix 9, feat 4, chore 3
- P: Anirban Singha 2 (17%, 2026-06→2026-08-08, last overall 2026-08-08); Gaurav Kumar 2 (17%, 2026-07→2026-08-05, last overall 2026-08-05); Kartik Saini 1 (8%, 2026-10→2026-10-18, last overall 2026-10-18)

### UI kit (`ui-kit`, low)
Human commits: window 88 by 42 people; post 6 by 6.

- W: Eunjae Lee 12 (14%, 2025-11→2026-02-13, last overall 2026-03-12); Volnei Munhoz 8 (9%, 2025-12→2026-01-21, last overall 2026-02-26); Pasquale Vitiello 4 (5%, 2025-11→2026-02-18, last overall 2026-02-18); Joe Au-Yeung 4 (5%, 2025-10→2026-01-12, last overall 2026-03-09)
  - Eunjae Lee: paths `packages/coss-ui/src` (43), `packages/ui/components` (38), `packages/coss-ui/package.json` (1); types fix 7, feat 3, refactor 2
  - Volnei Munhoz: paths `packages/ui/components` (8), `packages/coss-ui/package.json` (2), `packages/ui/scripts` (2); types chore 3, other 2, fix 2
  - Pasquale Vitiello: paths `packages/coss-ui/src` (40), `packages/ui/components` (9), `packages/coss-ui/package.json` (1); types fix 2, chore 1, feat 1
- P: Rohan Unbeg 1 (17%, 2026-09→2026-09-09, last overall 2026-09-09); Rohan Singh 1 (17%, 2026-09→2026-09-01, last overall 2026-09-01); Chayan Das 1 (17%, 2026-06→2026-06-19, last overall 2026-07-01)

### Data model (`data-model`, high)
Human commits: window 96 by 23 people; post 2 by 1.

- W: Joe Au-Yeung 11 (11%, 2025-11→2026-02-23, last overall 2026-03-09); sean-brydon 11 (11%, 2025-12→2026-02-13, last overall 2026-02-23); Alex van Andel 10 (10%, 2025-10→2026-03-03, last overall 2026-03-24); Hariom Balhara 9 (9%, 2025-11→2026-03-09, last overall 2026-03-19)
  - Joe Au-Yeung: paths `packages/prisma/migrations` (13), `packages/prisma/schema.prisma` (8); types feat 9, other 2
  - sean-brydon: paths `packages/prisma/migrations` (9), `packages/prisma/schema.prisma` (6), `packages/prisma/zod-utils.ts` (1); types feat 8, other 2, fix 1
  - Alex van Andel: paths `packages/prisma/schema.prisma` (8), `packages/prisma/selects` (2), `packages/prisma/package.json` (1); types chore 4, fix 3, feat 2
- P: Romit 2 (100%, 2026-05→2026-05-01, last overall 2026-05-05)

### i18n (`i18n`, low)
Human commits: window 193 by 53 people; post 12 by 12.

- W: sean-brydon 24 (12%, 2025-10→2026-02-12, last overall 2026-02-23); Hariom Balhara 14 (7%, 2025-11→2026-03-19, last overall 2026-03-19); Eunjae Lee 14 (7%, 2025-10→2026-03-05, last overall 2026-03-12); Joe Au-Yeung 14 (7%, 2025-11→2026-02-23, last overall 2026-03-09)
  - sean-brydon: paths `apps/web/public` (24); types feat 15, chore 5, fix 4
  - Hariom Balhara: paths `apps/web/public` (12), `packages/i18n/locales` (2); types feat 8, chore 4, refactor 2
  - Eunjae Lee: paths `apps/web/public` (13), `packages/i18n/locales` (1); types feat 9, fix 3, refactor 2
- P: Aykut Güney 1 (8%, 2026-10→2026-10-19, last overall 2026-10-19); 陈志谦 1 (8%, 2026-09→2026-09-20, last overall 2026-09-20); Khidhir Zyenn 1 (8%, 2026-09→2026-09-12, last overall 2026-09-12)

### Docs & planning (`docs-planning`, low)
Human commits: window 142 by 43 people; post 11 by 10.

- W: Eunjae Lee 17 (12%, 2025-11→2026-02-07, last overall 2026-03-12); Peer Richelsen 16 (11%, 2026-01→2026-04-15, last overall 2026-04-15); Lauris Skraucis 12 (8%, 2025-10→2026-02-05, last overall 2026-02-19); Morgan 11 (8%, 2025-11→2026-02-04, last overall 2026-03-13)
  - Eunjae Lee: paths `.cursor/skills/vercel-react-best-practices` (47), `.goose/skills/vercel-react-best-practices` (47), `agents/skills/vercel-react-best-practices` (47); types docs 12, refactor 2, feat 1
  - Peer Richelsen: paths `docs/api-reference/v2` (6), `apps/web/app` (3), `README.md` (2); types other 13, docs 1, feat 1
  - Lauris Skraucis: paths `docs/api-reference/v2` (10), `docs/platform/atoms` (1), `apps/api/v2` (1); types docs 7, feat 3, refactor 2
- P: Peer Richelsen 2 (18%, 2026-04→2026-04-15, last overall 2026-04-15); JackAnsh23 1 (9%, 2026-09→2026-09-06, last overall 2026-09-06); Alana Anjos 1 (9%, 2026-07→2026-07-06, last overall 2026-07-06)

### removed-ee (`removed-ee`, low) — removed at HEAD (history only)
Human commits: window 328 by 43 people; post 3 by 3.

- W: sean-brydon 46 (14%, 2025-10→2026-02-23, last overall 2026-02-23); Benny Joo 32 (10%, 2025-10→2026-02-24, last overall 2026-04-15); Anik Dhabal Babu 30 (9%, 2025-11→2026-02-23, last overall 2026-03-10); Joe Au-Yeung 28 (9%, 2025-10→2026-02-23, last overall 2026-03-09)
  - sean-brydon: paths `packages/features/ee` (213), `packages/trpc/server` (50), `packages/features/pbac` (10); types feat 25, fix 12, other 3
  - Benny Joo: paths `packages/features/ee` (115), `packages/trpc/server` (75), `apps/web/modules` (56); types refactor 25, other 3, fix 3
  - Anik Dhabal Babu: paths `packages/features/ee` (47), `packages/trpc/server` (10), `apps/web/modules` (3); types fix 21, other 3, refactor 2
- P: SreeCharan Desu 1 (33%, 2026-07→2026-07-08, last overall 2026-07-08); Romit 1 (33%, 2026-04→2026-04-22, last overall 2026-05-05); Pedro Castro 1 (33%, 2026-04→2026-04-15, last overall 2026-04-16)

### companion (`companion`, low) — removed at HEAD (history only)
Human commits: window 95 by 8 people; post 0 by 0.

- W: Dhairyashil Shinde 45 (47%, 2025-12→2026-02-14, last overall 2026-03-04); Beto 16 (17%, 2025-12→2026-01-26, last overall 2026-01-26); Volnei Munhoz 13 (14%, 2025-12→2026-02-14, last overall 2026-02-26); Peer Richelsen 11 (12%, 2025-12→2026-02-06, last overall 2026-04-15)
  - Dhairyashil Shinde: paths `companion/components/screens` (145), `companion/app/(tabs)` (124), `companion/components/event-type-detail` (73); types feat 27, fix 10, other 5
  - Beto: paths `companion/app/(tabs)` (26), `companion/app.json` (8), `companion/package.json` (7); types feat 7, refactor 4, fix 3
  - Volnei Munhoz: paths `companion/package.json` (6), `companion/services/oauthService.ts` (2), `companion/extension/entrypoints` (1); types other 5, chore 4, fix 2
- P: none (pre-conversion / history-only)

## Post-conversion team (who answers questions now)
Evidence (post epoch, human counted commits = 103, 59 people):
- **Romit** — 20 commits, 2026-04-22..2026-05-05 (last overall 2026-05-05), all `cleanup`/`refactor` of leftovers from the removal (entrypoints of deleted workspaces, dead insights references, webhooks instant-meeting trigger). Touched webhooks 14, booking 13, platform-infra 11, accounts 7. Not active after early May.
- **Anirban Singha** — 10 commits, 2026-04-20..2026-08-08: fix/refactor in booking (9), apps-marketplace (7), identity (6), accounts (6) — e.g. emails reply-to fix, credential query moved to repository, booker lint cleanup.
- **Chayan Das** (5, 2026-06-11..07-01, accounts/UI fixes), **Gaurav Kumar** (4, 2026-07-03..08-05, emails ICS, i18n, foundations), **shafi-VM** (3, last 2026-09-04, payments). Everyone else has one commit (drive-by fixes, last 2026-10-19).
- Pre-conversion people that also have post commits: Pedro Castro 2, Peer Richelsen 2, Keith Williams 1, Benny Joo 1 — all dated 2026-04-15/16 (conversion-day), so they are not evidence of continued activity.

## Concentration
Baseline: 183 humans in window (59 post); max individual share 8.3% of all commits. Capability is **concentrated** only if top person ≥20% of its commits and ≥3× their team-wide share.

| capability | top person | share of cap | team-wide share | ratio | cap commits | verdict |
|---|---|---|---|---|---|---|
| booking | Anik Dhabal Babu | 13.4% | 8.3% | 1.6× | 359 | not concentrated |
| availability | Benny Joo | 18.0% | 3.8% | 4.8× | 100 | not concentrated |
| event-types | Benny Joo | 13.0% | 3.8% | 3.4× | 154 | not concentrated |
| calendars | Volnei Munhoz | 17.8% | 4.6% | 3.8× | 90 | not concentrated |
| conferencing | Volnei Munhoz | 13.6% | 4.6% | 2.9× | 44 | not concentrated |
| payments | Anik Dhabal Babu | 15.1% | 8.3% | 1.8× | 53 | not concentrated |
| webhooks | Syed Ali Shahbaz | 22.7% | 1.4% | 16.2× | 44 | concentrated |
| apps-marketplace | Anik Dhabal Babu | 12.2% | 8.3% | 1.5× | 197 | not concentrated |
| identity | sean-brydon | 11.0% | 5.6% | 2.0× | 136 | not concentrated |
| accounts | sean-brydon | 19.9% | 5.6% | 3.6× | 276 | not concentrated |
| notifications | Benny Joo | 16.2% | 3.8% | 4.3× | 37 | not concentrated |
| embeds | Hariom Balhara | 25.0% | 4.9% | 5.1× | 40 | concentrated |
| admin-safety | Eunjae Lee | 38.6% | 5.4% | 7.2× | 88 | concentrated |
| public-api | Morgan | 17.1% | 4.5% | 3.8× | 327 | not concentrated |
| platform-infra | Keith Williams | 20.0% | 7.0% | 2.9× | 475 | not concentrated |
| foundations | Eunjae Lee | 10.8% | 5.4% | 2.0× | 268 | not concentrated |
| ui-kit | Eunjae Lee | 13.6% | 5.4% | 2.5× | 88 | not concentrated |
| data-model | Joe Au-Yeung | 11.5% | 3.3% | 3.5× | 96 | not concentrated |
| i18n | sean-brydon | 12.4% | 5.6% | 2.2× | 193 | not concentrated |
| docs-planning | Eunjae Lee | 12.0% | 5.4% | 2.2× | 142 | not concentrated |
| removed-ee | sean-brydon | 14.0% | 5.6% | 2.5× | 328 | not concentrated (history-only) |
| companion | Dhairyashil Shinde | 47.4% | 5.7% | 8.4× | 95 | concentrated (history-only) |

Reading:
- `evidence`: window-level concentration is real in **admin-safety** (Eunjae Lee 39%, 7×), **webhooks** (Syed Ali Shahbaz 23%, ~16×; small contributor base 21 people), **embeds** (Hariom Balhara 25%, 5×), **accounts** (sean-brydon 20%, 3.6×), **companion** (Dhairyashil Shinde 47%, history-only). Borderline (<20%, ≥3× team share): availability (Benny Joo 18%), calendars (Volnei Munhoz 18%), public-api (Morgan 17%), notifications (Benny Joo 16%). Platform-infra: Keith Williams 20% but only 2.9× his team-wide share (7%) — infra owner pattern, shared cause per rule 4, not ranked as risk.
- Booking, apps-marketplace, identity, foundations, i18n, data-model, event-types, payments, conferencing: top share ≤15–18%, spread over 20–55 people — no concentration.
- **All of those concentrated owners (Eunjae, Syed, Hariom, sean-brydon, Dhairyashil, Morgan, Volnei, Benny, Keith) have zero or one post-conversion commit.** `inference`: the knowledge holders are no longer visible in repo activity; the post-conversion team is not the window team, so a window bus-factor claim would mislead. Post-epoch the work is spread over 59 people at ~1 commit each; capabilities with exactly one post-conversion person: admin-safety (Chayan Das), data-model (Romit 2) — tiny samples, not concentration.
- Mechanical: platform-infra and i18n/docs ownership reflects a role (infra/release, translation) not a risk (rule 4/8). Topic-prefix `fix` ratios in CI/UI are iteration (rule 5), not used here.
- Team ≫3, so the "list capabilities touched by one person ever" rule is not applied; not computed.

## Agent co-authorship
Context only (human commits kept). Human counted commits with an AI-agent `Co-authored-by` trailer (Devin, Claude, Copilot/Cursor/cubic, bot_apk): **687 of 1853 (37%) window; 7 of 103 (7%) post**. Agent-authored commits (devin-ai-integration[bot], 16 counted) are activity, not people; counted per capability in the last column.

| capability | human commits W | agent-co W (share) | human commits P | agent-co P | agent-authored commits (W) |
|---|---|---|---|---|---|
| booking | 359 | 174 (48%) | 18 | 1 | 2 |
| availability | 100 | 44 (44%) | 4 | 1 | 1 |
| event-types | 154 | 66 (42%) | 11 | 1 | 6 |
| calendars | 90 | 52 (57%) | 2 | 0 | 1 |
| conferencing | 44 | 19 (43%) | 2 | 0 | 0 |
| payments | 53 | 28 (52%) | 4 | 0 | 0 |
| webhooks | 44 | 20 (45%) | 2 | 1 | 1 |
| apps-marketplace | 197 | 92 (46%) | 7 | 1 | 1 |
| identity | 136 | 56 (41%) | 6 | 0 | 1 |
| accounts | 276 | 118 (42%) | 12 | 0 | 0 |
| notifications | 37 | 19 (51%) | 3 | 0 | 0 |
| embeds | 40 | 21 (52%) | 2 | 0 | 0 |
| admin-safety | 88 | 58 (65%) | 1 | 0 | 0 |
| public-api | 327 | 133 (40%) | 11 | 0 | 2 |
| platform-infra | 475 | 225 (47%) | 14 | 0 | 2 |
| foundations | 268 | 125 (46%) | 12 | 0 | 2 |
| ui-kit | 88 | 33 (37%) | 6 | 0 | 1 |
| data-model | 96 | 54 (56%) | 2 | 0 | 1 |
| i18n | 193 | 88 (45%) | 12 | 1 | 4 |
| docs-planning | 142 | 55 (38%) | 11 | 2 | 3 |
| removed-ee | 328 | 162 (49%) | 3 | 0 | 2 |
| companion | 95 | 17 (17%) | 0 | 0 | 0 |

Reading: share is highest in admin-safety (66%), calendars (58%), data-model (56%), payments (53%), embeds (52%), notifications (51%) and lowest in docs-planning/ui-kit/companion (18-39%). Agent use was a pre-conversion workflow (≈479 Devin trailers); in the post epoch only 7 trailers. `inference`: pre-conversion commit authors often steered agents, so "who changed X" reflects who reviewed/steered, which fits the question of whom to ask.

## Implications
- Asking pre-conversion owners is only possible if they remain reachable outside the repo: the window's owners have not committed since March/April 2026. For `inference`-level questions about a change someone may already have tried, read PRs by their name before touching: admin-safety/feature flags → Eunjae Lee; webhooks → Syed Ali Shahbaz; embeds/booker embed → Hariom Balhara and Volnei Munhoz; calendars/conferencing/credentials → Volnei Munhoz, Udit Takkar; availability/event-types → Benny Joo; accounts/settings/identity → sean-brydon; public API v2/atoms → Morgan, Rajiv Sahal, Alex van Andel; infra/CI/releases → Keith Williams, Alex van Andel; payments → Anik Dhabal Babu, Joe Au-Yeung; booking core → Anik Dhabal Babu, Hariom Balhara, Eunjae Lee; data-model → Joe Au-Yeung, sean-brydon, Alex van Andel; i18n → sean-brydon. PRs are found in subjects `(#NNNN)`; reverts as `Revert`.
- For code as it stands now (post conversion), the only people with current context on how the removal was done are Romit (cleanup of leftovers, to 2026-05-05) and Anirban Singha (booking/app-store/identity fixes, to 2026-08-08). Removed-ee areas (teams/org/billing/workflows/insights/routing forms/round-robin): history owners are in `removed-ee` and nobody maintains them at HEAD; companion moved to calcom/companion.
- A forge (`gh`) would have added reviewer/approver names, CODEOWNERS-style review requests and PR reviewers per capability; none of that is in git.

## Unknowns
- `unknown`: who is on the current Cal.diy maintainer team; the 59 post-conversion names are mostly one-off contributors. No CODEOWNERS/ownership file was read; formal ownership is unknown. (Checking `.github/CODEOWNERS` is a one-liner for a follow-up; not done here.)
- `unknown`: reviewers and approvers (git shows authors only); whether the ex-Cal.com staff still maintain the upstream Cal.com repo.
- `unknown`: identity merge limits: authors with different names and different e-mails (190 names/194 e-mails in contract vs 183 after merging by e-mail and exact name) could remain split; 6 e-mail merges applied automatically (e.g. a handle and real name for the same address).
- Share statistics are for commits touching a capability, not lines. Commits attributed to several capabilities overlap. Of 110 post commits: 103 human counted, 1 agent-authored counted (activity), 6 uncounted (5 human bump-only/mass-type, 1 agent).
- Post-epoch statistics (103 commits) are small; treat percentages there as anecdotal.

## Commands run
- `scan.load()` over `.work/git-log.txt`; `scan.attribute/is_noise` per touched file per commit.
- Union-find identity merge by e-mail then by name (in-memory, not stored); per-capability / per-epoch author counts, first/last dates, top path prefixes and conventional-commit types; agent co-author regex over the `Co-authored-by` field (`devin|anthropic|claude|cognition|copilot|cursor|cubic|[bot]|bot_apk`).
- Read: agent-people.md, scan-contract.md, false-signals.md.
