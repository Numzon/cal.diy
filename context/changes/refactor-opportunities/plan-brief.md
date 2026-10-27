# Refactor ścieżki tworzenia rezerwacji: martwe API (C4) i dokończenie DI (C2) — Plan Brief

> Full plan: `context/changes/refactor-opportunities/plan.md`
> Research: `context/changes/refactor-opportunities/research.md`

## What & Why

Plan realizuje pozycje #1 (C2) i #3 (C4 a–d) z rankingu refactor opportunities. Najpierw usuwamy martwe API `RegularBookingService` i martwe zależności DI. Potem kończymy migrację DI zadeklarowaną w TODO `RegularBookingService.module.ts:23`.

Motywacją C2 jest ukryte ryzyko, a nie estetyka. W API v2 wstrzykiwany klient Prisma nie ma rozszerzeń (klucz idempotencji, filtr zablokowanych użytkowników). Każde „naturalne” przeniesienie zapytania na `deps` po cichu wyłączyłoby więc te gwarancje, a dzisiejsze testy by tego nie złapały.

## Starting Point

- 10 helperów `HNB/` sięga po globalny `prisma`, a `RBS` woła `deps.prismaClient` 6×.
- W web to ten sam rozszerzony singleton, w v2 osobny klient bez `$extends`.
- Martwe są: `createBookingForApiV1`, `rescheduleBooking` w dwóch serwisach, `IBookingService`, klucz `hashedLinkService` i 4 zmienne lokalne.
- Prismock nie stosuje `$extends`, a w repo nie ma testów idempotencji ani filtra `locked`.

## Desired End State

- `RegularBookingService` ma tylko `createBooking` i `fireBookingEvents`.
- `IBookingServiceDependencies` nie zawiera `prismaClient`, a helpery dostają repozytoria jako wymagane parametry w obu korzeniach DI, bez rzutowania w v2.
- `idempotencyKey` i `locked: false` są jawne w metodach repozytoriów i identyczne w web i v2.
- Testy na prawdziwym Postgresie z testcontainers dowodzą tego w każdym PR (wymagany job `container-test`).

## Key Decisions Made

| Decyzja | Wybór | Dlaczego | Source |
| --- | --- | --- | --- |
| Zakres | C4(a–d) + C2; C1 osobno | C4 zmniejsza kontrakt DI, który C2 rusza; C1 to rozmiar L o warunkowym zysku | Plan |
| Stan końcowy DI | Usunięcie `prismaClient` z `IBookingServiceDependencies` | Zamyka TODO i rozbieżność klientów na ścieżce | Plan |
| Parytet rozszerzeń w v2 | Jawnie w repozytoriach (`IdempotencyKeyService`, `locked: false`) | Rozszerzenia na kliencie v2 zmieniłyby około 64 plików, w tym auth (401 dla zablokowanych) | Plan |
| Algorytm klucza | Rozszerzenie eksportuje `generateIdempotencyKey`, `IdempotencyKeyService` deleguje | `prisma` nie zależy od `lib`; jeden algorytm zamiast dwóch kopii | Plan |
| Wstrzykiwanie | Wymagane parametry, bez fallbacku | Fallback cicho wracałby na globalny klient | Plan |
| Osłona v2 | Lokalny `nest build` + etykieta `ready-for-e2e` | Pokrywa typy i runtime v2 bez zmian CI dla v2 | Plan |
| Testy ryzyka | Charakterystyka, potem testy repo na kliencie bez rozszerzeń; testcontainers | Prawdziwy Postgres per tryb testów, bez stale działającej bazy i bez in-memory | Plan (decyzja użytkownika) |
| CI testów kontenerowych | Nowy job `container-test` w `required` | Jedyna automatyczna osłona ryzyka v2 | Plan |
| `handleSeats/*` | Własne użycia globalnego `prisma` poza zakresem | Osobny szew; anulowania i tak idą przez rozszerzony klient | Plan |
| `noEmail`, provider `HashedLinkService` | Zostają | Mają żywych konsumentów (V28, V25) | Research |
| Tasker C4(e); C3, C5–C8, C10 | Poza zakresem | Decyzje roadmapowe, domenowe lub mała wartość | Research |

## Scope

