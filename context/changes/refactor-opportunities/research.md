---
date: 2026-10-27T21:49:49+01:00
researcher: Claude Code (omp agent; identity of the human operator unknown)
git_commit: 23e4257c0aa259b8a9cfea2cadaf556e200459ba
branch: chore/skill-repo-map
repository: Numzon/cal.diy
topic: "Refactor opportunities z długu opisanego w booking-analysis: kandydaci, kształt, intencjonalność, wykonalność, ranking"
tags: [research, refactor, booking, RegularBookingService, handleNewBooking, DI, api-v2, webhooks, ci, verified]
status: complete
last_updated: 2026-10-27
last_updated_by: Claude Code (omp agent), weryfikacja twierdzeń strukturalnych (ast-grep 0.51.0)
verification_commit: 23e4257c0aa259b8a9cfea2cadaf556e200459ba
---

# Research: Refactor opportunities z długu opisanego w booking-analysis

**Data**: 2026-10-27T21:49:49+01:00
**Researcher**: Claude Code (omp agent)
**Git Commit**: `23e4257c0a`. Jedyny commit od bazy raportu `14d53ac7c7` (commit „reserach”) zmienia wyłącznie pliki `context/`, `.claude/` i `CLAUDE.md`, więc anchory kodu z `booking-analysis` są ważne przy HEAD. Drzewo robocze: nieśledzony jest tylko `context/changes/refactor-opportunities/`.
**Branch**: `chore/skill-repo-map`
**Repository**: `https://github.com/Numzon/cal.diy`

## Research Question

Wejściem jest analiza `context/changes/booking-analysis/research.md`, traktowana jako zebrane dowody; priory to `context/map/repo-map.md` i `context/map/evidence/{1-history,2-discussion}.md`. Zadania:

1. Wypisać każdy problem, który raport odnotowuje, i sklasyfikować go jako **KANDYDATA** (naprawa zmienia strukturę kodu) albo **nie-kandydata** (wejście do oceny wykonalności i kosztu).
2. Każdego kandydata zbadać w trzech wymiarach: obecny kształt, historia i intencjonalność, wykonalność migracji.
3. Zamknąć rankingiem 2–3 najmocniejszych refactor opportunities oraz listą kandydatów odrzuconych.

Ograniczenia: bez zmian w kodzie, bez projektowania architektury docelowej poza nazwaniem kształtu, a jeśli naprawa oznacza przeprojektowanie pojęć biznesowych, stop.

**Oznaczenia:** **[E]** evidence (anchor `plik:linia` albo hash commita); **[I]** inference (podstawa podana); **[U]** unknown. Skróty: `RBS` = `packages/features/bookings/lib/service/RegularBookingService.ts`, `HNB/` = `packages/features/bookings/lib/handleNewBooking/`, `V2` = `apps/api/v2/src/`.

## 1. Inwentarz problemów z raportu i klasyfikacja

Źródło każdego wiersza to sekcja raportu `booking-analysis/research.md`; numery „dług #n” odnoszą się do jego tabeli „Technical debt” (`:378-392`).

| # | Problem (jak odnotowany w raporcie) | Źródło w raporcie | Klasyfikacja | Uzasadnienie |
|---|---|---|---|---|
| P1 | Monolityczny `handler` (2 093 linie, `RBS:486-2578`); klasa to fasada z `handler.bind(this)` | dług #1; Summary `:31` | **KANDYDAT C1** | naprawa = podział funkcji, zmiana struktury |
| P2 | Niepełne DI: globalny `prisma` w 10 plikach `HNB/`, `new UsersRepository()` (`RBS:1736`), `new BookingRepository(prisma)` | dług #2 | **KANDYDAT C2** | naprawa = zmiana sposobu wstrzykiwania |
| P3 | Dostęp do danych poza repozytoriami nie jest egzekwowany | Architecture Insights `:473` | → C2 | ten sam mechanizm co P2 |
| P4 | Brak atomowości: tx `booking.create` → EventManager → osobny `booking.update` z logowaniem błędu | dług #3; Summary `:32` | **KANDYDAT C3** | naprawa zmienia granice transakcji i sekwencję zapisów |
| P5 | Martwy kod: `createBookingForApiV1`, `rescheduleBooking`, flaga taskera, `hashedLinkService` | dług #4 | **KANDYDAT C4** | naprawa zmienia API klasy i kontrakt DI |
| P6 | Nieosiągalny guard `event_type_not_found` (`RBS:542` przed `:640`) | dług #5 | nie-kandydat (N1) | lokalna poprawka kolejności w 2 liniach, bez zmiany struktury |
| P7 | Dwa rozbieżne `EventPayloadType` (szew 4: payload webhooków) | dług #6; szew `:296` | **KANDYDAT C5** | naprawa = scalenie typów |
| P8 | Kontrakt odpowiedzi tylko inferowany; 04-15 przepuszcza go bez mapowania (szew 3) | dług #7; szew `:295` | **KANDYDAT C6** | naprawa = jawny typ/DTO |
| P9 | API v2 08-13 ponownie czyta rekord po utworzeniu | Bliźniaki `:186` | → C6 | ten sam szew odpowiedzi |
| P10 | Ręcznie zduplikowane wiązanie DI web ↔ API v2 (9 zależności, token stringowy; szew 1) | dług #8; szew `:293` | **KANDYDAT C7** | naprawa zmienia kompozycję DI |
| P11 | Brak strażnika driftu `openapi.json`; `.dependency-cruiser.cjs` niewpięty | dług #9 | nie-kandydat (N2) | narzędzia i CI, nie struktura kodu |
| P12 | Luki w testach (403 reschedule-notice, MEETING_*, analytics, `noEmail`, `multipleDuration`, `teamMemberEmail`/`skipContactOwner`, trasa `event.ts`, `createBooking.ts`) | dług #10; „Luki w testach” | nie-kandydat (N3) | brak testu |
| P13 | Bramkowanie CI: integration/e2e tylko z etykietą `ready-for-e2e`; `e2e-atoms.yml` nie wołany | `:262-267` | nie-kandydat (N4) | konfiguracja CI |
| P14 | Pominięte/podejrzane testy (skip/todo/xit/fixme, duplikat nazwy, „fails on CI”, przycięty `spam-booking.integration-test.ts`) | `:251-260` | nie-kandydat (N5) | higiena testów |
| P15 | Markery TODO na ścieżce (11 w 6 plikach) | dług #11 | nie-kandydat (N6) | wskaźniki; treść przypisana do C1/C2/C8 |
| P16 | Resztki EE: gałęzie team/RR/org w handlerze i testach | dług #12 | **KANDYDAT C8** (warunkowo) | naprawa = usunięcie gałęzi; możliwa decyzja produktowa (patrz C8) |
| P17 | Podwójny lookup przy reschedule (`getSeatedBooking` + `getOriginalRescheduledBooking` ×2) | dług #13 | **KANDYDAT C9** | naprawa = przekazanie wyniku zamiast powtórzenia |
| P18 | Szew wejścia: 4 schematy zod + DTO v2 + mappery bez strażnika (szew 2) | szew `:294`; must-change #3 | **KANDYDAT C10** | naprawa = jedno źródło kontraktu wejścia |
| P19 | Atoms domyślnie trafiają do niedokumentowanego kontrolera 04-15 | Summary `:33`; `:190` | nie-kandydat (N7) | polityka wersjonowania publicznego API; zewnętrzni konsumenci [U] |
| P20 | Unknowns: `platform-libraries` source vs `dist` w runtime; klasy DI w runtime; pokrycie %; zewnętrzni konsumenci | Open Questions `:495-502` | nie-kandydat (N8) | brak danych; częściowo rozstrzygnięte niżej |
| P21 | Mocki płatności/kalendarzy/wideo/CRM, więc brak weryfikacji realnych providerów | `:201` | nie-kandydat (→ N3) | ograniczenie testów |
| P22 | `CalendarSyncService` używa kontenera przez dynamiczny `import()`, niewidoczny dla grafu | `:275-278` | nie-kandydat | fakt blast radius |
| P23 | Hotspot `RBS` (46 commitów/12 mies.), co-change z 9+ plikami | `:326-350` | nie-kandydat | metryka i symptom C1 |

**Kandydaci: C1–C10.** Nie-kandydaci N1–N8 oraz P21–P23 służą niżej jako wejście do oceny kosztu i osłon.

## Summary

- **Ranking (sekcja 4).**
  1. **C2:** dokończenie DI na ścieżce tworzenia.
  2. **C1:** rozbicie `handler` na fazy za niezmienioną sygnaturą (C9 wchodzi jako pierwszy wycinek).
  3. **C4 (a–d):** usunięcie martwego API i martwych zależności DI.

  Odrzuceni: C3 i C8 (naprawa jest decyzją domenową lub produktową), C6 (zamrożenie 04-15 jest celowe; jawny typ zostaje jako tani krok po wpięciu osłony CI), C5, C7, C9, C10 (mała wartość strukturalna albo wchłonięci przez innych kandydatów).
- **Intencjonalność** (wymiar 2, sekcja 3).
  - Celowe ograniczenia: kolejność „rezerwacja w DB → efekty zewnętrzne” w C3, zamrożenie wersji 04-15 w C6 i dwa korzenie kompozycji DI w C7.
  - Migracje etapowe, które się zatrzymały: C1, C2, C8, C10.
  - Przypadkowa złożoność: C4, C9, a w C5 stan po forku.
  - Brak ADR-ów dla ścieżki tworzenia [E] (`2-discussion.md:54`; potwierdzone ponownie przez agenta HistoryIntent). `agents/rules/*` powstały 2026-01-16 (`d4ea931bf8`, `f691258a5c`), już po większości tego kodu, i opisują stan docelowy, a nie powody obecnego kształtu.
- **Nowe ustalenia, które zmieniają ocenę ryzyka.** Wszystkie są [E], chyba że oznaczono inaczej.
  1. W API v2 `deps.prismaClient` to osobny `PrismaClient` **bez** `$extends` (`V2/modules/prisma/prisma-write.service.ts:61,64`; `V2/lib/services/regular-booking.service.ts:32`). Globalny `prisma` ma 4 rozszerzenia (`packages/prisma/index.ts:79-83`), w tym klucz idempotencji `booking.create` (`packages/prisma/extensions/booking-idempotency-key.ts:23-35`) i filtr zablokowanych użytkowników (`exclude-locked-users.ts:6-21`). Przeniesienie zapytań `HNB/` na `deps.prismaClient` zmieniłoby więc zachowanie tylko w v2.
  2. Job `type-check` nie obejmuje `apps/api/v2`, bo v2 nie ma skryptu `type-check:ci` (raport MigrationFeasibility: `check-types.yml:71`, `apps/api/v2/package.json`). Kontrakt v2 ↔ rdzeń sprawdza w PR wyłącznie `build-api-v2`, bramkowany etykietą.
  3. Job `required` failuje, gdy pominięto `build`, `integration-test`, `e2e`, `e2e-api-v2` i inne (`.github/workflows/pr.yml:452-473`). Bez etykiety PR z kodem nie przejdzie `required`; czy `required` jest checkiem w branch protection, to [U].
  4. Runtime API v2 używa zbudowanego `dist` `platform-libraries` [I mocne: `start:prod` bez `tsconfig-paths`, `apps/api/v2/package.json:24`]. To rozstrzyga N8 / Open Question 2 raportu.
  5. Strażnik zmian łamiących OpenAPI istniał (`check-api-v2-breaking-changes.yml`, oasdiff) i został **usunięty w forku** `ab21c7f805`.
  6. Fork `ab21c7f805` cofnął część zabezpieczenia kontraktu webhooków z `3a7122d613` (szczegóły w C5).

## 2. Kontekst przekrojowy: osłony CI (wejście do wykonalności każdego kandydata)

Źródło: raport agenta MigrationFeasibility. Bramka `pr.yml:452-473` sprawdzona w tej syntezie.

