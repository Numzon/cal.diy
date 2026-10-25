# Evidence: discussion
Sources: **git-only** (no `gh`; forge_cli unavailable). Window 2025-10-26..2026-10-19, HEAD 0f19cc46ef. Counted commits only (1870), attribution via `.work/scan.py` (noise files dropped; a commit counts once per capability it touches). Cells are `whole window / post-conversion epoch` (epoch `post` = 104 counted commits after ab21c7f8). `removed-ee` and `companion` are history-only, listed in a separate block.

**Missing without the forge (all `unknown`):** human review activity (reviewers, approvals, review comments), PRs closed without merge, PR size and review latency, issues (opened, open bugs, labels, age of open bugs), PR discussion threads. Therefore the brief's "human review", "closed-unmerged" and "open bugs" columns are `unknown`, not zero. Only merged squash commits are visible; abandoned work is invisible.

## Buzz per capability
Columns: commits; PR-numbered commits (`(#N)` in subject); `fix*` subject commits; revert commits (the commit's own subject, attributed by touched files, so a revert that touched many areas shows in each: see spillover); commits with an AI-agent Co-authored-by trailer (Devin/Claude/Copilot/Cursor/Codex; mechanical, rule 7); wide commits (>3 capabilities touched). Human review / closed-unmerged / open bugs: `unknown` for all rows.

Live capabilities (ranked by commits):

| capability | commits | PR-numbered | fix* | reverts | agent-trailer | wide(>3 caps) | TODO-type markers (HEAD) / per 1k lines | plans |
|---|---|---|---|---|---|---|---|---|
| platform-infra | 477/14 | 444/14 | 155/5 | 10/0 | 227/0 | 114/2 | 21 / 0.57 | 1 (agents rules for CI/Trigger) |
| booking | 361/18 | 361/18 | 162/8 | 5/0 | 171/1 | 142/3 | 74 / 0.76 | 1 spec (cancellation-reason) |
| public-api | 329/11 | 312/11 | 125/10 | 6/0 | 130/0 | 97/2 | 10 / 0.09 (111k lines, mostly spec/schema) | 0 (API rules in agents/) |
| accounts | 277/12 | 275/12 | 104/8 | 10/0 | 113/0 | 98/0 | 22 / 0.74 | 0 |
| foundations | 270/12 | 270/12 | 97/8 | 5/0 | 124/0 | 141/2 | 30 / 0.65 | 0 |
| apps-marketplace | 198/7 | 198/7 | 78/2 | 7/0 | 88/1 | 81/1 | 54 / 1.20 | 0 |
| i18n | 197/12 | 197/12 | 63/11 | 1/0 | 83/1 | 76/0 | 0 | 0 |
| event-types | 160/11 | 160/11 | 70/5 | 1/0 | 71/1 | 71/0 | 16 / 0.49 | 0 |
| docs-planning | 145/12 | 134/12 | 33/5 | 0 | 52/3 | 16/1 | 1 / 0.03 | n/a (is the planning area) |
| identity | 137/6 | 137/6 | 56/2 | 6/0 | 56/0 | 68/1 | 13 / 0.68 | 0 |
| availability | 101/4 | 101/4 | 36/2 | 1/0 | 44/1 | 58/2 | 19 / 0.88 | 0 |
| data-model | 97/2 | 97/2 | 17/0 | 2/0 | 53/0 | 55/1 | 14 / 1.21 | 0 |
| calendars | 91/2 | 91/2 | 34/1 | 1/0 | 52/0 | 46/1 | 19 / 0.68 | 0 |
| ui-kit | 89/6 | 88/6 | 49/4 | 1/0 | 33/0 | 37/2 | 8 / 0.34 | 0 |
| admin-safety | 88/1 | 88/1 | 24/1 | 2/0 | 57/0 | 49/0 | 1 / 0.04 | 0 |
| payments | 53/4 | 53/4 | 25/3 | 0 | 28/0 | 30/1 | 11 / 0.90 | 0 |
| webhooks | 45/2 | 45/2 | 12/1 | 1/0 | 21/1 | 26/0 | 4 / 0.26 | 0 |
| conferencing | 44/2 | 44/2 | 22/2 | 1/0 | 19/0 | 23/1 | 9 / 0.83 | 0 |
| embeds | 40/2 | 40/2 | 16/1 | 3/0 | 21/0 | 22/1 | 42 / 2.34 | 0 |
| notifications | 37/3 | 37/3 | 13/1 | 1/0 | 18/0 | 26/1 | 5 / 0.43 | 0 |
| data/unmapped | 66/1 | 66/1 | 15/1 | 2/0 | 32/0 | 41/0 | 3 / 0.38 | 0 |

Removed at HEAD (history-only, not ranked): removed-ee 331/3 commits, 7 reverts, 129 fix*; companion 95/0 commits, 28 fix*, 0 reverts. Remnants of removed-ee still tracked at HEAD: 2371 lines, 1 marker.

Post-conversion epoch overall (evidence): 104 counted commits, all PR-numbered; **64 have a `fix` subject** and 17 begin `cleanup`; only 3 `feat`; 1 agent-authored, 8 with agent trailers; 0 reverts. Commits per month: Apr 35 (conversion month), May 8, Jun 26, Jul 12, Aug 6, Sep 14, Oct (to 19th) 3. The 8 quiet weeks+ trickle is itself a finding; the post-epoch work is overwhelmingly maintenance fixes (booking 8, accounts 8, foundations 8, public-api 10, i18n 11 fix commits) with no new capability being built.

## Friction
- **Reverts: 23 counted revert commits in window, 0 after conversion** (all between 2025-11-04 and 2026-02-13; 21 of 23 in Jan-Feb 2026). Pre-conversion only. Traced to what each was about (the file-based attribution above overstates breadth because reverts touch many files; see Mechanical signals):
  - accounts/UI shell: 5 (sticky navbar layout shift #27256, "fixed header" #27794, availability page UI #27825, font-cal→font-heading #26064, username hyperlink sanitise #24210); plus team-creation flow redesign #26733 (reverted 01-22, re-landed 02-06 as #27698 = evidence of a revert→re-land pair).
  - public-api/platform: 3 (api v2 event-types non-org users #26896; `USE_POOL` pooling reverted 01-09, re-landed 01-10 as #26622; release v6.1.6 revert then release commit twice more on 01-27/01-28).
  - platform-infra: 5 (E2E stability #25897; Sentry `withSentryConfig` #26744; draft-release auth step #27293; release v6.1.6; USE_POOL).
  - apps-marketplace: 3 (analytics app input validation #26976 and tracking-ID nulls #27625, both 02-05; googlecalendar freebusy batching by delegation credential #24331 — perf, 12-24).
  - booking/notifications: 2 (hide Cal branding at user level #27594; download-progress toast #27151, re-landed same day as #27152).
  - removed-ee: 3 (link-cloaking restrictions #26292/#26528; handleChildrenEventType perf; top-level rate limit on public booking pages #25055 reverted 11-12).
  - Large revert/second-guess of an enterprise-wide change: `227ed64b revert (#27933)` followed by `f5a813f5 Revert "revert (#27933)"` on the same day 2026-02-13 (data-model/identity/accounts/infra; double-revert, content unknown).
- **Second attempts (repeated subjects)**: only 6 exact repeated subjects: `fix` ×6 (public-api), `chore: release v6.1.6` ×2, `USE_POOL` ×2, `fix: draft release trigger` ×2, `test: flaky e2e tests` ×2 (removed-ee), plus 11 Mintlify web-editor docs edits (bot-like, mechanical). Release/draft-release/E2E repetition is CI-style trial and error (rule 5), not a product-capability fault.
- **Fix clusters by scope** (`fix(scope)`, window): ui 12, ci 10, companion 9 (removed), api 9, auth 8, docs 5, i18n 4, bookings 3. Fix subjects are heavily UI/CI: low-confidence friction, rule 5.
- **Workflow-lockstep cases** that look like friction but are mechanical: i18n (63 fix* of 197) = translation completions.
- Google Calendar delegation-credential freebusy batching was reverted: only calendars attempt at a perf change in the window; no re-land found by subject (`unknown` whether re-attempted elsewhere).

## Planning attention
Repo keeps no `context/changes`, ADRs, RFCs or `docs/decisions` (0 matches; `docs/` has 1 tracked file). Planning artifacts at HEAD:
- `agents/` (README, knowledge-base, commands, 45 `rules/*.md`, 56 skill files for calcom-api, vercel-react-best-practices, web-design-guidelines): prescriptive engineering rules, not per-capability. Rules by theme: quality 10, data 6, architecture 5, testing 5, patterns 4, ci 3, performance 3, api 2, culture 2. 29 commits touched `agents/`/AGENTS.md/CLAUDE.md in the window (docs-planning, rule 8: discussion, not code hotness); build-up Jan-Feb 2026 (`d4ea931b` rules, `12abc316` consolidation, `10dd0e2a` sync to Devin Knowledge, `dc7b9d91` circular-dependency rule). Latest: 2026-06-21 (#29612). Themes show attention to: layering/circular deps (architecture), Prisma migrations/repository pattern (data-model), API stability (public-api), Trigger.dev (platform-infra), CI failures.
- `specs/` : 1 feature spec, `cancellation-reason-requirement` (booking; design/decisions/implementation/future-work), plus 9 template files; spec workflow added 2026-02-11 (`cfa0783e`), spec feature merged 2026-02-24 (#26872). A second spec (workflow auto-translation, #27087) was deleted in the conversion (removed-ee).
- Issue/PR templates: `.github/ISSUE_TEMPLATE` (bug, feature), PR template, CODEOWNERS, SECURITY.md.
- Per-capability plans: booking 1; every other capability 0 (`unknown` whether planning happens in forge issues/discussions).

## Debt markers
`git grep -cE 'TODO|FIXME|HACK|XXX' HEAD` over non-noise tracked files (locale JSON excluded), normalised per 1000 lines of the same files. Counts are matches-per-file summed (a line may carry several), content not read.
- Highest density: **embeds 2.34/1k (42 markers, embed.ts 10, embed-iframe.ts 6)**, data-model 1.21 (schema.prisma 6, zod-utils.ts 5), apps-marketplace 1.20 (54; locations.ts 7, app-store-cli build.ts 4), availability 0.88, booking 0.76 (74 markers, largest absolute count; RegularBookingService.ts 5), accounts 0.74, calendars 0.68 (CalendarManager.ts 5), foundations 0.65, platform-infra 0.57.
- Low: public-api 0.09 (111k lines dominated by generated-looking spec/schemas; mechanical dilution), docs-planning 0.03, admin-safety 0.04, i18n 0.
- Caveat (evidence): `XXX` and `TODO` in test fixtures, URLs or placeholder strings count; marker presence is not debt without reading. Zoom adapter (4) and `schema.prisma` hold the densest single-file clusters.

## Mechanical signals
- **Agent-trailer share ≈ 35% of counted commits (contract: ≈662 of 1870; per capability up to ~48%, e.g. platform-infra 227/477, booking 171/361)**: human commits co-authored with Devin/Claude; says how code is written, not friction or risk (rule 7). Never read as "AI-written = fragile".
- **Revert spillover (rule 12)**: `51b3f5c7` (revert of mass commit b3430c8e, 108 files) touches 12 capabilities, `a4d46263` (font rename revert) 13, `31c6bbb5`/`4228f576` 5-6: per-capability revert counts above for foundations, booking, embeds, event-types, identity, availability, webhooks, ui-kit, conferencing are mostly spillover. Real revert subjects trace to accounts-shell, public-api/release tooling, platform-infra, apps-marketplace as listed.
- **Revert→re-land inside hours/days** (`USE_POOL`, download toast, release v6.1.6, 3 UI reverts on 02-10) = deploy/UI trial and error (rule 5).
- **CI/release repetition** (fix(ci) 10, draft-release, flaky e2e) = iteration, not capability fault.
- **Wide commits** (>3 capabilities): 114/477 of platform-infra, 142/361 of booking, 141/270 of foundations — structural moves (trpc→modules, repositories→features, i18n package) spread the same commit across capabilities; shared cause counted once (rule 4).
- i18n 63 fix* and 11 post-conversion fix commits = translation catalog completions (rule 3/7).
- Docs: 11 identical "documentation edits made through mintlify web editor" subjects; prose churn only (rule 8).
- Conversion commit `ab21c7f8` (mass) and companion removal are excluded/history-only; not friction.
- Post-conversion 64% fix subjects partly reflects clean-up after removing enterprise code (shared cause with the conversion).

## Unknowns
- No forge: human review, closed-unmerged PRs, PR size/duration, issues and open bugs per capability, discussion threads: all `unknown`. A forge pass (`gh pr list --json reviews,comments`, `gh issue list`) would add them; it would also catch abandoned PRs that never reached git.
- Production error tracker: repo mentions Sentry (a `withSentryConfig` revert, #26744), so one is in use; production errors invisible (out of scope).
- Whether the empty post-conversion `feat` stream means upstream development moved (Cal.com continues separately) vs. the fork being in maintenance mode: not determinable from git (`inference`: maintenance mode).
- Double-revert `227ed64b`/`f5a813f5` content not read (only subjects/paths).
- Revert pairs 02-10 (fixed header, availability UI): original and revert on the same day, order ambiguous from subject alone.
- Debt marker content not inspected; TODO density is not a defect count.
- Issue tracker may live outside GitHub issues (not detectable from repo).

## Commands run
- `eval` Python over `scan.load()` (subject regex for PR, fix, revert, hotfix; repeated-subject grouping; fix(scope) clusters; post-epoch counts by month/prefix)
- `git -c core.quotepath=off grep -cE 'TODO|FIXME|HACK|XXX' HEAD -- .` and `git grep -c '' HEAD -- .` (per file, folded to capabilities with `scan.attribute`, noise/locales dropped)
- `git -c core.quotepath=off ls-files | grep -E '^(context|specs|docs|agents|.github/...)'`; `git log --since=2025-10-26 -- agents AGENTS.md CLAUDE.md` and `-- specs`
