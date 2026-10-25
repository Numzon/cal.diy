# Evidence: history

Source: git history only (`.work/git-log.txt` via `scan.load()`, attribution `scan.attribute()`, noise `scan.is_noise()`). No source files read. Forge CLI (`gh`) unavailable: issue labels, PR review threads and "bug"-labelled PRs are NOT in this file (see Unknowns).

- **Window**: 2025-10-26..2026-10-19 (12 months to HEAD `0f19cc46ef`); trend bucket = calendar quarter (+ month for the post epoch). 2025Q4 holds only 6 days of Oct-26..31 plus Nov/Dec; 2026Q4 holds 3 days (Oct 1-19).
- **Commits**: 1982 in window, **1870 counted** (excluded: 25 bot, 11 mass incl. `ab21c7f8`, 76 bump-only; 16 counted commits are Devin-authored = activity, not people). 2 counted commits touch only noise files, so 1868 carry code/doc changes. 13,322 non-noise file changes (238 noise file changes dropped: lock/binary/snapshot/generated).
- **Epochs**: `pre` = 1766 counted commits (Cal.com era, up to the Cal.diy conversion `ab21c7f8`, 2026-04-15); `post` = **104** counted (Apr 15 .. Oct 19). Of the post commits, 35 are the first 2 weeks of conversion follow-up (Apr 15-30), **69 are May..Oct** (the real steady state).
- **Fix heuristic** (all fix numbers): subject matches `\b(fix|fixes|fixed|bug|bugfix|hotfix|revert|regression|broken|incident)` (case-insens.). "Strict fix" = conventional-commit prefix `fix` / `fix(...)`. A commit counts once per capability touched (contract counting rule). Overall: broad 942/1870 = 50.4 %, strict 841/1870 = **45.0 % baseline** (`fix:` is the repo's default commit type, so compare capabilities against 45-50 %, not 0 %).
- **Co-change rule**: per commit the set of capabilities with ≥1 non-noise file; `unmapped` ignored; commits touching ≥12 of the 23 ids dropped (12 dropped: e.g. `648ad72a` i18n extraction, `96bec9f7` repos move, `bf348ee2` Icon migration, `a1e53848` node: prefix, `bbf9274d` Vitest upgrade, `c380ea81`/`a4d46263` font rename + its revert, `51b3f5c7` Atoms revert).

## Activity per capability

Changes = non-noise file changes; commits = commits touching the capability (a commit counts once per capability, so commit column sums to more than 1870). Agent = Devin-authored counted commits touching the capability.

| capability | changes | % of 13,322 | commits | post changes | post commits | agent commits |
|---|---:|---:|---:|---:|---:|---:|
| booking | 1518 | 11.4 | 361 | 45 | 18 | 2 |
| public-api | 1397 | 10.5 | 329 | 14 | 11 | 2 |
| platform-infra | 985 | 7.4 | 477 | 20 | 14 | 2 |
| accounts | 872 | 6.5 | 277 | 24 | 12 | 0 |
| foundations | 765 | 5.7 | 270 | 21 | 12 | 2 |
| apps-marketplace | 738 | 5.5 | 198 | 16 | 7 | 1 |
| docs-planning (548/631 = 87 % are .md/.mdx) | 631 | 4.7 | 145 | 15 | 12 | 3 |
| admin-safety | 402 | 3.0 | 88 | 1 | 1 | 0 |
| event-types | 397 | 3.0 | 160 | 17 | 11 | 6 |
| calendars | 378 | 2.8 | 91 | 15 | 2 | 1 |
| identity | 365 | 2.7 | 137 | 12 | 6 | 1 |
| i18n | 344 | 2.6 | 197 | 14 | 12 | 4 |
| ui-kit | 318 | 2.4 | 89 | 7 | 6 | 1 |
| webhooks | 292 | 2.2 | 45 | 15 | 2 | 1 |
| availability | 267 | 2.0 | 101 | 8 | 4 | 1 |
| data-model | 155 | 1.2 | 97 | 2 | 2 | 1 |
| payments | 127 | 1.0 | 53 | 8 | 4 | 0 |
| notifications | 119 | 0.9 | 37 | 5 | 3 | 0 |
| embeds | 110 | 0.8 | 40 | 3 | 2 | 0 |
| conferencing | 90 | 0.7 | 44 | 2 | 2 | 0 |
| **unmapped** | 115 | 0.9 | 66 | 1 | 1 | 0 |
| *removed at HEAD:* removed-ee | 1837 | 13.8 | 331 | 8 (residual files) | 3 | 2 |
| *removed at HEAD:* companion | 1100 | 8.3 | 95 | 0 | 0 | 0 |

- Live (non-removed) capabilities carry 10,385 changes (77.9 % of non-noise); removed-ee + companion = 22.1 % of window volume and are history-only (companion removed 2026-02-16, removed-ee 2026-04-15).
- **Unmapped = 0.9 % (115 changes, 66 commits)**; top unmapped paths are single touches (`apps/web/lib/booking.ts`, `skills/calcom-api/*`, old `teams/*` pages) — evidence that the capability table is not hiding volume. Catch-all buckets (platform-infra, foundations, docs-planning) hold 17.8 % of changes; platform-infra is partly a catch-all (`apps/web/package.json`, `turbo.json`).
- **Agent-authored**: 16 of 1870 counted commits (0.9 %); event-types has 6 of its 160 (3.8 %), i18n 4 of 197. Human commits with agent co-author trailers (≈662 in contract) are not separated here. Post epoch: 1 agent commit (2026-04-15, docs).
- **Post-conversion-only ranking** (changes / commits): booking 45/18, accounts 24/12, foundations 21/12, platform-infra 20/14, apps-marketplace 16/7, webhooks 15/2, docs-planning 15/12, calendars 15/2, public-api 14/11, i18n 14/12. At ≤45 changes per capability in 6 months these rankings are weak evidence (n is tiny): treat as "survivors", not hot zones.

## Top files in top capabilities

Whole window (touch count = commits touching the file), then HEAD-existence in the Hub/freshness table. `†` = deleted or moved at HEAD.

| capability | top files (count) |
|---|---|
| booking | `packages/features/bookings/lib/service/RegularBookingService.ts` (44), `…/repositories/BookingRepository.ts` (32), `…/lib/handleCancelBooking.ts` (23), `apps/web/modules/bookings/views/bookings-single-view.tsx` (23), `trpc/…/bookings/confirm.handler.ts` (21), `BookingDetailsSheet.tsx` (20) |
| public-api | `packages/platform/libraries/index.ts` (20), `apps/api/v2/src/ee/bookings/2024-08-13/services/bookings.service.ts` † (16, now `src/platform/…`), `packages/platform/atoms/package.json` (16), `…2024-04-15/controllers/bookings.controller.ts` † (13), `atoms/booker/BookerPlatformWrapper.tsx` (13), `atoms/availability/AvailabilitySettings.tsx` (12) |
| platform-infra | `apps/web/package.json` (46), `.github/workflows/pr.yml` (33), `turbo.json` (28), `biome.json` (28), `.env.example` (19), `.github/workflows/devin-conflict-resolver.yml` † (17; removed 2026-04-01 `82ccdc8e`) |
| accounts | `packages/features/users/repositories/UserRepository.ts` (24), `SettingsLayoutAppDirClient.tsx` (22), `modules/onboarding/getting-started/onboarding-view.tsx` (16), `modules/shell/Shell.tsx` (14), `onboarding/hooks/useCreateTeam.ts` † (13) |
| foundations | `packages/features/di/tokens.ts` (14), `packages/lib/constants.ts` (13), `packages/types/Calendar.d.ts` (12), `apps/web/app/layout.tsx` (9), `CalEventParser.ts` (8) |
| apps-marketplace | `app-store/hubspot/lib/CrmService.ts` (10), `app-store/_utils/getCalendar.ts` (10), `app-store/locations.ts` (9), `routing-forms/…/Forms.tsx` † (9), `salesforce/lib/CrmService.ts` (8) |
| docs-planning | `docs/api-reference/v2/openapi.json` (45, deleted — `docs/` has 1 tracked file), `README.md` (20), `AGENTS.md` (14), `agents/knowledge-base.md` (11) |
| event-types | `features/eventtypes/repositories/eventTypeRepository.ts` (24), `trpc/…/eventTypes/heavy/update.handler.ts` (14), `EventAdvancedTab.tsx` (11), `eventtypes/lib/types.ts` (11) |
| admin-safety | `features/flags/config.ts` (12), `feature-opt-in/services/FeatureOptInService.ts` (9), `trpc/…/featureOptIn/_router.ts` † (8, deleted by `ab21c7f8`) |
| removed-ee (history) | `ee/workflows/…/EmailWorkflowService.ts` (19), `ee/round-robin/roundRobinManualReassignment.ts` (13), `ee/managed-event-types/…/handleChildrenEventTypes.ts` (12), `ee/teams/repositories/TeamRepository.ts` (12) |
| companion (history) | `companion/package.json` (30), `(tabs)/(event-types)/index.tsx` (19), `extension/entrypoints/content.ts` (18) |

Post-epoch hot files (n ≤ 5, weak): `packages/i18n/locales/en/common.json` (5), `README.md` (5), `apps/web/app/providers.tsx` (2), `apps/web/pages/_app.tsx` (2), `packages/features/bookings/lib/EventManager.ts` (2).

## Trend

Counted commits per month, whole window: Oct-25 (6 days) 83 · Nov 243 · Dec 446 · **Jan-26 584** · Feb 295 · Mar 88 · Apr 62 (27 pre + 35 post) · May 8 · Jun 26 · Jul 12 · Aug 6 · Sep 14 · Oct (1-19) 3. Quarters: 2025Q4 772 · 2026Q1 967 · 2026Q2 96 (27 pre + 69 post) · 2026Q3 32 · 2026Q4 3.

- **Activity collapsed before the conversion, not at it**: Feb→Mar pre-conversion volume fell 295 → 88 (-70 %). Conversion on Apr 15 then freezes into a trickle.
- **8+ weeks idle trickle (finding, evidence)**: May-Oct = 69 counted commits over 172 days (≈12 / 30 d vs ≈320 / 30 d in the pre epoch Q4-Q1). Longest gaps between counted post-epoch commits: 27 d (Sep 20 → Oct 18), 23 d (Aug 8 → Sep 1), 18 d (May 15 → Jun 2), 13 d (Jul 9 → Jul 22). Aug 2026 has 6 commits. Fix share of these 69: **50/69 = 72 %** strict `fix` prefix (vs 44 % pre): the repo is in maintenance mode (sample of subjects: locale completions, `@ts-expect-error` restore, 401 vs 409, IP header trim, React 19 ref warning, typos).

Commits per capability per bucket (`Q4` = 2025-10-26..12-31, `Q1`, `Q2` = Apr-Jun, `Q3`, `Q4'26` = Oct 1-19). Rate = commits per 30 days; "Q4→Q1" are both pre-epoch; "post" = Apr 15..Oct 19 (187 d).

| capability | 25Q4 | 26Q1 | 26Q2 | 26Q3 | 26Q4 | Q4→Q1 rate /30d | post rate /30d | share of pre commits → share of post | label |
|---|--:|--:|--:|--:|--:|---|--:|---|---|
| platform-infra | 190 | 268 | 19 | 0 | 0 | 85 → 89 | 2.2 | 26.2 % → 13.5 % | constant, then fading (0 commits after Jun) |
| booking | 153 | 185 | 17 | 5 | 1 | 69 → 62 | 2.9 | 19.4 % → 17.3 % | constant (share holds); most active survivor |
| public-api | 126 | 192 | 9 | 2 | 0 | 56 → 64 | 1.8 | 18.0 % → 10.6 % | rising pre (+14 %), fading post |
| accounts | 117 | 146 | 12 | 2 | 0 | 52 → 49 | 1.9 | 15.0 % → 11.5 % | constant; onboarding-v2 / team-creation campaign Nov-Jan |
| foundations | 122 | 133 | 7 | 7 | 1 | 55 → 44 | 1.9 | 14.6 % → 11.5 % | fading pre, steady trickle post (7 in Q3) |
| apps-marketplace | 77 | 113 | 5 | 3 | 0 | 35 → 38 | 1.1 | 10.8 % → 6.7 % | constant, fading post |
| i18n | 75 | 108 | 6 | 7 | 1 | 34 → 36 | 1.9 | 10.5 % → 11.5 % | constant; **seasonal/bursty** post (locale PRs: 0-4 per month) |
| event-types | 62 | 86 | 10 | 2 | 0 | 28 → 29 | 1.8 | 8.4 % → 10.6 % | constant |
| docs-planning | 44 | 86 | 13 | 2 | 0 | 20 → 29 | 1.9 | 7.5 % → 11.5 % | rising pre (agent rules/knowledge-base, openapi); mechanical (prose, false-signal 8) |
| identity | 53 | 76 | 8 | 0 | 0 | 24 → 25 | 1.0 | 7.4 % → 5.8 % | constant, silent after Jun |
| availability | 45 | 52 | 2 | 0 | 2 | 20 → 17 | 0.6 | 5.5 % → 3.8 % | constant, near-silent post |
| data-model | 38 | 57 | 2 | 0 | 0 | 17 → 19 | 0.3 | 5.4 % → 1.9 % | fading post (2 post commits) |
| calendars | 35 | 54 | 0 | 1 | 1 | 16 → 18 | 0.3 | 5.0 % → 1.9 % | fading post |
| ui-kit | 44 | 39 | 4 | 2 | 0 | 20 → 13 | 1.0 | 4.7 % → 5.8 % | fading pre (-34 %), trickle post |
| admin-safety | 24 | 63 | 1 | 0 | 0 | 11 → 21 | 0.2 | 4.9 % → 1.0 % | **rising** to Jan (feature opt-in campaign), then dead (1 post commit) |
| payments | 17 | 32 | 1 | 3 | 0 | 8 → 11 | 0.6 | 2.8 % → 3.8 % | rising pre, thin post |
| webhooks | 17 | 25 | 3 | 0 | 0 | 8 → 8 | 0.3 | 2.4 % → 1.9 % | constant, silent after Jun |
| conferencing | 15 | 26 | 3 | 0 | 0 | 7 → 9 | 0.3 | 2.4 % → 1.9 % | constant, silent |
| embeds | 15 | 23 | 1 | 1 | 0 | 7 → 8 | 0.3 | 2.2 % → 1.9 % | constant, silent |
| notifications | 11 | 23 | 2 | 1 | 0 | 5 → 8 | 0.5 | 1.9 % → 2.9 % | rising pre, thin post |
| unmapped | 38 | 26 | 2 | 0 | 0 | 17 → 9 | 0.2 | n/a | fading |
| *removed-ee* | 152 | 170 | 8 | 1 | 0 | 68 → 57 | 0.5 | 18.6 % → 2.9 % | fading; deleted Apr 15 |
| *companion* | 43 | 52 | 0 | 0 | 0 | 19 → 17 | 0 | 5.4 % → 0 | campaign Dec-Feb (43/44/8 per month Dec/Jan/Feb), removed Feb 16 |

Campaigns visible in subjects/dates: **companion app** (Expo + Chrome extension, Dec-Feb, then moved to calcom/companion `f8a93414`); **Jan 2026 "stabilise" spike** — 584 commits in Jan with 19 reverts Jan 9..Feb 17 (see Fix pressure); **onboarding-v2/team creation** (accounts, Nov-Jan); **feature opt-in** (admin-safety, peak Jan = 33); **repo restructures**: `648ad72a` i18n package (2026-02-23), `96bec9f7`/`cb7844fd` repositories move, `a4d46263` font rename and revert, `ab21c7f8` Cal.diy conversion; **agent docs**: `agents/` rules (docs-planning rising).

## Fix pressure

Per capability (commits touching it; broad heuristic = 942 commits overall; strict = `fix:` prefix). "Mech-fix" = fix subjects that also match CI / build / test / lint / release / UI-polish keywords (`ci, e2e, flaky, workflow, lint, biome, build, docker, release, style, spacing, align, layout, css, ui`) — an upper bound on trial-and-error fixes (false-signal 5). Clean fix % = non-revert, non-mechanical fix commits ÷ commits. Post = strict `fix` commits in post epoch / commits in post epoch. Reverts = subject match `^revert|\brevert\b` (26 raw, incl. one false positive, see below). Cross-cut = fix commits touching >3 capabilities.

| capability | commits | fix commits | fix % broad | strict % | mech-fix | clean fix % | reverts (raw) | cross-cut fixes | post strict fix |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--|
| ui-kit | 89 | 53 | **60** | 52 | 22 | 33 | 2 | 13 | 4/6 |
| conferencing | 44 | 23 | 52 | 50 | 2 | 43 | 2 | 9 | 2/2 |
| embeds | 40 | 21 | 52 | 40 | 8 | 25 | 3 | 10 | 1/2 |
| booking | 361 | 172 | **48** | 44 | 33 | 37 | 7 | 34 | 8/18 |
| payments | 53 | 25 | 47 | 47 | 5 | 36 | 1 | 7 | 3/4 |
| event-types | 160 | 74 | 46 | 43 | 19 | 34 | 1 | 20 | 5/11 |
| apps-marketplace | 198 | 90 | 45 | 38 | 16 | 33 | 8 (7 real) | 24 | 2/7 |
| identity | 137 | 62 | 45 | 39 | 7 | 36 | 6 | 19 | 2/6 |
| accounts | 277 | 120 | 43 | 35 | 24 | 31 | 10 | 16 | 8/12 |
| public-api | 329 | 134 | 41 | 36 | 23 | 32 | 6 | 19 | 10/11 |
| foundations | 270 | 108 | 40 | 36 | 15 | 32 | 6 | 30 | 8/12 |
| availability | 101 | 39 | 39 | 34 | 9 | 29 | 1 | 11 | 2/4 |
| calendars | 91 | 35 | 38 | 37 | 3 | 33 | 2 | 11 | 1/2 |
| notifications | 37 | 14 | 38 | 35 | 0 | 35 | 1 | 5 | 1/3 |
| platform-infra | 477 | 177 | 37 | 32 | **72** | **19** | 12 (11 real) | 26 | 5/14 |
| i18n | 197 | 67 | 34 | 30 | 4 | 31 | 2 | 14 | 11/12 |
| admin-safety | 88 | 27 | 31 | 26 | 3 | 25 | 2 | 7 | 1/1 |
| webhooks | 45 | 13 | 29 | 27 | 1 | 22 | 2 | 5 | 1/2 |
| docs-planning | 145 | 40 | 28 | 22 | 0 | 28 | 0 | 1 | 5/12 |
| data-model | 97 | 19 | 20 | 16 | 4 | 13 | 2 | 5 | 0/2 |
| *removed-ee* | 331 | 141 | 43 | 37 | 28 | 32 | 7 | 24 | 2/3 |
| *companion* | 95 | 33 | 35 | 23 | 4 | 31 | 0 | 2 | — |

**Reading the subjects (false-signals 5 and 12):**
- *platform-infra* (37 % broad, lowest clean ratio 19 %): of its 165 non-revert fix commits 72 are CI/build/test/release keyword fixes. 16-subject sample: `fix: changesets release to npm`, `fix: draft release trigger`, `fix(docker): correct build context`, `test: fix flaky`, `fix: remove labeled trigger to prevent workflow reruns`, `fix: cancel running CI workflow before re-triggering` — **mechanical** (iteration on pipelines). The sample also shows product fixes that only touched `apps/web/package.json`-type files (`fix: wrong credentials`, `fix: scroll issues in Embed`), i.e. platform-infra's catch-all footprint inflates it. Not a fragility signal.
- *ui-kit* (highest fix share, 60 %): sample is polish (`ProgressBar styling is hardcoded in dark mode`, `popover ios issue`, `align confirmation dialog header and footer`, `CommandInput focus`); only 1/53 matched CI keywords but most are visual tweaks. **Mechanical (UI polish)**: demoted. Also includes `fix: revert bookings redesign (#25172)` and the font-rename revert.
- *i18n*: fixes are locale completions (`complete Turkish locale`, `add missing Japanese translations`) — **mechanical**; 11/12 post commits are locale fixes.
- *conferencing / embeds / payments*: tiny n (44 / 40 / 53) — percentages not stable.
- *booking* (172 fix commits, 48 %, 34 cross-cutting, 7 reverts; 33 mechanical) is the only high-criticality capability with both high volume and a fix share above baseline; sits at the median of strict share (44 %), so "elevated" mostly reflects its churn. *apps-marketplace* has 8 raw reverts; 5 were Feb 5 (`9a287ac8`, `a8e1cbee`: analytics-schema validation reverted twice in one day) and Dec 24 (`7f59a1f0`: freebusy batching reverted).

**Reverts as their own count**: 26 subject matches; `4162b5be` ("remove Revert.dev dependency from Pipedrive") is a false positive → **25 real reverts** (1.3 % of counted commits), **all pre-conversion; 0 after**. 19 fall between 2026-01-09 and 2026-02-17 (10 in Feb, 9 in Jan), 6 in Nov-Dec 2025. 9 of the 25 touch >3 capabilities. Largest, attributed to the capability they were about (rule 12):
| commit | files / capabilities touched | about | spillover note |
|---|---|---|---|
| `51b3f5c7` (2026-02-03) revert of `b3430c8e` "fix Atoms build failures on CI" | 108 / 12 | public-api (Atoms) + foundations build | revert-of-mass-commit; inflates revert/fix counts of accounts, admin-safety, apps-marketplace, booking, embeds, event-types, identity, removed-ee, webhooks; dropped from co-change |
| `a4d46263` (2026-01-12) revert font rename (`c380ea81`) | 74 / 13 | ui-kit (design token rename) | spillover to 12 other capabilities; dropped from co-change |
| `1f102bf3` (2025-11-14) revert bookings redesign | 35 / 6 | booking (+ ui-kit) | genuine booking reversal |
| `227ed64b` / `f5a813f5` (Feb 13, revert & re-revert #27933) | 9 / 4 | accounts, data-model, identity | churn: reverted then un-reverted |
| `3a7122d6` (Feb 17) "revert assignmentReason breaking change in webhook payloads" | 11 / 4 | webhooks / booking payload contract | genuine contract revert |
| `c5fbafd9` (Jan 22) revert team-creation redesign (onboarding-v2) | 13 / 3 | accounts (removed team flow) | deleted feature at HEAD |
| Feb 10 `ee1748db`, `0a68a189`, `abbc8bbb` | 1-2 files each | accounts UI (sticky navbar, fixed header, availability page UI) | UI polish iteration — mechanical |

Ranking after demotion (inference): real fix pressure above baseline sits on **booking**, **event-types**, **conferencing/payments/embeds (small n)** and the public-api/accounts/foundations cluster at ~40 %; platform-infra, ui-kit, i18n are **mechanical**. Absolute fix volume is dominated by booking (172), platform-infra (mech), public-api (134), accounts (120), foundations (108).

## Co-change between capabilities

719 of 1856 kept commits touch >1 capability (1137 single-capability); 220 touch >3 (cross-cutting). Support = commits touching both; confidence = support ÷ commits of the less active side. Removed capabilities excluded from the second table.

**All kept commits (includes cross-cutting, pre-epoch dominated)** — top pairs:
| pair | support | confidence |
|---|--:|--:|
| booking – foundations | 97 | 0.37 |
| platform-infra – public-api | 92 | 0.29 |
| booking – public-api | 80 | 0.25 |
| booking – platform-infra | 77 | 0.22 |
| foundations – removed-ee | 77 | 0.30 |
| accounts – removed-ee | 74 | 0.28 |
| accounts – foundations | 62 | 0.24 |
| accounts – i18n | 59 | 0.30 |
| booking – i18n | 56 | 0.29 |
| docs-planning – public-api | 52 | 0.36 |
| booking – event-types | 49 | 0.32 |
| accounts – identity | 47 | 0.37 |
| apps-marketplace – booking | 49 | 0.26 |

**Live capabilities, commits touching ≤3 capabilities only** (removes feature-rollout sweeps; the tighter signal):
| pair | support | confidence | what drives it (files) |
|---|--:|--:|---|
| platform-infra – public-api | 52 | 0.22 | `apps/web/package.json`, `trigger.version.ts/js` ×3 (apps/web, api v1, api v2), `biome.json`, `apps/api/v2/package.json`, `platform/atoms/package.json`: version-bump / release lockstep → **mechanical** (rules 3, 7) |
| docs-planning – public-api | 43 | 0.33 | `docs/api-reference/v2/openapi.json` (42 of 43) changing with `platform/types/**` inputs and api v2 controllers: the generated/hand-regenerated OpenAPI spec corridor → **mechanical lockstep** (rule 3); the file no longer exists at HEAD (`docs/` deleted), the build-time guard is unknown at HEAD |
| accounts – i18n | 23 | 0.19 | UI view changes + `locales/en/common.json` (22 of the i18n-side touches): translation-key lockstep → **mechanical** (rule 3) |
| booking – public-api | 22 | 0.10 | `handleCancelBooking.ts`, trpc `bookings/_router.tsx`, `RegularBookingService.ts` ↔ api v2 bookings controllers/services and `atoms/booker/Booker*Wrapper.tsx`: **real behavioural coupling** (Booker web vs Atoms twins; API v2 mirrors core booking) |
| docs-planning – platform-infra | 21 | 0.16 | README/AGENTS.md + CI/biome; planning prose → mechanical |
| booking – foundations | 21 | 0.16 | `RegularBookingService.ts` + `packages/lib/webstorage.ts`, `defaultResponder.ts`, `packages/types/Calendar.d.ts` |
| booking – i18n | 16 | 0.13 | booking UI + locale strings → mechanical |
| accounts – identity | 16 | 0.23 | `UserRepository.ts`, `MembershipRepository.ts`, onboarding hooks, `auth-index.e2e.ts`, `onboardingUtils.ts`: onboarding/team-creation flows spanning user + membership + auth (partly removed team flow) |
| apps-marketplace – calendars | 9 | 0.20 | `app-store/_utils/getCalendar.ts` ↔ `calendar-subscription/lib/cache/CalendarCacheWrapper.ts`, `googlecalendar/lib/CalendarService.ts`, `calendar-batch/*`: real |
| booking – event-types | 9 | 0.10 | |
| accounts – event-types | 8 | 0.09 | |

**Post epoch only** (104 commits; support ≥3 only): accounts – identity 3 (conf 0.50, n=6 identity), accounts – platform-infra 3. Below the support floor for everything else → **co-change in the post epoch is not measurable**; treat pre-epoch pairs as the available (and partly obsolete: removed-ee pairs) signal.

Cross-cutting: 220/1856 kept commits touch >3 capabilities (11.9 %); 12 touch ≥12 and were dropped (see header). Pairs involving `removed-ee` (foundations 77, accounts 74, platform-infra 69, booking 69, i18n 57) are **pre-conversion only** and describe the deleted enterprise surface.

## Hub files and freshness

Hub = files co-changing with the most distinct other capabilities (partners seen in ≥2 commits; files with ≥8 touches). Computed twice: (A) commits touching ≤3 capabilities, (B) all kept commits. `HEAD` = `git cat-file -e HEAD:<path>` result (81 named paths checked, 25 deleted/moved).

| file | capability | touches | partners A / B | what it is | HEAD |
|---|---|--:|--:|---|---|
| `apps/web/public/static/locales/en/common.json` | i18n | 90 / 154 | 14 / 18 | English translation catalog (key added with every UI string) → mechanical lockstep (rules 3, 7) | **moved** → `packages/i18n/locales/en/common.json` (`648ad72a`, 2026-02-23); new path has 9 touches, 2/13 partners, 5 post-epoch touches |
| `packages/prisma/schema.prisma` | data-model | 23 / 63 | 7 / 19 | Prisma schema (+ migration lockstep; generated client is excluded noise) → mechanical corridor (rule 3), but it is the true cross-capability data contract | exists |
| `packages/features/users/repositories/UserRepository.ts` | accounts | 10 / 22 | 6 / 14 | user repository used by many flows | exists |
| `packages/features/bookings/lib/service/RegularBookingService.ts` | booking | 14 / 43 | 2 / 17 | booking creation core | exists |
| `packages/features/bookings/lib/handleCancelBooking.ts` | booking | — / 22 | — / 17 | cancel flow | exists |
| `packages/features/bookings/repositories/BookingRepository.ts` | booking | 10 / 31 | 2 / 16 | booking repository | exists |
| `packages/platform/libraries/index.ts`, `bookings.ts` | public-api | — / 18, 12 | — / 16, 13 | barrel exporting core logic to API v2 / Atoms (config-as-code fan-in, rule 2) | exists |
| `packages/features/di/tokens.ts` | foundations | — / 14 | — / 16 | DI token registry (rule 2 fan-in by design) | exists |
| `packages/features/eventtypes/repositories/eventTypeRepository.ts` | event-types | 11 / 24 | 4 / 14 | event-type repository | exists |
| `apps/web/package.json`, `turbo.json`, `biome.json`, `.env.example`, root `package.json` | platform-infra | 36/46, 15/26, 23/28, —/19, 10 | 3, 3, 2, —/13, 2 | shared config; touched on every dep/lint/pipeline change → hub because of workflow (rule 4) | exist |
| `packages/features/auth/lib/next-auth-options.ts` | identity | 13 / 19 | 2 / 13 | NextAuth config | exists |
| `packages/trpc/server/routers/viewer/slots/util.ts` | availability | 8 / 19 | 3 / 12 | slot computation helper | exists |
| `packages/features/tasker/tasker.ts` | platform-infra | — / 10 | — / 12 | background job dispatcher | exists |
| `apps/web/modules/onboarding/hooks/useCreateTeam.ts` | accounts | 10 / 13 | 4 / — | team-creation onboarding hook | **deleted** (team flow, `ab21c7f8`) |
| `apps/web/app/(use-page-wrapper)/settings/(settings-layout)/SettingsLayoutAppDirClient.tsx` | accounts | 13 / 22 | 4 / — | settings navigation | exists |
| `docs/api-reference/v2/openapi.json` | docs-planning | 42 / 45 | 3 / — | generated-in-spirit API spec (rule 3) | **deleted** (`docs/` removed) |
| `packages/platform/atoms/package.json` | public-api | 10 / 16 | 2 / — | package manifest (bumps) → mechanical | exists |

Moved/deleted among all 81 checked hot files (rule 11 — they describe the past):
- **Moved (fold into current path)**: `apps/api/v2/src/ee/{bookings,event-types}/**` → `apps/api/v2/src/platform/**` (`ab21c7f8`, 2026-04-15; the `ee/` folder inside API v2 was renamed, not deleted — `bookings.controller.ts`, `bookings.service.ts`, `event-types.controller.e2e-spec.ts`); `apps/web/public/static/locales/en/common.json` → `packages/i18n/locales/en/common.json`.
- **Deleted**: all `companion/**` top files (Feb 16); `packages/features/ee/**` top files, `trpc/viewer/teams/**` (Apr 15); onboarding team-creation views/hooks (`useCreateTeam.ts`, `team-invite-email-view.tsx`, `organization-brand-view.tsx`); `routing-forms/.../Forms.tsx`; `docs/mint.json`, `docs/api-reference/v2/{introduction.mdx,openapi.json}`; `.github/workflows/devin-conflict-resolver.yml` (Apr 1, `82ccdc8e`); `trpc/viewer/featureOptIn/_router.ts` and `apps/web/modules/feature-opt-in/hooks/useFeatureOptInBanner.ts` (deleted by `ab21c7f8` — admin-safety's feature opt-in surface is partly gone; its remaining footprint at HEAD is `packages/features/flags/**`, `feature-opt-in/**` services/config: unconfirmed beyond the three top files listed, see Unknowns).

## Mechanical signals

- **Fix-heavy ≠ fragile**: platform-infra (CI/release/test trial-and-error, 72 of 165 fixes keyword-matched; clean fix share 19 %), ui-kit (UI polish, 60 % broad), i18n (locale completion), `fix:` is the project's default commit prefix (45 % of all commits) — rules 5 and 8.
- **Co-change hubs that are lockstep**: locale catalog ↔ any UI change (rule 3); `openapi.json` ↔ API controllers/inputs (rule 3, deleted at HEAD); `trigger.version.*` / `package.json` / `biome.json` / `turbo.json` bumps (rules 3, 7); `schema.prisma` ↔ migrations; `packages/platform/libraries/index.ts` and `di/tokens.ts` are registries (rule 2). Pairs platform-infra–public-api, docs-planning–public-api, accounts–i18n are therefore **mechanical**, not hidden contracts; the same cause (release/bump workflow, translation workflow) must be counted once (rule 4).
- **Spillover (rule 12)**: `51b3f5c7` (108 files, 12 capabilities) and `a4d46263` (74 files, 13) inflate raw revert/fix counts of every capability they brushed (accounts 10 reverts, apps-marketplace 8, platform-infra 12 are partly this). `1f102bf3` (35 files, 6 caps) and 10 other multi-cap reverts are about booking/accounts/ui-kit. The false positive `4162b5be` ("Revert.dev" dependency) was removed from the 25-revert count.
- **Docs/planning**: docs-planning is 87 % `.md/.mdx` and 28 % fix share = typos/agent-rule edits; its "rising" label is prose churn (rule 8), never a hot area. Counted as discussion about capabilities, not code.
- **Agents/bots (rule 7)**: 16 counted Devin commits (0.9 %) are activity not people; 25 bot + 76 bump-only commits are excluded by the contract.
- **Idle/trickle (not mechanical, genuine)**: May-Oct 69 commits, 72 % `fix`; don't read post-epoch per-capability shares as trends (n ≤ 18 per capability).

## Unknowns

- `unknown`: bug-labelled issues/PRs, review threads, PR descriptions, CI results — forge CLI absent. A forge would add true bug labels (replace the subject heuristic), reverted-PR linkage beyond subject text, and whether the post-conversion 72 % fix share is from issues filed by external self-hosters.
- `unknown`: capability pairs that should change together but need not co-change here (hand-kept twins): `booking` core (`packages/features/bookings`) ↔ **Atoms Booker** (`packages/platform/atoms/booker/Booker*Wrapper.tsx`) and API v2 bookings services — co-change confidence only 0.10, so a booking change without its API/Atoms twin cannot be seen in history; `prisma/schema.prisma` ↔ `apps/api/v2` DTOs / `packages/platform/types/**` inputs; `event-types` ↔ `public-api` event-type inputs (only 5-6 pair touches); `availability` slot logic ↔ API v2 slots; `webhooks` payload builders ↔ openapi/webhook docs; `locales/en` ↔ the other 60+ locale catalogs (only en changes in lockstep). Whether a build/validator guards `openapi.json` drift now that `docs/` is deleted: unknown (the structure agent can check).
- `unknown (external)`: consumers of API v2 / `@calcom/atoms` / `@calcom/platform-libraries` / the `calcom/companion` repo live outside this repo (rule 10).
- `unknown`: whether post-conversion silence in webhooks, identity, availability, calendars, conferencing, admin-safety means "stable" or "abandoned" — 0-2 commits in 6 months cannot distinguish; co-change for the post epoch has no support ≥3 beyond accounts–identity.
- `unknown`: the pre-conversion volume fell 70 % Feb→Mar (295 → 88) before the Apr 15 conversion; cause not visible in git (staffing, freeze, or upstream moved elsewhere — the people agent may see author counts per month).
- `inference`: the commit counts per capability depend on the 501-pattern table; catch-alls (platform-infra 7.4 %, foundations 5.7 %, docs-planning 4.7 %) are the weakest attributions.
- Recommended tools (not installed): `gh` (issue/PR labels, review comments, bulk revert-PR linkage); a blame-based churn tool (e.g. `git-of-theseus`) for per-line survival; `madge`/`depcruise` (already configured at root) for a runtime-coupling check of the hand-kept twins above.

## Commands run (all this session)

1. `scan.load()` over `.work/git-log.txt`; `scan.attribute()` / `scan.is_noise()` to attribute 13,322 non-noise changes (counted commits only).
2. Python counters in the eval kernel: per-capability changes/commits/post/agent; top files (`cfiles`); per-quarter / month / epoch buckets; per-30-day rates; post-epoch gap analysis (`gaps`).
3. Subject regex `\b(fix|…|incident)` and `^revert|\brevert\b` over counted commits; conventional-commit prefix tally; keyword split for mechanical fixes; random sample of 16 platform-infra and ui-kit fix subjects; read of every revert subject (26) and every 3rd May-Oct commit subject.
4. Co-change: `itertools.combinations` over per-commit capability sets (kept 1856, dropped 12 at ≥12 capabilities, `unmapped` ignored); filtered variant ≤3 capabilities; hub file computation (files ≥8 touches, partners in ≥2 commits); `drivers()` per pair to name the files.
5. `git -c core.quotepath=off cat-file -e HEAD:<path>` for 81 files (25 missing); rename lookups from the parsed log (`R` entries → `ab21c7f8`, `648ad72a`); `git -c core.quotepath=off ls-files | grep` and `git log --diff-filter=DR` for the featureOptIn/devin workflow paths.