| Job → workflow | Bramka | Co z bookingu sprawdza |
|---|---|---|
| `type-check` → `check-types.yml` | zmieniony plik nie-docs (`pr.yml:299`) | `tsc` w pakietach z `type-check:ci` (m.in. `apps/web`, który importuje `RBS`, `HNB/`, webhooki). **Nie obejmuje `apps/api/v2` ani `packages/platform/libraries`** |
| `lint` → `lint.yml` | jw. | Biome, w tym whitelist importów API v2 (`biome.json:417-445`) |
| `unit-test` → `unit-tests.yml` | jw. (`pr.yml:313`) | vitest + prismock: wszystkie `HNB/test/*.test.ts`, `HNB/global-booking-limits.test.ts`, `handleSeats/test`, `EventManager.test.ts`, testy webhooków, `CalendarSyncService*.test.ts` |
| `api-v2-unit-test` | jw. (`pr.yml:320`) | jest `*.spec.ts`: 17 specs, **żaden dla bookingów** |
| `build-api-v2` (`nest build`) | etykieta `ready-for-e2e` | jedyny w PR type-check v2 względem `platform-libraries` [I] |
| `integration-test` | etykieta (`pr.yml:371`) | `*.integration-test.ts` na Postgresie (m.in. `spam-booking`, `createNewSeat`, `scheduleNoShowTriggers`, `BookingReferenceRepository`) |
| `e2e` (Playwright) | etykieta (`pr.yml:378`) | `booking-pages`, `booking-seats`, `reschedule`, `payment`, `webhook` (`toMatchObject` payloadu BOOKING_CREATED, `webhook.e2e.ts:66-122`) i inne |
| `e2e-api-v2` | etykieta (`pr.yml:385`) | 04-15 `bookings.controller.e2e-spec.ts` + 17 specs 08-13; w CI `diagnostics: false` (`jest-e2e.ts:32-36`), więc bez type-checku |
| `e2e-atoms` | **nigdy nie wołany** | `booker-atom.e2e.ts` nie działa w CI |

- **Harness unit** [E]. `@calcom/prisma` jest mockowany jednym proxy prismock dla `default`, `prisma` i `readonlyPrisma` (`packages/testing/src/lib/__mocks__/prisma.ts:98-101`). Moduł DI wiąże ten sam obiekt (`packages/features/di/modules/Prisma.ts:3,9`), więc w testach `deps.prismaClient` i globalny `prisma` to jeden obiekt.
- **Ograniczenie harnessu.** Prismock nie stosuje `$extends`, więc testy unit nie wykryją utraty rozszerzeń [E wg MigrationFeasibility].

## 3. Kandydaci

### C1. Monolityczny `handler`

**Obecny kształt.**
- [E] `handler` (`RBS:486-2578`) to sekwencja około 20 faz. Mapa faz agenta CurrentShape: load/validate `:523-572`, guardy `:574-633`, short-circuit istniejącej rezerwacji `:677-726`, dostępność i lucky user `:824-1151`, budowa `evt` `:1283-1450`, decoy `:1494-1582`, seats `:1584-1659`, zapis `:1661-1828`, EventManager `:1830-2181`, płatność `:2255-2360`, webhooki `:2362-2440`, references `:2442-2463`, efekty końcowe `:2465-2549`, return `:2551-2577`.
- [E] Inline zostały dwa duże bloki: dostępność (około 325 linii) i EventManager (około 350 linii, gałęzie reschedule `:1841-2047` / create `:2050-2170`). Obsługa Google Meet jest prawie zduplikowana (`:1951-2005` vs `:2078-2128`).
- [E] Stan mutowalny: 16 `let` poza pętlami, z czego 15 (raport: około 13) jest przepisywanych w handlerze (jedyny wyjątek to `assignmentReason`, zob. C4). `evt` jest przepisywany w `:1657, 1749, 1753, 1759, 1843`, `booking` jest mutowany w `:2054, 2290` i w `HNB/handleAppsStatus.ts:37`. Wejście `reqBody` też jest mutowane (`:1340-1344`).
- [E] Handler ma 5 miejsc `return` o różnych kształtach (szczegóły w C6).
- [E] Wzorzec domowy „funkcja modułowa + cienka klasa” powtarza się w `RecurringBookingService.ts:11/141` i `handleCancelBooking.ts:81/539`. Istniejące abstrakcje do ponownego użycia: `CalendarEventBuilder`, `BookingEventHandlerService` (`allSettled`, `onBookingEvents/BookingEventHandlerService.ts:44-56`), helpery `HNB/*`. Abstrakcji pipeline/step nie ma; grep w `packages/features`, `packages/lib` i `V2` znalazł tylko middleware Nest.