**In scope:**
- Usunięcie martwego API, interfejsów, schematów `ForApi`, klucza `hashedLinkService` i martwych zmiennych lokalnych.
- Harness `VITEST_MODE=containers` (Postgres 18, `migrate deploy`) i job CI w `required`.
- 10 helperów `HNB/` i 6 wywołań `deps.prismaClient` przeniesionych na repozytoria; 5 nowych zależności RBS w web i v2.

**Out of scope:**
- C1, C9, N1, tasker, `handleSeats` poza przekazaniem repozytorium.
- `$extends` na klientach v2 i usunięcie zbundlowanego klienta z procesu v2.
- `type-check:ci` dla v2 oraz migracja istniejących `*.integration-test.ts` na testcontainers.

## Architecture / Approach

Kolejność kroków:

1. Usuwanie martwego kodu.
2. Harness z testami charakteryzującymi kontrakt rozszerzeń.
3. Migracja C2 od zapytań neutralnych do wrażliwych:
   - istniejący `bookingRepository`;
   - przekazanie przez `handleSeats`;
   - nowe zależności `schedule`/`eventType`, potem `bookingSeat`;
   - `user.*` z jawnym `locked`;
   - transakcja zapisu z jawnym kluczem;
   - na końcu `credential`/`profile` i usunięcie `prismaClient`.

Testy kontenerowe uruchamiają nowe metody na kliencie bez rozszerzeń, czyli w tej samej sytuacji co v2.

## Phases at a Glance

| Faza | Co dostarcza | Główne ryzyko |
| --- | --- | --- |
| 1. C4(a+b) | Usunięte martwe metody, interfejsy, schematy `ForApi` | Typy v2 sprawdza tylko `nest build` |
| 2. C4(c+d) | Kontrakt DI bez `hashedLinkService`, bez martwych zmiennych lokalnych | Rozjazd konstruktora v2 |
| 3. Harness testcontainers | Tryb `containers`, job `required`, charakterystyka rozszerzeń | Node 20 vs testcontainers 12.x; `tar-fs` resolution |
| 4. C2-1 | Zapytania przez istniejący `bookingRepository` | Wierność `select` w nowych metodach |
| 5. C2-2 | `findBookingQuery` przez `handleSeats` | Sygnatury 4 callerów seats |
| 6. C2-3 | `scheduleRepository`, `eventTypeRepository` | Brak `moduleLoader` w `Schedule.ts` |
| 7. C2-4 | `bookingSeatRepository` (web i v2) | Kolizja nazw z natywnym repo v2 |
| 8. C2-5 | `user.*` z jawnym `locked: false` | Utrata filtra w v2 (osłona: testy kontenerowe) |
| 9. C2-6 | Transakcja zapisu z jawnym `idempotencyKey` | Kolejność anuluj → utwórz; prismock a `@unique` |
| 10. C2-7 | `credential`/`profile`; brak `prismaClient` | Pełny rozjazd DI web ↔ v2 |

**Prerequisites:** `yarn install` i `yarn prisma generate` (dziś brak `node_modules`); Docker Desktop lokalnie; uprawnienia do etykiety `ready-for-e2e`; sekrety `DOCKERHUB_*` w forku są opcjonalne.
**Estimated effort:** 10 PR-ów po S–M; fazy 1–2 i 4–5 są małe, 3 i 7–10 średnie.

## Open Risks & Assumptions

- Odstępstwo od zatwierdzonej struktury: `credentialRepository` przeniesione z fazy 9 do 10, bo faza 9 przekroczyłaby limit 10 plików.
- [U] Czy prismock egzekwuje `@unique` na `idempotencyKey`. Jeśli tak, część testów unit może ujawnić przypadkowe duplikaty po fazie 9.
- [U] Czy job `required` jest checkiem branch protection w forku (brak `gh`).
- [I] `migrate deploy` około 595 migracji zajmuje dziesiątki sekund na każde uruchomienie `container-test`.

## Success Criteria (Summary)

- `git grep` nie znajduje `prismaClient` w kontrakcie RBS ani `import prisma` w helperach `HNB/`.
- Web type check, unit testy bookingów, `yarn test:containers` i `nest build` v2 przechodzą, a PR-y z `ready-for-e2e` mają zielone `e2e` i `e2e-api-v2`.
- Testy kontenerowe dowodzą, że na kliencie bez rozszerzeń duplikat ACCEPTED daje `P2002`, anulowanie zeruje klucz, a zablokowani użytkownicy są pomijani.