**Intencjonalność: migracja etapowa, zatrzymana.**
- [E] Ekstrakcje helperów z lat 2023–2024 (`8b24995d52` #11959, `24607873c0`, seria Udita Takkara `86fc5161b6`, `a52f7efe88`, `5f8d090d3c`, `b4f1b5aebe`) nie podają celu poza samą ekstrakcją.
- [E] Stack Hariom Balhara „Booking flow refactor”:
  - część 0, `9ceb5ea3c5` (2025-09-02, #23277): „Prepare for moving handleNewBooking to be part of BookingCreateService. No integration is done”;
  - część 2, `3bcce02b92` (#23156): `deps` w `handler`;
  - część 3, `870ad57a7e` (#23682): rename, „pure refactoring”;
  - część 5, `82951cd04e` (#24025): `BookingEventHandlerService`, „first step in improving the post booking architecture”.
- [E] Część 4 nie została zmergowana; los zamkniętych PR #23283 i #23296 to [U].
- [E] `handler.bind(this)` wprowadził `75d611c2e8` (2026-01-13, #26046, booking audit). Uzasadnienie to [U] (timeout pobrania PR). [I] Wygląda na minimalny diff, który daje handlerowi dostęp do `this.fireBookingEvents`.
- [E] Od forka (2026-04-15) jedynym commitem dotykającym `RBS` jest sam `ab21c7f805`.
- Docelowy kształt jest czysto strukturalny i nie wymaga przeprojektowania pojęć domenowych.

**Wykonalność.**
- **Kształt docelowy.** Handler zostaje cienkim orkiestratorem nazwanych faz (load/validate → assignment/availability → persist → side-effects). Wykorzystuje istniejącą konwencję „jeden helper na krok” w `HNB/` oraz `fireBookingEvents`, bez nowej abstrakcji [I].
- **Blast radius.**
  - Wewnętrzny: moduł DI web, `platform/libraries/bookings.ts:10` → podklasa v2, eksporty `buildDryRunBooking` (`RBS:148`) i `computeTeamData` (`RBS:269`) używane przez 2 testy.
  - Zewnętrzny, tylko behawioralny: HTTP API v2 (04-15, 08-13), Atoms (npm `@calcom/atoms` 2.3.3), strona bookingu.
- **Osłony.** 14 plików unit przez `getNewBookingHandler` działa w każdym PR z kodem. Integration, Playwright i e2e v2 tylko z etykietą. Luki N3 obejmują prolog (`:486-700`).
- **Odwracalność.** Extract-and-delegate za niezmienioną sygnaturą `createBooking`; każdy krok da się cofnąć osobno, bez kroku jednokierunkowego [I].
- **Rozmiar.** Pierwszy wycinek M (około 300–350 zmienionych linii, 2–3 pliki). Cała ścieżka L: około 4 000+ zmienionych linii w około 9–10 PR, każdy w limitach AGENTS.md [I, szacunek agenta].

### C2. Niepełne DI / globalny `prisma` na ścieżce tworzenia

**Obecny kształt.** [E] Zapytania w 10 plikach `HNB/` i istniejące odpowiedniki do wstrzyknięcia:

| Plik | Zapytanie | Istniejący odpowiednik |
|---|---|---|
| `createBooking.ts:130,139-147` | `credential.findFirstOrThrow`; `$transaction{booking.update(oryginał); booking.create}` | brak metody create-with-cancel. Precedens tx w repo: `BookingRepository.managedEventReassignmentTransaction` (`:2008`) |
| `originalRescheduledBookingUtils.ts:8-10` | `new BookingRepository(prisma).findOriginalRescheduledBooking` | **jest**: `BookingRepository.findOriginalRescheduledBooking` (`:1170`) przez wstrzyknięty `deps.bookingRepository` |
| `ensureAvailableUsers.ts:134-162` | `schedule.findUnique` | **jest**, ten sam select: `ScheduleRepository.findScheduleByIdForBuildDateRanges` (`:22-55`) |
| `checkActiveBookingsLimitForBooker.ts:45,79` | `booking.count` / `findMany` | brak (`countBookingsByEventTypeAndDateRange` nie filtruje po attendee) |
| `checkIfBookerEmailIsBlocked.ts:28` | `user.findFirst` | prawie: `UserRepository.findManyByEmailsWithEmailVerificationSettings` (`:280`) gubi `id` |
| `findBookingQuery.ts:6` | `booking.findUnique` | brak dokładnego |
| `getEventTypesFromDB.ts:204` | `eventType.findUniqueOrThrow` (duży select) | brak |
| `getSeatedBooking.ts:7` | `bookingSeat.findUnique` | częściowo: `BookingSeatRepository` (węższy select) |
| `loadAndValidateUsers.ts:112` | `user.findUnique` + credentials | `UserRepository.findById` (`:374`), inny select |
| `loadUsers.ts:128-133` | `user.findMany` z credentials | `UserRepository.findUsersByUsername` (`:169`) |

- [E] Poza tabelą: `new UsersRepository()` (`RBS:1736`; `users/users.repository.ts:1,8` używa globalnego `db`), a wstrzyknięty `UserRepository` nie ma `updateLastActiveAt`. `ProfileRepository` jest importowany w `RBS:42`, ale nieużywany; `RBS:1312` pyta o profil bezpośrednio.
- [E] Tożsamość klienta. W web `deps.prismaClient` to ten sam globalny obiekt (`di/modules/Prisma.ts:3,9`). W v2 to osobny klient bez rozszerzeń (anchory w Summary, sprawdzone w tej syntezie).
- [I] W v2 zapis główny (globalny klient w `HNB/createBooking.ts`) działa dziś z rozszerzeniami, a zapisy przez `deps.prismaClient` (`RBS:1777, 2141, 2446`) bez nich. Proces v2 trzyma dwa klienty.

**Intencjonalność: migracja etapowa, jawnie zadeklarowana i niedokończona.**
- [E] TODO w `RegularBookingService.module.ts:23` („In a followup PR, we aim to remove prisma dependency and instead inject the repositories as dependencies”) pochodzi z `870ad57a7e` (2025-10-21).
- [E] Ten sam follow-up wykonano tylko dla anulowania: `a7a8c78494` (2026-01-14, „[Booking Cancellation Refactor - 2] Inject repositories…”, #24159). Dla tworzenia go nie wykonano.
- [E] `// TODO: Inject.` w `originalRescheduledBookingUtils.ts:7` pochodzi z `c28eb90928`. `new BookingRepository(prisma)` dodał `c316721051` (#22389) jako jawny krok pośredni („two-step instantiation pattern”).
- [E] Globalne importy weszły razem z ekstrakcjami z 2024 r. i z późniejszymi feature'ami, nigdy w ramach prac nad DI.
- [E] Obecny stan łamie reguły repo `agents/rules/patterns-dependency-injection.md:200-254` i `data-dto-boundaries.md:89-92` (cytowane przez HistoryIntent).

**Wykonalność.**
- **Kształt docelowy.** Helpery dostają wstrzyknięte repozytoria lub klienta z `deps`, tak jak w przepływie anulowania po `a7a8c78494`. To istniejąca abstrakcja.
- **Blast radius: wyłącznie wewnętrzny.**
  - 10 plików helperów i 11 wywołań `prisma.`.
  - Importerzy wartości: `findBookingQuery` ← 4 pliki `handleSeats`; `getOriginalRescheduledBooking` ← `tasker/BookingEmailAndSmsTaskService.ts:4`; `loadUsers` ← `loadAndValidateUsers`; `getEventTypesFromDB` ← `getEventType`.
  - Kontrakt publiczny nie zmienia się.
- **Ukryte ryzyko behawioralne, tylko v2.** Na podstawie rozszerzeń (`packages/prisma/extensions/*`):
  - zapytania `user.find*` przeniesione na klienta v2 stracą filtr `locked: false`;
  - `booking.create` straci `idempotencyKey`, czyli unikalny klucz chroniący przed duplikatami (`schema.prisma:854-855`; mapowanie P2002 → 409 w `RBS:1821-1824`).
  - Zapytania o `booking`, `bookingSeat`, `schedule` i `eventType` na najwyższym poziomie nie podlegają żadnemu z rozszerzeń `find*`, więc są neutralne [I: rozszerzenia definiują tylko `user.find*`, `team.find*`, `booking.create` i `$allModels` deleteMany/updateMany].
- **Osłony.** Testy unit pokrywają przeniesienie, bo prismock to ta sama instancja [E]. Ryzyka v2 nie wykryje ani prismock, ani żaden test; brak asercji na `idempotencyKey` w ścieżce create [E]. Regresję v2 złapałyby tylko e2e v2 (etykieta) albo nowy integration test.
- **Odwracalność.** Każdy helper osobno.
- **Rozmiar.** Pierwszy krok S; całość M, około 5 PR [I].

### C3. Brak atomowości zapisu wokół wywołań zewnętrznych

**Obecny kształt.** [E] Kolejność:
1. Tx (anulowanie oryginału + `booking.create`; `HNB/createBooking.ts:139-147`, `:254-263`).
2. `updateLastActiveAt` (`RBS:1737`) i `bookingSeat.create` (`:1777`) poza tx.
3. EventManager reschedule (`:1909`) lub create (`:2052`), potem osobny update `iCalUID` (`:2141`).
4. E-maile.
5. `fireBookingEvents` (`:2217`).
6. Płatność (`:2291`).
7. Webhook BOOKING_CREATED/RESCHEDULED (`:2433`), **przed** zapisem references.
8. `booking.update{location, metadata, references.createMany}` (`:2446`); catch tylko loguje.
9. Kolejka BOOKING_REQUESTED, celowo po kroku 8 (komentarz `:2465`).

- [E] Porażki EventManagera (`success:false`) są tylko logowane (`:1937`, `:2064`). `referencesToCreate` mapuje także porażki, z `uid: ""` (`EventManager.ts:388-410`).
- [E] Mechanizmów kompensacji nie ma w zbadanym zakresie. `handleAppsStatus` tylko raportuje; lista zadań taskera nie ma naprawy referencji (`tasker/tasks/index.ts:9-25`).

**Intencjonalność: celowe, nośne ograniczenie.**
- [E] `6ab741b927` (2021-09-14, #613) odwrócił kolejność na „najpierw `booking.create`, potem kalendarze, potem `references`”. Te linie są nadal blamowane do tego commita (`RBS:2453-2459`).
- [E] `d85e0b51e4` (2024-02-26, #13865) dodał unikalny `idempotencyKey`. [I] Insert w DB działa jako rezerwacja/lock przed efektami zewnętrznymi; odwrócenie kolejności tworzyłoby zdarzenia zewnętrzne dla duplikatów.
- [E] `1c59c0dd06` (#5182, „try catch all the promises after reservation…”) jest źródłem catch, który tylko loguje. Checklist recenzenta w #24025 potwierdza politykę best-effort po rezerwacji.
- [E] Żaden commit nie omawia osieroconych `BookingReference`.

**Wykonalność.** Prawdziwa naprawa (outbox, kompensacja, retry albo akceptacja bookingu bez zdarzenia) zmienia semantykę niezawodności rezerwacji. **To decyzja domenowa lub produktowa, nie strukturalna; tu się zatrzymuję.**
- [E] Testy same nazywają obecne zachowanie błędnym: `fresh-booking.test.ts:589`, FIXME `:2761`, `reschedule.test.ts:493`.
- [E] Żaden test nie wymusza porażki `booking.update` references.
- Strukturalnie zostaje tylko ekstrakcja zapisu `:2444-2463` do metody repozytorium (`BookingRepository.updateIncludeReferences` `:1582`, `BookingReferenceRepository`): rozmiar S, mała wartość.

### C4. Martwy kod w API serwisu i kontrakcie DI

**Obecny kształt.** [E] `git grep` po `apps` i `packages`:
- `createBookingForApiV1` (`RBS:2676`): 0 wywołań, ma `@deprecated` (`:2673-2675`). Jest jedyną drogą do `getBookingDataSchemaForApi`, a przez nią do `bookingCreateBodySchemaForApi` (poza tym tylko import typu `dto/types.d.ts:6,13`).
- `RegularBookingService.rescheduleBooking` (`:2663`): 0 wywołań. Reschedule v2 (`bookings.service.ts:766`) i `CalendarSyncService.ts:212` idą przez `createBooking`. `RecurringBookingService.rescheduleBooking` (`:160-174`) też ma 0 wywołań.
- `IBookingService` (`interfaces/IBookingService.ts:4-9`, członkowie typu `any`): implementowany przez 2 klasy, nikt nie typuje względem niego. `IBookingCreateService` ma 0 użyć.
- `deps.hashedLinkService`: 0 odczytów; jest tylko deklarowany (`RBS:429`) i wiązany (web module `:29`, v2 `:23,34`).
- `isBookingEmailSmsTaskerEnabled = false` (`:2215`) → `deps.bookingEmailAndSmsTasker.send` (`:2532`) jest nieosiągalne. W v2 ciągnie 5 providerów (`regular-booking.module.ts:49-53`); łańcuch zależności to około 14 plików.
- Nowe martwe elementy: `let assignmentReason` (`:1703`) nigdy nie jest przypisywany (sprawdzone grepem w tej syntezie), więc `:1758-1765` i `:2252` są martwe. Nieczytane są też `isNormalBookingOrFirstRecurringSlot` (`:655`), `_crmRecordId` (`:789`), `firstUser` (`:808`) i `CreateBookingMeta.noEmail` (`dto/types.d.ts:39`).

**Intencjonalność: przypadkowe pozostałości.**
- [E] `createBookingForApiV1` (`3bcce02b92`) ma zapisany warunek usunięcia „Exists only till API v1 is removed”. Warunek spełnił się w `ab21c7f805` (usunięto 169 plików `apps/api/v1`) i nikt nie wrócił do tej metody.
- [E] `rescheduleBooking` i `IBookingService` to spekulatywne API ze szkieletu `9ceb5ea3c5`.
- [E] Flaga taskera zastąpiła w `ab21c7f805` zapytanie o feature flag organizacji. Blok ma komentarz „Unused until we deploy to trigger.dev production” (`RBS:2527-2529`).
- [E] `hashedLinkService` osierocił `cbc8d3d7a8` (#25123), zastępując lokalnie budowany `BookingEventHandlerService` przez `deps.bookingEventHandler`.

**Wykonalność.**
- **Kształt docelowy:** usunięcie, bez nowych abstrakcji. Kroki:
  - (a) ApiV1 + schematy `ForApi`;
  - (b) `rescheduleBooking` + `IBookingService`;
  - (c) `hashedLinkService`;
  - (d) martwe zmienne lokalne i `assignmentReason`;
  - (e) gałąź taskera.
- **(e) to decyzja roadmapowa** (trigger.dev), nie strukturalna; wyłączona.
- **Blast radius.**
  - Wewnętrzny: `RBS`, `IBookingService.ts`, `RecurringBookingService.ts`, moduł DI web, serwis/moduł v2, `dto/types.d.ts`, `bookingCreateBodySchema.ts`, `getBookingDataSchemaForApi.ts`.
  - Zewnętrzny: `RegularBookingService` jest eksportowany przez `@calcom/platform-libraries`. Pakiet ma ręczny skrypt `publish-npm` (`packages/platform/libraries/package.json:17`), wersję `0.0.0` i jest ignorowany przez changesets (`.changeset/config.json:10`) [E]. Czy istnieją zewnętrzni konsumenci, to [U].
- **Osłony.**
  - [E] Web: `bindModuleToClassOnToken` wymaga zgodności kluczy `depsMap` z deps konstruktora (`di/di.ts:24-28`), więc `tsc` web łapie niezgodność, a unit ładuje prawdziwy kontener.
  - [E] v2: rozjazd łapie tylko `build-api-v2` (etykieta).
- **Odwracalność.** (a)–(d) da się cofnąć każdy osobno.
- **Rozmiar.** Każdy z kroków (a)–(d) to S.

### C5. Dwa rozbieżne `EventPayloadType`

**Obecny kształt.** [E] Dwie definicje:
- `sendPayload.ts:81-104`: `Omit<CalendarEvent,"assignmentReason">` plus unia `string | {reasonEnum,reasonString}[] | {category,details?} | null`, sprawdzone w tej syntezie;
- `webhooks/lib/dto/types.ts:533-550`: pełny `CalendarEvent`.

Różnice: `assignmentReason`, `uid` i `paymentData`; pozostałe 13 pól jest identycznych. Typy pomocnicze są skopiowane 1:1.

- [E] Importerzy wariantu `sendPayload`: 9 (raport: 10) plików produkcyjnych, m.in. `RBS:54`, `handleSeats.ts:3`, `handleConfirmation.ts:8`, `confirm.handler.ts:18`, `handlePaymentSuccess.ts:14`. Importerzy wariantu `dto`: 3 (raport: 2) (`factory/types.ts:1-5`, `factory/versioned/v2021-10-20/types.ts:1` i test).
- [E] `RBS` zasila dwa potoki webhooków:
  - legacy: `handleWebhookTrigger` → `sendOrSchedulePayload`;
  - fabryka: `deps.webhookProducer` → `BookingPayloadBuilder`, który zdejmuje `assignmentReason` z `evt` (`BookingPayloadBuilder.ts:199-201`).

**Intencjonalność: celowy shim, potem przypadkowo częściowo cofnięty.**
- [E] `3a7122d613` (2026-02-17, #27891) to forward-fix, nie `git revert`. Uzasadnienie: `{category, details}` z #27192 to „a breaking change for webhook consumers”. Fix zawęził unię, zdejmował pole w 9 miejscach i dodał zod `sanitizeAssignmentReasonForWebhook`.
- [E] `ab21c7f805` z powrotem dodał `{category, details}` do `sendPayload.ts:99-103`, usunął sanitizer i usunął zdejmowanie w `RBS`. Body PR #28903 jest puste, więc powód to [U].
- [I] Ryzyko runtime jest uśpione. W zbadanym zakresie nie znaleziono wywołania `AssignmentReasonRepository.create`, które tworzyłoby wiersze `AssignmentReason` (grep `packages`, `apps`; sam moduł DI istnieje w `di/modules/AssignmentReason.ts`). Ścieżka legacy wysłałaby `{category, details}` tylko dla wierszy już istniejących w bazie: `confirm.handler.ts:284-289` buduje `evt.assignmentReason` w nowym kształcie i przekazuje `evt` do `handleConfirmation` (`:364`). Czy `handleConfirmation` przekazuje to pole do payloadu, nie sprawdzono [U].

**Wykonalność.**
- Kształt docelowy: jeden typ przewodowy w `webhooks/lib/dto/types.ts`; `sendPayload.ts` go re-eksportuje. Zmiana tylko na poziomie typów, odwracalna, w 2 PR (12 importerów > limit 10 plików).
- **Sama unifikacja typów nie przywraca ochrony kontraktu JSON.** Ochrona była runtime'owa (sanitizer), a jej przywrócenie to poprawka behawioralna kontraktu webhooków, nie refaktor.
- [E] Osłony: `BookingPayloadBuilder.test.ts:229-381` (unit) pilnuje kształtu legacy tylko w potoku fabryki. `sendPayload.test.ts` nie ma przypadku `assignmentReason`. `webhook.e2e.ts:66-122` (etykieta) nie łapie pól dodanych.

### C6. Kontrakt odpowiedzi tylko inferowany; 04-15 przepuszcza go bez mapowania

**Obecny kształt.** [E] 5 miejsc `return`, każde o innym kształcie:

| Return | Linie | Charakterystyka |
|---|---|---|
| istniejąca rezerwacja | `:710-724` | spread rekordu z repo, `references` z DB, bez `videoCallUrl` |
| decoy | `:1506-1581` | literał `id:0`, `isShortCircuitedBooking:true` |
| seats | `:1634-1644` | spread `newBooking` |
| płatność | `:2343-2359` | `message:"Payment required"`, `references` z include create |
| końcowy | `:2562-2577` | `references: referencesToCreate`, `videoCallUrl` |

- [E] Typ jest wyłącznie inferowany (`dto/types.d.ts:47-48`, `types.ts:99-100`; przy obu są TODO). 17 (raport: 28) plików odwołuje się do `BookingResponse`/`RegularBookingCreateResult`.
- [E] Konsumenci:
  - web `useBookings.ts` czyta kilkanaście pól i przekazuje **cały obiekt** do zdarzeń embed `sdkActionManager` (`:197-198, 217-218`);
  - v2 04-15 zwraca całość (`bookings.controller.ts:224-227`) z typem `Promise<ApiResponse<Partial<BookingResponse>>>` (`:202`), który akceptuje dowolny kształt;
  - v2 08-13 czyta 4 pola i ponownie pyta DB (`bookings.service.ts:479-495`).
- [I] Decoy (uid bez wiersza w DB) w 08-13 zakończy się wyjątkiem w `:485`.

**Intencjonalność: celowe ograniczenie.**
- [E] `0eabe7f28b` (2024-09-23, #16200): „versions existing bookings endpoints under 2024-04-15… introduces new endpoints under 2024-08-13”. Ten sam commit dodał `@DocsExcludeController(true)`. Zgadza się to z `agents/rules/api-no-breaking-changes.md:53-58`.
- [E] Domyślne `VERSION_2024_06_14` w Atoms (`0072aba55d`, 2024-06-21) powstało przed 08-13 i nigdy nie zostało podbite. `useCreateBooking` jest typowany webowym `BookingResponse`. [I] Booker Atoms celowo polega na kształcie webowym z 04-15.

**Wykonalność.**
- **Krok strukturalny:** jawny `RegularBookingCreateResult` z `satisfies` w miejscach `return`. Jest odwracalny i tylko compile-time; rozmiar S–M.
- **Krok jednokierunkowy:** zawężenie wyjścia 04-15. To zmiana publicznego kontraktu (callback npm `onCreateBookingSuccess`, `atoms/booker/types.ts:67`), czyli kwestia wersjonowania, nie refaktoru.
- **Prerekwizyt:** type-check v2 w wymaganym CI. Bez niego zmiana typu jest sprawdzana w v2 tylko pod etykietą.
- [E] Generowanie `openapi.json` następuje tylko lokalnie albo przez `yarn generate-swagger`, bez diffu w CI. Strażnik oasdiff usunięto w `ab21c7f805`.

### C7. Ręcznie zduplikowane wiązanie DI (web ↔ API v2)

**Obecny kształt.** [E] Trzy listy po 9 zależności:
- `RBS:423-433` (interfejs);
- web `RegularBookingService.module.ts:22-33`;
- v2 `regular-booking.service.ts:19-40` (sprawdzone w tej syntezie).

v2 dostarcza podklasy Nest dla każdej zależności. `LuckyUserService` jest wiązany ręcznie z tymi samymi 4 repozytoriami (`V2/lib/services/lucky-user.service.ts:10-21`). `webhookProducer` pochodzi z kontenera web przez `useFactory: getWebhookProducer()` (`regular-booking.module.ts:39-42`), z tokenem stringowym. Wzorzec rzutowania `as unknown as PrismaClient` występuje 13× w `V2/lib`. Nie ma wspólnej fabryki serwisu.

**Intencjonalność: celowe ograniczenie z przypadkową duplikacją.**
- [E] Dwa frameworki DI (ioctopus i Nest). v2 może importować `@calcom/features` tylko przez `@calcom/platform-libraries` (`AGENTS.md:193-207`, egzekwowane przez `biome.json:417-445`).
- [E] Każdą nową zależność dodawano w obu miejscach w tym samym commicie (`82951cd04e`, `a050ccb4ee`, `cbc8d3d7a8`, `5d65df9c05`).
- [U] Brak zapisanego uzasadnienia duplikacji zamiast współdzielenia.

**Wykonalność.**
- [I] Wspólny kontener lub fabryka **nie jest adekwatnym kształtem**. Kontener web budowałby singletony web (w tym rozszerzony globalny `prisma` zbundlowany w `dist`) i niweczyłby cel wstrzykiwania `PrismaWriteService` w Nest. Fabryka przyjmująca deps to po prostu konstruktor.
- Adekwatne jest egzekwowanie istniejącego kontraktu `IBookingServiceDependencies` typami (bez rzutowania) oraz type-check v2 w wymaganym CI. To głównie osłona CI, a nie zmiana struktury.
- Usunięcie rzutowania wiąże się z kwestią parytetu rozszerzeń z C2.

### C8. Resztki EE (team / round-robin / org)

**Obecny kształt.**
- [E] Gałęzie warunkowane team/RR/org w handlerze to około 25 zakresów (lista CurrentShape), m.in. `:677-681`, `:780-803`, `:843-858`, `:882-914`, `:950-1145`, `:1312-1323`, `:1437-1448`, `:1661-1685`, `:1848-1903`, `:2490`, `:2524`.
- [E] Część jest już zaślepiona: `teamId:null, orgId:null` na sztywno w `:1465-66, 1480-81, 1489-90, 2315-16, 2506-07`; `loadUsers.ts:15` `getOrgDomainConfig` zawsze zwraca null.
- [E] Osiągalność:
  - żaden żywy kod nie tworzy `Team` ani `Profile` (`V2 teams.repository.ts:14` `create` ma 0 wywołań);
  - `Membership` powstaje tylko przy rejestracji z tokenem istniejącego zespołu (`selfHostedHandler.ts:137`);
  - tRPC `eventTypes` update przepuszcza `schedulingType`/`teamId` przez `...rest` (`update.handler.ts:61-96, 212-213`; schemat `types.ts:110,122`).
  - [I] Właściciel może więc ustawić ROUND_ROBIN/COLLECTIVE na osobistym event type. Czy Prisma przyjmie `teamId` w tym wejściu, to [U].
- [E] Wielo-użytkownikowa ścieżka dostępności jest wspólna z dynamic group booking (`dynamic-group-booking.test.ts`; `dynamicUserList` `RBS:639`), które jest rdzeniem produktu.

**Intencjonalność: mechaniczne usuwanie w forku, niedokończone.**
- [E] `ab21c7f805` usunął z `RBS` tylko kod importujący skasowane moduły EE (−425/+76). Logikę schedulingType/lucky-user zostawił, a jednocześnie skasował testy team: `round-robin.test.ts` (−1239), `collective-scheduling.test.ts` (−2017) i inne.
- [E] Seria porządków Romita (2026-04-22 → 05-05) nie dotknęła `RBS` ani `HNB/`.
- [E] Sygnały sprzeczne: po forku nadal poprawiano kod RR (`88859e4e31` 2026-04-20, `6bfe2df9d1` 2026-10-18). `README.md:41-47` mówi, że zespoły i organizacje usunięto, a `agents/knowledge-base.md:7-19,69-76` nadal je opisuje.
- [E] Część anchorów z raportu nie jest resztkami forka: `loadAndValidateUsers.ts:110` pochodzi z `297a965508` (2022), a `managed-event-type-booking.test.ts:10` z `2faf24fb98` (2023).

**Wykonalność.** **Decyzja produktowa** (czy Cal.diy wspiera RR, multi-host lub upgrade baz Cal.com z zespołami), nie strukturalna. **Zatrzymuję się.**
- Dowody, które by ją rozstrzygnęły: (a) liczby w produkcyjnych bazach wdrożeń: EventType z `teamId` lub `schedulingType` ≠ null oraz bookingi na nich; (b) deklaracja produktowa o wsparciu upgrade'u z baz Cal.com.
- [E] Usunięcie modeli lub kolumn jest jednokierunkowe (migracja, utrata danych). Odrzucenie `schedulingType` w wejściu v2 04-15 event-types to jednokierunkowa zmiana publiczna.

### C9. Podwójny lookup przy reschedule

**Obecny kształt.**
- [E] Pary wywołań: `getSeatedBooking` w `RBS:448` i `:653`; `getOriginalRescheduledBooking` w `:456-459` i `:659-661`. Argumenty mają te same wartości: raz surowe `rawBookingData.rescheduleUid`, raz sparsowane `reqBody.rescheduleUid`.
- [E] Komentarz w `:481-482` („let the service handle it later”) nie zgadza się z zachowaniem. Not-found to `HttpError` 404/400 (`originalRescheduledBookingUtils.ts:12-17`), a walidator re-throwuje każdy `HttpError` (`:478-480`), więc not-found pada wcześnie.
- [E] Kolejność błędów jest obserwowalna: walidator działa przed `:640` i `:646`.
- [E] v2 08-13 dokłada trzeci lookup (`bookings.service.ts:764`).

**Intencjonalność: przypadkowa złożoność.**
- [E] `validateRescheduleRestrictions` dodał `b46fb82695` (2025-12-12, #25575). PR nie wspomina o duplikacji.
- [I] Duplikacja jest efektem ubocznym fail-fast 403, a nie decyzją.

**Wykonalność.**
- Kształt docelowy: rozwiązać `bookingSeat`/`originalRescheduledBooking` raz i przekazać do walidatora oraz handlera.
- Rozmiar S, 1–2 pliki, w pełni odwracalne.
- Prerekwizyt: testy serwisowe 403, obejście dla organizatora, reschedule po uid miejsca, nieznany `rescheduleUid`. Gałąź 403 to luka N3.

### C10. Szew kontraktu wejścia

**Obecny kształt.**
- [E] Po stronie zod nic nie jest zduplikowane. Wszystkie warianty pochodzą od `bookingCreateBodySchema` (`bookingCreateBodySchema.ts:8-50`) przez `.merge`.
- [E] W runtime używany jest tylko `getBookingDataSchema` (`RBS:88, 540-549`), a `bookingCreateSchemaLegacyPropsForApi` dodatkowo przez `getBookingData.ts:40`. `getBookingDataSchemaForApi` i `bookingCreateBodySchemaForApi` są martwe razem z C4(a).
- [E] Ręcznie duplikowane są DTO v2:
  - 04-15 `CreateBookingInput_2024_04_15` (`V2/platform/bookings/2024-04-15/inputs/create-booking.input.ts:91-224`) odwzorowuje pola bazowe 1:1, a ciało jest rzutowane `as unknown as NextApiRequest`;
  - 08-13 to inny, publiczny kształt (`packages/platform/types/.../create-booking.input.ts:222`) z mapperem bez typu zwrotnego (`input.service.ts:137-198`) i rzutowaniem `as unknown as BookingRequest` (`:134`).
  - Żadne `satisfies` nie wiąże DTO z `ExtendedBookingCreateBody`.
- [E] Trasa web przekazuje niezwalidowany `req.body` (`apps/web/pages/api/book/event.ts:50-51`); walidacja odbywa się w handlerze.

**Intencjonalność.**
- [E] Schematy `ForApi` (`517cfde5b8` #6560, `b28d60b6dc` #8115) to celowa kompatybilność wsteczna API v1, którą fork uczynił zbędną: migracja zatrzymana.
- [E] DTO 08-13 (`0eabe7f28b` #16200) zaprojektowano jako osobny kontrakt deweloperski, więc są ręczne z założenia. Czy generowanie świadomie odrzucono, to [U].

**Wykonalność.**
- Kształt docelowy: `bookingCreateBodySchema` jako jedyne źródło zod (już jest) plus strażnik mapowania DTO v2 → body.
- Strażnik ma postać `satisfies` w miejscu rzutowania i spec jest w `api-v2-unit-tests`. To zmiana typów i testów, a nie struktury.
- Zaostrzenie schematu jest jednokierunkową zmianą publiczną.

## 4. Refactor opportunities

Kryterium rankingu: koszt utrzymania długu (kiedy i komu szkodzi, ryzyko ukryte) wobec kosztu i ryzyka zmiany (rozmiar, osłony, odwracalność, kontrakty publiczne). Wszystkie trzy są **inkrementalne i odwracalne krok po kroku**; żaden nie wymaga zmiany pojęć domenowych.

### #1. C2: dokończenie DI na ścieżce tworzenia rezerwacji

- **Obecny → docelowy.**
  - Obecnie 10 helperów `HNB/` sięga po globalny `prisma` (11 wywołań), dochodzą `new UsersRepository()` (`RBS:1736`) i `new BookingRepository(prisma)` (`originalRescheduledBookingUtils.ts:9`). `RBS` miesza `deps.prismaClient` (6 wywołań) z globalnym klientem ukrytym w helperach, a w v2 są to dwa różne klienty o różnej semantyce.
  - Docelowo helpery dostają repozytoria lub klienta z `deps`. To ten sam kształt, który przepływ anulowania ma po `a7a8c78494`, i zarazem cel TODO z `RegularBookingService.module.ts:23`.
- **Dlaczego #1.**
  - Koszt długu jest konkretny, nie tylko estetyczny. Dziś w procesie v2 współistnieją dwa klienty: zapis główny działa z rozszerzeniami (idempotencja, filtr locked), a zapisy przez `deps.prismaClient` bez nich. Każda kolejna „naturalna” poprawka typu „użyj `deps`” cicho wyłącza ochronę przed duplikatami w v2 i nic tego nie złapie (prismock nie stosuje `$extends`, brak asercji na `idempotencyKey`).
  - Zamiar jest jawnie zapisany (TODO), a precedens istnieje w tym samym module (`a7a8c78494`).
  - Dla 2 z 10 helperów istnieją gotowe metody: `BookingRepository.findOriginalRescheduledBooking` i `ScheduleRepository.findScheduleByIdForBuildDateRanges`.
  - Koszt zmiany to M (około 5 PR po S). Osłona unit obejmuje każdy krok, bo `deps.prismaClient` w testach to ten sam prismock.
  - C2 jest też prerekwizytem C1: przenoszenie faz bez jawnych zależności utrwala ukryte globalne wywołania.
- **Blast radius.**
  - Wewnętrzny: 10 plików `HNB/`, ich importerzy (4 pliki `handleSeats`, `tasker/BookingEmailAndSmsTaskService.ts:4`, `loadAndValidateUsers`, `getEventType`), repozytoria (nowe metody) i moduły DI web/v2.
  - Kontrakt publiczny się nie zmienia.
  - Zachowanie runtime w web się nie zmienia (ten sam singleton). **W v2 zmienia się dla zapytań `user.find*` i `booking.create`**, jeśli nie zapewni się parytetu.
- **Szkic ścieżki.**
  1. Kroki neutralne wobec rozszerzeń (`booking`/`bookingSeat`/`schedule`/`eventType`):
     - `originalRescheduledBookingUtils` → `deps.bookingRepository`;
     - `ensureAvailableUsers` → `ScheduleRepository`;
     - `getSeatedBooking`, `findBookingQuery`, `checkActiveBookingsLimitForBooker`, `getEventTypesFromDB` → metody repozytoriów, zgodnie z `agents/rules/data-repository-methods.md`.
  2. Rozstrzygnięcie, jak klient wstrzykiwany w v2 ma zapewnić gwarancje rozszerzeń: parytet w `PrismaWriteService` albo jawny `idempotencyKey` i filtr `locked` w metodach repozytoriów. Blast radius parytetu dla całego v2 to [U] i wymaga osobnego sprawdzenia, bo `PrismaWriteService` obsługuje wszystkie moduły v2.
  3. Zapytania `user.*` (`loadUsers`, `loadAndValidateUsers`, `checkIfBookerEmailIsBlocked`, `updateLastActiveAt`).
  4. Na końcu zapis `createBooking.ts:139-147` → metoda repozytorium z tx.
  5. Usunięcie `prismaClient` z `IBookingServiceDependencies`, jeśli nie zostaną już inne użycia.
- **Pierwszy krok-prerekwizyt.** Integration test (`HNB/test/*.integration-test.ts`, Postgres; działa pod etykietą) asertujący, że ACCEPTED `booking.create` ustawia `idempotencyKey`, a duplikat daje 409 `BookingConflict`. Osobno charakterystyka `checkIfBookerEmailIsBlocked`/`loadUsers` dla użytkownika `locked`. Bez tego kroki 3–4 nie mają osłony.

### #2. C1: `handler` jako orkiestrator nazwanych faz (z C9 jako pierwszym wycinkiem)

- **Obecny → docelowy.**
  - Obecnie: jedna funkcja modułowa o 2 093 liniach, około 13 zmiennych mutowanych między fazami, 5 kształtów `return`, dwa bloki inline po około 325 i 350 linii. Klasa jest fasadą z `handler.bind(this)`.
  - Docelowo `createBooking` wywołuje kolejne fazy (load/validate → assignment/availability → persist → integrations → side-effects). Fazy to funkcje lub metody z jawnym wejściem i wyjściem, w istniejącej konwencji `HNB/` (bez nowej abstrakcji pipeline).
- **Dlaczego #2, a nie #1.**
  - Dług jest największy w strefie ryzyka nr 1 repo-mapy: 46 commitów w 12 miesiącach, partnerzy co-change, luki testowe wynikające z niemożności testowania faz osobno. Migracja jest jawnie zatrzymana (stack #23277 → #24025 bez części 4).
  - Koszt zmiany jest jednak L (około 9–10 PR, około 4 000+ zmienionych linii [I, szacunek]).
  - Zysk zależy od tego, czy booking będzie dalej zmieniany. [E] Od forka `RBS` nie miał żadnego commita poza samym forkiem, a repo jest w trybie utrzymania (`repo-map.md:15`).
  - Przed C2 każda wyniesiona faza dalej ukrywałaby globalny klient.
- **Blast radius.**
  - Wewnętrzny: `RBS`, `HNB/*`, 2 testy importujące `buildDryRunBooking`/`computeTeamData`, moduł DI web, podklasa v2 przez `platform-libraries`.
  - Zewnętrzny: wyłącznie behawioralny (HTTP v2 04-15/08-13, Atoms npm, booker web), bez zmiany sygnatur.
- **Szkic ścieżki.**
  1. Prolog `:486-700` (load/validate/guards + C9: jeden lookup reschedule przekazywany dalej).
  2. Dostępność i assignment `:824-1151`.
  3. Budowa `evt` `:1153-1450`.
  4. Zapis `:1661-1828`.
  5. EventManager `:1830-2181` (deduplikacja Google Meet `:1951-2005` / `:2078-2128`).
  6. Płatność i webhooki `:2255-2440`.
  7. Efekty końcowe `:2442-2549`.

  Każdy krok to extract-and-delegate za tą samą sygnaturą, osobno odwracalny. Krok 7 przy okazji jawnie typuje kształty `return`, co jest tanią częścią C6.
- **Pierwszy krok-prerekwizyt.**
  - Testy charakteryzujące prolog w `HNB/test/reschedule.test.ts` / `booking-validations.test.ts`: 403 minimum-reschedule-notice, obejście dla organizatora, `recurring_event_seats_error`, nieznany `rescheduleUid`.
  - Poprawka N1 (`RBS:542` przed `:640`), żeby nie zamrażać w testach błędnego zachowania.

### #3. C4 (a–d): usunięcie martwego API serwisu i martwych zależności DI

- **Obecny → docelowy.**
  - Obecnie są: `createBookingForApiV1` (0 wywołań, spełniony warunek `@deprecated`) z łańcuchem `getBookingDataSchemaForApi`/`bookingCreateBodySchemaForApi`; `rescheduleBooking` w dwóch serwisach plus `IBookingService`/`IBookingCreateService` (0 konsumentów); `hashedLinkService` w kontrakcie 9 zależności (0 odczytów); martwe zmienne lokalne (`assignmentReason`, `isNormalBookingOrFirstRecurringSlot`, `_crmRecordId`, `firstUser`); nieczytany `CreateBookingMeta.noEmail`.
  - Docelowo klasa ma metody `createBooking` i `fireBookingEvents`, a kontrakt DI 8 zależności. Zostaje tasker, wyłączony jako decyzja roadmapowa (e).
- **Dlaczego #3.**
  - Najlepszy stosunek kosztu do zmiany: każdy krok S, pochodzenie przypadkowe [E], kontrakt publiczny nie zmienia się w repo.
  - Zmniejsza powierzchnię, którą muszą przenieść C1 i C7 (kontrakt DI w 3 miejscach).
  - Usuwa mylący kod: `assignmentReason` w `:2252` sugeruje działające pole webhooka.
  - Jest na 3. miejscu, bo bezwzględna wartość jest mała: martwy kod nie powoduje błędów runtime.
- **Blast radius.**
  - Wewnętrzny: `RBS`, `IBookingService.ts`, `RecurringBookingService.ts`, `dto/types.d.ts`, `bookingCreateBodySchema.ts`, `getBookingDataSchemaForApi.ts`, moduł DI web, serwis i moduł v2.
  - Zewnętrzny: `@calcom/platform-libraries` ma ręczny skrypt publikacji (`package.json:17`), więc istnienie konsumentów npm poza repo to [U]. To jedyne ryzyko kontraktu.
- **Szkic ścieżki.** Osobne PR po S: (a) ApiV1 + schematy `ForApi`; (b) `rescheduleBooking` + interfejsy; (c) `hashedLinkService` (web module, v2 ctor/`super`); (d) martwe zmienne lokalne.
- **Pierwszy krok-prerekwizyt.** Uruchomienie (a) z etykietą `ready-for-e2e`, bo tylko `build-api-v2` sprawdza typy v2 względem usuniętej metody i typu. Trwalszym prerekwizytem dla #1–#3 i C6/C7 byłby skrypt `type-check:ci` w `apps/api/v2/package.json`. To osłona CI (nie-kandydat), a jej koszt czasu i pamięci CI to [U].

### Rozważone i odrzucone

| Kandydat | Dlaczego odrzucony | Co zostaje |
|---|---|---|
| C3 Brak atomowości | Kolejność to celowa, nośna decyzja (rezerwacja w DB przed efektami zewnętrznymi; `6ab741b927`, `d85e0b51e4`, `1c59c0dd06`). Prawdziwa naprawa to semantyka niezawodności rezerwacji, czyli **decyzja domenowa**, poza tą analizą | test charakteryzujący porażkę `booking.update` references (N3) jako wejście do osobnej analizy |
| C8 Resztki EE | **Decyzja produktowa** (wsparcie RR, multi-host, upgrade z Cal.com); ścieżka jest współdzielona z dynamic group; kroki schematowe są jednokierunkowe | dane z produkcyjnych baz + deklaracja produktowa jako warunek ponownej oceny |
| C6 Kontrakt odpowiedzi | Zamrożenie 04-15 jest celowe (`0eabe7f28b`, `api-no-breaking-changes.md`); zawężenie wyjścia to wersjonowanie, nie refaktor | jawny typ wyników z `satisfies` jako tani krok w ramach C1 (krok 7) po wpięciu type-checku v2 |
| C7 Duplikacja DI | Dwa korzenie kompozycji są celowe; wspólna fabryka nie jest adekwatna (niweczy wstrzykiwanie Nest) | type-check v2 w CI + usunięcie rzutowania po rozstrzygnięciu parytetu z C2 |
| C5 Dwa `EventPayloadType` | Unifikacja typów to mała wartość; realne ryzyko (cofnięty sanitizer z `3a7122d613`) to poprawka behawioralna kontraktu webhooków, uśpiona przy braku nowych wierszy `AssignmentReason` [I] | osobna decyzja o przywróceniu ochrony kontraktu JSON |
| C9 Podwójny lookup | Mały, lokalny koszt (dodatkowa para zapytań przy reschedule) | wchłonięty jako krok 1 w #2 |
| C10 Szew wejścia | Zod jest już derywowany; martwe `ForApi` znikają w #3(a); DTO v2 to celowo osobny kontrakt; strażnik to typy i testy, nie struktura | `satisfies` w `input.service.ts:134` + spec v2 jako osłona |

## Code References

- `packages/features/bookings/lib/service/RegularBookingService.ts:423-433` (kontrakt deps), `:435-484` (walidacja reschedule), `:486-2578` (handler), `:1703` (martwy `assignmentReason`), `:2215,2527-2532` (tasker), `:2444-2463` (references), `:2585-2690` (klasa).
- `packages/features/bookings/di/RegularBookingService.module.ts:23` (TODO DI), `packages/features/di/modules/Prisma.ts:3,9`.
- `apps/api/v2/src/lib/services/regular-booking.service.ts:18-41` (podklasa, rzutowanie `:32`); `apps/api/v2/src/modules/prisma/prisma-write.service.ts:61,64` (klient bez rozszerzeń).
- `packages/prisma/index.ts:79-83` (rozszerzenia globalnego klienta); `packages/prisma/extensions/booking-idempotency-key.ts:23-35`; `exclude-locked-users.ts:6-21`.
- `packages/features/bookings/lib/handleNewBooking/createBooking.ts:139-147`; `originalRescheduledBookingUtils.ts:7-9`.
- `packages/features/bookings/repositories/BookingRepository.ts:1170` (`findOriginalRescheduledBooking`); `ScheduleRepository.findScheduleByIdForBuildDateRanges` (`:22-55`, wg CurrentShape).
- `packages/features/webhooks/lib/sendPayload.ts:81-104`; `webhooks/lib/dto/types.ts:533-550`; `factory/versioned/v2021-10-20/BookingPayloadBuilder.ts:199-201`.
- `packages/trpc/server/routers/viewer/bookings/confirm.handler.ts:284-289,364`.
- `.github/workflows/pr.yml:452-473` (bramka `required`); `packages/platform/libraries/package.json:17`; `.changeset/config.json:10`.

## Architecture Insights

- [I] Dług ścieżki tworzenia to w większości **migracje zatrzymane w połowie** (C1, C2, C10), a nie decyzje. Repo ma gotowe wzorce docelowe w sąsiednim przepływie anulowania (`a7a8c78494`) i w regułach `agents/rules/`. Refaktor może więc dokończyć istniejący kierunek zamiast wprowadzać nowy.
- [I] Fork `ab21c7f805` działał jak usuwanie oparte na importach: kasował kod importujący moduły EE i testy, a zostawiał logikę i kontrakty. Stąd martwe API (C4), uśpiony kontrakt webhooków (C5), gałęzie RR bez testów (C8) i usunięty strażnik oasdiff.
- [E] Najważniejszy szew bliźniaków nie leży w typach, tylko w **runtime**: dwa klienty Prisma w procesie v2 o różnej semantyce rozszerzeń i `dist` `platform-libraries` z własnym zbundlowanym `@calcom/prisma` (wg MigrationFeasibility: `platform/libraries/vite.config.js` nie wyklucza `@calcom/prisma`).

## Historical Context (from prior changes)

Weryfikacja wybranych twierdzeń `booking-analysis/research.md` (każde osobno):

| Twierdzenie raportu | Werdykt | Wyjątek / dowód |
|---|---|---|
| Brak strażnika driftu `openapi.json` (dług #9) | **partial** | prawdą jest, że dziś go brak; ale strażnik istniał (`check-api-v2-breaking-changes.yml`, oasdiff) i usunął go `ab21c7f805` |
| `3a7122d6` to „revert” kontraktu `assignmentReason` (dług #6) | **partial** | to forward-fix z sanitizerem (#27891), nie `git revert`; jego efekt w dużej części cofnął `ab21c7f805` |
| Runtime v2: source vs `dist` `platform-libraries` [U] (Open Question 2) | **rozstrzygnięte [I mocne]** | `dist` (`apps/api/v2/package.json:24`, brak mapowania w jest) |
| „Type-check, gdy API v2 rozwiązuje libraries ze źródła” jako strażnik szwu DI (`:293`) | **partial** | `tsconfig.json:31` mapuje subpath na źródło, ale żaden wymagany job nie type-checkuje v2; robi to tylko `build-api-v2` z etykietą |
| `deps.prismaClient` vs globalny `prisma` (dług #2, skutek [I]) | **supported, wzmocnione** | w v2 to fizycznie inny klient, bez rozszerzeń |
| Martwy kod: 4 elementy (dług #4) | **supported, uzupełnione** | plus `assignmentReason`, `RecurringBookingService.rescheduleBooking`, `IBookingCreateService`, 3 martwe zmienne lokalne, `CreateBookingMeta.noEmail` |
| Resztki EE, osiągalność [U] (dług #12) | **partial** | brak żywych twórców `Team`/`Profile`; `schedulingType` ustawialny przez tRPC update; `loadAndValidateUsers.ts:110` i `managed-event-type-booking.test.ts:10` sprzed forka |
| Komentarz `RBS:481` sugeruje późną obsługę not-found (implicite w długu #13) | **contradicted** | not-found to `HttpError`, który jest re-throwowany wcześnie |
| Szew wejścia: „4 schematy” jako ręczna duplikacja | **partial** | zod jest derywowany (`.merge`); ręczne są tylko DTO v2 |
| `e2e-atoms.yml` nie jest wołany przez `pr.yml` | **supported** | potwierdzone przez MigrationFeasibility |

## Weryfikacja twierdzeń (ast-grep)

Zakres: twierdzenia strukturalne, na których stoi ranking (liczności metod i wywołań, „nadpisuje X, ale nie Y”, pary lustrzanych typów i list). Commit `23e4257c0a`, ast-grep 0.51.0 (`ast-grep run -p` albo `ast-grep scan --inline-rules`, język `ts`). Każde zero z ast-grep sprawdzono dodatkowo przez `git grep` po `packages` i `apps`, bo język `ts` w ast-grep pomija pliki `.tsx`. Poprawki w tekście raportu mają format „nowa wartość (raport: stara)”. Sekcji 4 i werdyktów intencjonalności nie zmieniano.

| # | Twierdzenie (sekcja) | Werdykt | Dowód (plik:linia) | Metoda (wzorzec/reguła) |
|---|---|---|---|---|
| V1 | `handler` = `RBS:486-2578`, 2 093 linie (P1, C1) | potwierdzone | `RBS:486-2578` | `async function handler($$$ARGS) { $$$ }` |
| V2 | Klasa to fasada: `handler.bind(this)`; konstruktor + `fireBookingEvents`, `createBooking`, `rescheduleBooking`, `createBookingForApiV1` (C1, C4) | potwierdzone | klasa `RBS:2585-2690`; 4 metody `:2588, 2653, 2663, 2676`; `bind` w `:2654, 2664, 2681` | `handler.bind(this)`; reguła `kind: method_definition`, `inside: class_body` ← `class_declaration` o nazwie `^RegularBookingService$` |
| V3 | 16 `let` poza pętlami (C1) | potwierdzone | `RBS:509, 574, 659, 806, 810, 824, 825, 826, 1332, 1363, 1687, 1688, 1690, 1703, 1838, 1933` | `kind: lexical_declaration`, `regex: ^let`, `inside` handler (`stopBy: end`), `not inside` for/for_in/while/arrow_function/function_expression |
| V4 | „około 13” `let` przepisywanych między fazami (C1) | **doprecyzowane:** 15 z 16 ma ≥1 przypisanie w handlerze; bez przypisania jest tylko `assignmentReason` | np. `evt` 18 przypisań (całość lub pola), `locationBodyString` `:1178-1203`, `availableUsers` `:936-977` | `kind: assignment_expression` / `augmented_assignment_expression` `inside` handler, grupowanie po lewej stronie |
| V5 | `evt =` w `:1657, 1749, 1753, 1759, 1843`; `booking.*` mutowany w `:2054, 2290`, `handleAppsStatus.ts:37`; `reqBody` w `:1340-1344` (C1) | potwierdzone | dokładnie te linie; `reqBody.calEventResponses.location.value =` `:1341` (warunek w `:1340`); `booking =` dodatkowo `:1707, 1812` | `evt = $X`; `kind: assignment_expression` z `field: left`, `kind: member_expression`, `regex: ^booking\.` / `^reqBody` |
| V6 | 5 miejsc `return` o różnych kształtach (C1, C6) | potwierdzone | `RBS:710-724, 1506-1581, 1634-1644, 2343-2359, 2562-2577` | `kind: return_statement` `inside` handler, `not inside` arrow_function/function_expression/method_definition (`stopBy: function_declaration`) |
| V7 | Google Meet prawie zduplikowany (C1) | potwierdzone | if-bloki `RBS:1953-2005` i `:2080-2128` (raportowe `:1951`/`:2078` obejmują komentarz); podobieństwo tekstu 0,897 (różnice: `updatedEvent` ↔ `createdEvent`) | `kind: if_statement` `has: statement_block` `has: lexical_declaration` `regex: googleMeetResult` + difflib |
| V8 | 14 plików unit przez `getNewBookingHandler` (C1) | potwierdzone | 15 importerów: 14 `*.test.ts` (13 w `HNB/`, w tym `global-booking-limits.test.ts:20`, oraz `handleSeats/test/handleSeats.test.ts:30`) + 1 integration (`test/spam-booking.integration-test.ts:21`) | `kind: import_statement`, `field: source`, `regex: getNewBookingHandler["']$` |
| V9 | `buildDryRunBooking` (`RBS:148`), `computeTeamData` (`RBS:269`) importowane przez 2 testy (C1) | potwierdzone | `test/buildDryRunBooking.test.ts:3`, `test/computeTeamData.test.ts:5` | `kind: import_statement` `has: import_specifier` `regex: ^(buildDryRunBooking\|computeTeamData)$` |
| V10 | „Funkcja modułowa + cienka klasa” w `RecurringBookingService.ts:11/141`, `handleCancelBooking.ts:81/539` (C1) | potwierdzone | `handleNewRecurringBooking` `:11`, klasa `:141-175`; `handler` `:81-525`, `BookingCancelService` `:539-550` | `kind: function_declaration` / `class_declaration`; metody klas jak w V2 |
| V11 | Brak abstrakcji pipeline/step (C1) | potwierdzone (0) | brak | `kind: class_declaration` / `interface_declaration`, nazwa `regex: (Pipeline\|Step)$` w `packages/features`, `packages/lib`, `V2` → 0; `git grep -E "(class\|interface) \w*(Pipeline\|Step)\b"` → 0 |
| V12 | Globalny `prisma` w 10 plikach `HNB/`, 11 wywołań `prisma.` (P2, C2) | potwierdzone | importy: `checkActiveBookingsLimitForBooker.ts:4`, `checkIfBookerEmailIsBlocked.ts:5`, `createBooking.ts:4`, `ensureAvailableUsers.ts:15`, `findBookingQuery.ts:2`, `getEventTypesFromDB.ts:7`, `getSeatedBooking.ts:1`, `loadAndValidateUsers.ts:12`, `loadUsers.ts:10`, `originalRescheduledBookingUtils.ts:4`; wywołania: `:45, :79`, `:28`, `:130, :139`, `:134`, `:6`, `:204`, `:7`, `:112`, `loadUsers.ts:133` | `kind: import_statement`, source `^["']@calcom/prisma["']$`; `kind: call_expression`, `field: function` → `member_expression` z obiektem `^prisma$` lub `prisma.<model>`; krzyżowo `git grep -c` (11) |
| V13 | Instancjonowanie repozytorium z globalnym klientem: `new BookingRepository(prisma)` (P2, C2) | **doprecyzowane:** są dwa takie miejsca | `originalRescheduledBookingUtils.ts:9` `new BookingRepository(prisma)` oraz `loadUsers.ts:128` `new UserRepository(prisma)._getWhereClauseForFindingUsersByUsername` | `kind: identifier`, `regex: ^prisma$`, `not inside` (obiekt `member_expression`, import) → 2 trafienia |
| V14 | `new UsersRepository()` `RBS:1736`; wstrzyknięty `UserRepository` nie ma `updateLastActiveAt` (C2) | potwierdzone | `RBS:1736-1737`; `UsersRepository.updateLastActiveAt` `users/users.repository.ts:6`; `UserRepository` (62 metody) bez niej | `new UsersRepository($$$)`; metody klasy jak w V2; `git grep updateLastActiveAt` → tylko `users.repository*.ts` i `RBS:1737` |
| V15 | `RBS` używa `deps.prismaClient` 6× i nie używa globalnego `prisma` (C2, #1) | potwierdzone | `RBS:829, 1312, 1777, 2141, 2258, 2446`; identyfikator `prisma` w `RBS`: 0 (`git grep -w prisma`: tylko importy typów `:70-73`) | `deps.prismaClient`; `kind: identifier`, `regex: ^prisma$` → 0 |
| V16 | Istniejące metody-odpowiedniki (C2) | potwierdzone | `BookingRepository.ts:1170` (`findOriginalRescheduledBooking`), `:2008` (`managedEventReassignmentTransaction`), `:1582` (`updateIncludeReferences`), `:1363` (`countBookingsByEventTypeAndDateRange`); `ScheduleRepository.ts:22-55`; `UserRepository.ts:169, 280, 374` | metody klas jak w V2 (`BookingRepository` 54, `ScheduleRepository` 9, `UserRepository` 62, `BookingSeatRepository` 3 metody) |
| V17 | `ensureAvailableUsers` ma ten sam select co `findScheduleByIdForBuildDateRanges` (C2) | potwierdzone | `ensureAvailableUsers.ts:136-162` ≡ `ScheduleRepository.ts:25-51` po normalizacji białych znaków | `kind: pair`, klucz `^select$`, `inside` `call_expression` `regex: schedule\.findUnique`, porównanie tekstu |
| V18 | Importerzy wartości helperów: `findBookingQuery` ← 4 pliki `handleSeats`; `getOriginalRescheduledBooking` ← `BookingEmailAndSmsTaskService.ts:4`; `loadUsers` ← `loadAndValidateUsers`; `getEventTypesFromDB` ← `getEventType` (C2, #1) | potwierdzone | `handleSeats/create/createNewSeat.ts:13`, `…/attendee/attendeeRescheduleSeatedBooking.ts:10`, `…/owner/combineTwoSeatedBookings.ts:12`, `…/owner/moveSeatedBookingToNewTimeSlot.ts:10`; `RBS:106` + `tasker/BookingEmailAndSmsTaskService.ts:4`; `loadAndValidateUsers.ts:19`; `getEventType.ts:6` (pozostałe importy to `import type`) | `kind: import_statement`, source `regex: (handleNewBooking\|\.)/<moduł>["']$` |
| V19 | Precedens: przepływ anulowania po `a7a8c78494` dostaje repozytoria z `deps` (C2, #1) | **doprecyzowane:** wstrzykiwanie jest opcjonalne, fallback to globalny klient | `handleCancelBooking.ts:32` `import prisma`, `:81` `dependencies?: Dependencies`, `:82-92` `dependencies \|\| { new UserRepository(prismaClient), … }` | `kind: function_declaration` (V10) + `git grep -n "prisma\|dependencies"` |
| V20 | Sekwencja C3: `updateLastActiveAt` `:1737`, `bookingSeat.create` `:1777`, `reschedule` `:1909`, `create` `:2052`, `fireBookingEvents` `:2217`, płatność `:2291`, webhook `:2433`, `booking.update` `:2446`; tx `createBooking.ts:139-147` | potwierdzone | jw.; dodatkowo `handleWebhookTrigger` w `:2319` (ścieżka płatności); `tx.booking.update` `createBooking.ts:141`, `tx.booking.create` `:144` | `$M.reschedule($$$)`, `$M.create($$$)`, `this.fireBookingEvents($$$)`, `handlePayment($$$)`, `handleWebhookTrigger($$$)`, `$T.booking.create($$$)` |
| V21 | `createBookingForApiV1`: 0 wywołań (C4, #3) | potwierdzone (0) | tylko definicja `RBS:2676` | `$O.createBookingForApiV1($$$)` → 0; `git grep createBookingForApiV1` → 1 (definicja) |
| V22 | `rescheduleBooking` w `RBS:2663` i `RecurringBookingService.ts:160`: 0 wywołań (C4, #3) | potwierdzone (0) | 26 trafień `$O.rescheduleBooking($$$)` należy do innych klas: `BookingsService_2024_08_13` (`V2/platform/bookings/2024-08-13/controllers/bookings.controller.ts:328`) i `CalendarSyncService.ts:76` + jego testy | `$O.rescheduleBooking($$$)`; `git grep "\.rescheduleBooking("` (bez testów) → 2, oba spoza serwisów bookingu |
| V23 | `createBookingForApiV1` jest jedyną drogą do `getBookingDataSchemaForApi` (C4a) | **doprecyzowane:** moduł nie ma żadnego importu wartości | jedyny import: `import type` w `dto/types.d.ts:6` (unia `BookingDataSchemaGetter` `:13`); `createBookingForApiV1` przyjmuje tylko parametr `bookingDataSchemaGetter` (`RBS:2679`); `bookingCreateBodySchemaForApi` czyta wyłącznie `getBookingDataSchemaForApi.ts:4,18` | `kind: import_statement`, source `getBookingDataSchemaForApi["']$` → 1 (type); `kind: identifier`, `regex: ^getBookingDataSchemaForApi$`; `git grep` → 4 trafienia, 0 wartości |
| V24 | `IBookingService`: 2 implementacje, nikt nie typuje; `IBookingCreateService`: 0 użyć (C4b) | potwierdzone (0) | `implements` w `RecurringBookingService.ts:141`, `RBS:2585`; poza tym tylko importy `:5`, `RBS:112`; `IBookingCreateService` tylko definicja `IBookingCreateService.ts:4`; członkowie `any` `IBookingService.ts:5-8` | `kind: class_declaration` `has: class_heritage` `regex: implements\s+IBookingService\b`; `kind: identifier/type_identifier`; `git grep -w` |
| V25 | `deps.hashedLinkService`: 0 odczytów w `RBS`; deklaracja `:429`, web `:29`, v2 `:23,34` (C4c) | potwierdzone (0) + **doprecyzowane** | w `RBS` tylko `:429`; `HashedLinkService` czyta `BookingEventHandlerService.ts:61` (`this.deps.hashedLinkService`), wiązany w web `BookingEventHandlerService.module.ts:17` i v2 `booking-event-handler.service.ts:8,11` | `$D.hashedLinkService`; `kind: property_identifier/identifier/shorthand_*`, `regex: ^hashedLinkService$`; `git grep` w `RBS` → 1 |
| V26 | Tasker: `isBookingEmailSmsTaskerEnabled = false` `:2215`, `send` `:2532`, 5 providerów v2 `:49-53` (C4e) | potwierdzone | `RBS:2215, 2530` (warunek), `:2532-2544`; `regular-booking.module.ts:49-53` | `kind: identifier`, `regex: ^isBookingEmailSmsTaskerEnabled$`; `$D.bookingEmailAndSmsTasker.send($$$)` |
| V27 | Martwe lokalne: `assignmentReason` bez przypisania (`:1703`; użycia `:1758-1765`, `:2252`); `isNormalBookingOrFirstRecurringSlot` `:655`, `_crmRecordId` `:789`, `firstUser` `:808` nieczytane (C4d) | potwierdzone (0) | każdy z trzech ostatnich ma tylko deklarację; `assignmentReason` ma 0 przypisań (V4) i odczyty tylko w `:1758, 1761, 1762, 2252` | `kind: identifier/shorthand_*`, `regex: ^<nazwa>$` `inside` handler; `git grep -w` w `RBS` |
| V28 | `CreateBookingMeta.noEmail` (`dto/types.d.ts:39`) nieczytany (C4d) | **obalone** | czyta `RecurringBookingService.ts:60, 102` (`input.noEmail`; `input: BookingHandlerInput = {bookingData} & CreateBookingMeta`, `:7-9`); zapisują 3 wywołania `recurringBookingService.createBooking`: `V2/…/2024-04-15/controllers/bookings.controller.ts:340`, `V2/…/2024-08-13/services/bookings.service.ts:415`, `apps/web/pages/api/book/recurring-event.ts:56`. Nieczytany jest tylko na ścieżce `RBS` (handler bierze `noEmail` z `bookingData`, `RBS:553`) | `$X.noEmail` w `RBS` → 0; `kind: pair`, klucz `^noEmail$` `inside` pary `^bookingMeta$` → 3; `git grep -w noEmail` |
| V29 | Dwa `EventPayloadType`: różnice `assignmentReason`, `uid`, `paymentData`; 13 pól identycznych (C5) | potwierdzone | `sendPayload.ts:81-104` (16 własnych pól), `dto/types.ts:533-550` (14); `paymentData?: PaymentData` (`sendPayload.ts:97`) vs `Record<string, unknown>` (`dto/types.ts:548`) | `kind: property_signature` `inside: object_type` ← `intersection_type` ← `type_alias_declaration` `^EventPayloadType$`; porównanie znormalizowanego tekstu |
| V30 | „Nadpisuje X, ale nie Y”: wariant `sendPayload` nadpisuje `assignmentReason` (`Omit` + własna unia), wariant `dto` nie (pełny `CalendarEvent`) (C5) | potwierdzone + **doprecyzowane** | `sendPayload.ts:81, 99-103`; `dto/types.ts:533`; trzecie nadpisanie: `V20211020BookingEventPayload = Omit<EventPayloadType,"assignmentReason"> & {assignmentReason?: …[] \| null}` (`factory/versioned/v2021-10-20/types.ts:12-13`) | `kind: type_alias_declaration`; `kind: export_statement`, `regex: EventPayloadType` |
| V31 | Typy pomocnicze skopiowane 1:1 (C5) | potwierdzone | 6 aliasów identycznych: `EventTypeInfo`, `UTCOffset`, `WithUTCOffsetType`, `BookingNoShowUpdatedPayload`, `TranscriptionGeneratedPayload`, `OOOEntryPayloadType` (`sendPayload.ts:15-79` ↔ `dto/types.ts:467-531`); `WebhookPayloadType` istnieje tylko w `sendPayload.ts:106` | `kind: type_alias_declaration`, nazwa `^<alias>$`, porównanie znormalizowanego tekstu |
| V32 | Importerzy: `sendPayload` 10 plików produkcyjnych, `dto` 2 (C5) | **doprecyzowane:** 9 / 3; suma 12 bez zmian | `sendPayload`: `triggerWebhooks.ts:4`, `handlePaymentSuccess.ts:14`, `getWebhookPayloadForBooking.ts:1`, `handleConfirmation.ts:8`, `cancelAttendeeSeat.ts:10`, `handleSeats.ts:3`, `RBS:54`, `confirm.handler.ts:18`, `testTrigger.handler.ts:2`; `dto`: `factory/types.ts:1-5` (unia `WebhookPayload` `:80`), `v2021-10-20/types.ts:1`, `BookingPayloadBuilder.test.ts:5-9` | `kind: import_statement` z source `sendPayload["']$` / `dto/types["']$` i specyfikatorem `^EventPayloadType\b`; `git grep -w EventPayloadType` |
| V33 | `BookingPayloadBuilder` zdejmuje `assignmentReason` z `evt` (`:199-201`) (C5) | potwierdzone + **doprecyzowane** | `BookingPayloadBuilder.ts:201` destrukturyzacja; `:229` dokłada `assignmentReason: params.booking.assignmentReason ?? null` w kształcie legacy | `kind: object_pattern` `has: pair_pattern` `regex: ^assignmentReason`; `kind: pair`, klucz `^assignmentReason$` |
| V34 | Nikt nie tworzy wierszy `AssignmentReason`; wywołanie „`AssignmentReasonRepository.create`” (C5) | potwierdzone (0) + **doprecyzowane** nazwy | metoda to `createAssignmentReason` (`assignment-reason/repositories/AssignmentReasonRepository.ts:15-29`), 0 wywołań; trafienia `assignmentReason: {` w `BookingRepository.ts:328, 2128`, `getUserBooking.ts:74`, `confirm.handler.ts:148` to `select`, nie nested write | `$R.createAssignmentReason($$$)` → 0 (`ts` i `tsx`); `kind: pair`, klucz `^assignmentReason$`; `git grep -E "createAssignmentReason\|assignmentReason\.create"` → tylko definicja |
| V35 | 28 plików odwołuje się do `BookingResponse`/`RegularBookingCreateResult` (C6) | **obalone liczbowo:** 17 | definicje `dto/types.d.ts:48`, `types.ts:100`; 17 plików (m.in. `V2/…/2024-04-15/controllers/bookings.controller.ts`, `useBookings.ts`, `atoms/booker/types.ts`, `platform/libraries/{bookings,index}.ts`) | `kind: type_identifier/identifier`, `regex: ^(BookingResponse\|RegularBookingCreateResult)$` (`ts` 17, `tsx` 0); `git grep -l -w` → 17 (bez `-w` 54, czyli liczenie podciągów, np. `CreateBookingResponse`) |
| V36 | 04-15 zwraca całość z typem `Promise<ApiResponse<Partial<BookingResponse>>>` (C6) | potwierdzone | `V2/…/2024-04-15/controllers/bookings.controller.ts:202, 224-227` | `kind: type_annotation` `regex: Partial<BookingResponse>`; `kind: return_statement` `regex: data: booking\b` w `createBooking` |
| V37 | Trzy listy po 9 zależności (C7) | potwierdzone | `RBS:424-432`; web `RegularBookingService.module.ts:24-32`; v2 konstruktor `regular-booking.service.ts:20-28`, `super` `:31-39` | `kind: property_signature` w `interface_declaration` `^IBookingServiceDependencies$` (9); `kind: pair` w obiekcie pary `^depsMap$` (9); `kind: required_parameter` konstruktora v2 (9) |
| V38 | v2 dostarcza podklasy Nest dla każdej zależności (C7) | **doprecyzowane:** 7 z 9 | `extends`: `PrismaBookingRepository`, `PrismaUserRepository`, `BookingEventHandlerService`, `CheckBookingAndDurationLimitsService`, `HashedLinkService`, `LuckyUserService`, `BookingEmailAndSmsTasker` (`V2/lib/**`); `prismaClient` to rzutowanie (`regular-booking.service.ts:32`), `webhookProducer` pochodzi z fabryki (`regular-booking.module.ts:39-42`) | `kind: class_declaration` `has: class_heritage` (`stopBy: end`) |
| V39 | `LuckyUserService` wiązany ręcznie z tymi samymi 4 repozytoriami (C7) | potwierdzone | v2 `lucky-user.service.ts:10-21`; web `di/modules/LuckyUser.ts:17-21` | `kind: class_declaration` `has: class_heritage` (V38) + `git grep -n` obu plików |
| V40 | `as unknown as PrismaClient` 13× w `V2/lib` (C7) | potwierdzone | 12 repozytoriów `V2/lib/repositories/prisma-*.repository.ts:10` + `regular-booking.service.ts:32`; w całym `V2/src` 27 | `$E as unknown as PrismaClient` |
| V41 | Pary lookupów `getSeatedBooking` `RBS:448/653`, `getOriginalRescheduledBooking` `:456-459/659-661` (C9) | potwierdzone | `:448, 653`; `:456-459, 660` (w `let` `:659-661`); walidator wołany w `:529-538` | `getSeatedBooking($$$)`, `getOriginalRescheduledBooking($$$)`, `validateRescheduleRestrictions($$$)` |
| V42 | Zod: wszystkie warianty pochodzą od `bookingCreateBodySchema` przez `.merge`, nic nie jest zduplikowane (C10) | **doprecyzowane** | `.merge` w `bookingCreateBodySchema.ts:72, 91, 109`; dwa niezależne korzenie `z.object` wmergowane w warianty: `recurringBookingCreateBodyPartialSchema` `:56-70` i `bookingCreateSchemaLegacyPropsForApi` `:97-106`; przecięcie ich kluczy z 29 kluczami bazy = ∅, więc duplikacji pól nie ma | `$A.merge($$$)`; `kind: call_expression` `regex: ^z\.object`, `not inside` innego `z.object`; `kind: pair` w `z.object` danego deklaratora |
| V43 | Runtime używa tylko `getBookingDataSchema` (`RBS:88, 540-549`); `bookingCreateSchemaLegacyPropsForApi` także w `getBookingData.ts:40` (C10) | potwierdzone | import `RBS:88`, wartość domyślna parametru `:490`, wywołanie przez `bookingDataSchemaGetter` `:540-543`; import `getBookingData.ts:8` | `kind: identifier`, `regex: ^getBookingDataSchema$`; importy modułu `bookingCreateBodySchema` (9) |
| V44 | Mapper 08-13 bez typu zwrotnego (`input.service.ts:137-198`), rzutowanie `as unknown as BookingRequest` (`:134`); 04-15 rzutuje na `NextApiRequest`; brak `satisfies` (C10) | potwierdzone + **doprecyzowane** | `transformInputCreateBooking` `:137-198` bez `return_type`; `as unknown as BookingRequest` 4×: `:134, 273-279, 573, 811`; 04-15 `bookings.controller.ts:562`; `satisfies` w `V2/platform/bookings`: 0 | `kind: method_definition` `not has: return_type`; `$E as unknown as BookingRequest`; `kind: as_expression` `regex: NextApiRequest`; `kind: satisfies_expression` → 0, `git grep -w satisfies` → 0 |
| V45 | Globalny `prisma` ma 4 rozszerzenia (`packages/prisma/index.ts:79-83`); klient v2 bez `$extends` (Summary, C2) | potwierdzone | 4 × `$extends` w `:80-83` (ten sam łańcuch także w `:68-71`); `prisma-write.service.ts:61, 64` `new PrismaClient({ adapter })`; `$extends` w `V2/src`: 0 | `$X.$extends($$$)`; `new PrismaClient($$$)`; `git grep -F '$extends'` |
| V46 | `teamId:null, orgId:null` na sztywno w `:1465-66, 1480-81, 1489-90, 2315-16, 2506-07` (C8) | potwierdzone | 10 par dokładnie w tych liniach | `kind: pair`, `regex: ^(teamId\|orgId): null$` `inside` handler |

### Wpływ na kandydatów (do decyzji na etapie planowania)

Żaden wynik nie obala kandydata ani jego pozycji wprost. Poniższe ustalenia zmieniają zakres albo koszt i są **do decyzji na etapie planowania**:

- **#3 C4(d), V28.** `CreateBookingMeta.noEmail` nie jest martwy, bo przenosi `noEmail` do ścieżki cyklicznej (`RecurringBookingService.ts:60, 102`) i trzech wywołań. Usunięcie pola z typu złamałoby te wywołania (v2 tylko pod `build-api-v2`). Krok (d) powinien obejmować wyłącznie zmienne lokalne handlera. Do decyzji na etapie planowania.
- **#3 C4(c), V25.** Usunięcie `hashedLinkService` dotyczy tylko klucza w kontrakcie `RBS` (i `super`/konstruktora v2). Provider `HashedLinkService` zostaje w obu korzeniach DI, bo czyta go `BookingEventHandlerService`. Do decyzji na etapie planowania.
- **#3 C4(a), V23.** `getBookingDataSchemaForApi` jest martwy już dziś (0 importów wartości), więc da się go usunąć niezależnie od `createBookingForApiV1`. Zmienia to kolejność kroków, nie wartość. Do decyzji na etapie planowania.
- **#1 C2, V13 i V19.** Zakres kroku 3 (`user.*`) obejmuje też `new UserRepository(prisma)` w `loadUsers.ts:128`. Przywołany precedens anulowania nadal ma fallback na globalny `prisma` (`handleCancelBooking.ts:82-92`), więc jest precedensem wstrzykiwania opcjonalnego, a nie pełnego. Do decyzji na etapie planowania.
- **#2 C1, V4.** Mutowalnych `let` jest 15, nie około 13. Koszt rozbicia na fazy z jawnym wejściem i wyjściem jest przez to nieco wyższy. Szacunek L pozostaje. Do decyzji na etapie planowania.
- **Odrzuceni C5, C6, C10 (V32, V35, V44).** Blast radius jawnego typu odpowiedzi jest mniejszy (17 plików, nie 28). Strażnik `satisfies` w C10 musiałby objąć 4 rzutowania w `input.service.ts`, a nie jedno. Unifikacja `EventPayloadType` dotyka też produkcyjnej unii fabryki (`factory/types.ts:80`). Żaden z tych wyników nie podważa powodu odrzucenia, który opiera się na intencjonalności. Do decyzji na etapie planowania.

## Related Research

- `context/changes/booking-analysis/research.md`: źródło dowodów (trace e2e, luki testowe, blast radius, dług).
- `context/map/repo-map.md`: strefy ryzyka 1–2, sprzężenie bliźniaków.

## Open Questions

1. [U] Blast radius parytetu rozszerzeń Prisma dla całego API v2 (`PrismaWriteService` obsługuje wszystkie moduły). Rozstrzyga kolejność kroków w #1.
2. [U] Czy `@calcom/platform-libraries` jest publikowany na npm i ma zewnętrznych konsumentów. Rozstrzyga, czy #3(a–b) dotyka kontraktu publicznego.
3. [U] Czy job `required` jest checkiem branch protection i czy jest merge queue. Brak `gh`.
4. [U] Czy `handleConfirmation` przenosi `evt.assignmentReason` do payloadu legacy i czy w bazach wdrożeń istnieją wiersze `AssignmentReason` (C5).
5. [U] Produkcyjne dane team/RR i deklaracja produktowa (C8).
6. [U] Uzasadnienie `handler.bind(this)` (#26046) oraz los PR #23283 i #23296 (część 4 stacku).
7. [U] Semantyka rollbacku `$transaction` w prismock (brak `node_modules`) i koszt CI type-checku v2.

## Metodologia i pokrycie

- **Priory przeczytane w kontekście głównym:** `booking-analysis/research.md` (całość), `change.md` obu zmian, `repo-map.md`, `evidence/2-discussion.md`, `evidence/1-history.md:103-188`. `context/foundation/lessons.md` nie istnieje.
- **Agenci:** trzech równoległych, read-only, typ `task`. Wszyscy zakończyli pracę, żaden nie zawiódł.
  - **CurrentShape:** obecny kształt, około 10,5 min.
  - **HistoryIntent:** git log/blame/pickaxe na wszystkich anchorach oraz treści PR #23277, #23682, #23156, #27891, #24025, #24944, #16200 pobrane z GitHub. Timeouty: #26046, #5182, #613, #25123.
  - **MigrationFeasibility:** pełny odczyt workflowów CI, konfiguracji vitest/jest/tsconfig i harnessu.
- **Weryfikacja syntezy przy HEAD:** `prisma-write.service.ts:61,64`; `packages/prisma/index.ts:48-83`; `packages/prisma/extensions/*` (modele objęte rozszerzeniami); `regular-booking.service.ts` (całość); `pr.yml:440-475`; `sendPayload.ts:78-109`; grep `assignmentReason` w `RBS` (brak przypisania) i w `packages`/`apps` (twórcy `AssignmentReason`, `confirm.handler.ts`); usunięcie `check-api-v2-breaking-changes.yml` w `ab21c7f805` (`git log --diff-filter=AD`); `platform/libraries/package.json`, `.changeset/config.json`.
- **Rozbieżności między agentami:**
  - C9: CurrentShape (zachowanie) i HistoryIntent (intencja komentarza) są zgodne; komentarz rozjeżdża się z kodem.
  - C10: „migracja zatrzymana” (HistoryIntent) dotyczy tylko schematów `ForApi`; brak duplikacji zod (CurrentShape) dotyczy reszty.
- **Ograniczenia:**
  - Nie uruchamiano buildów, testów ani type-checku (brak `node_modules`).
  - Szacunki rozmiaru (LOC, liczba PR) pochodzą od agenta i są [I].
  - Wiersze „wg agenta” w sekcji 3, nieobjęte listą weryfikacji powyżej, nie zostały przeczytane powtórnie przez syntezę.
