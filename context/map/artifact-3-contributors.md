# Artifact 3: Kluczowi kontrybutorzy w obszarach priorytetowych (cal.diy)

Okno: **2025-10-25 → 2026-10-19**. Obszary pochodzą z listy „top 5 obszarów do kontaktu z kontrybutorami" (na bazie `artifact-1-territory.md` i `artifact-2-structure.md`).

**Wniosek:** wiedza o tych obszarach jest w głowach ludzi, którzy przestali commitować w lutym–marcu 2026. Po forku (15.04.2026) w tych obszarach działa tylko garstka osób, głównie z pojedynczymi poprawkami.

## Metoda

- **Dane:** `git log -M50%` od 2025-10-25. Zmiany nazw ścieżek zmapowane wstecz (od najnowszego commita do najstarszego), liczone tylko pliki istniejące na HEAD.
- **Obszary (ścieżki):**
  1. `packages/features/bookings`
  2. `packages/trpc/server/routers/viewer/bookings`
  3. `packages/platform/libraries`, `packages/platform/types/bookings`, `apps/api/v2/src/platform/bookings`
  4. `apps/web/modules/bookings`, `apps/web/components/booking`
  5. `apps/web/modules/onboarding`
- **Wycięte 71 z 1985 commitów** (zostało 1914):
  - 48 botów i automatyzacji: Devin ×18, `cal-com-ci` ×13, mintlify ×9, github-actions ×3, Mendral AI ×2, CodeRabbit ×1, Calcom Bot ×1, commit z domeny lingo.dev ×1.
  - 23 commity masowe (rebrand `Cal.diy`, Tailwind v4, formatowanie Biome, przenosiny `features → web/modules`, migracja ikon, wydzielenie `@calcom/i18n`, usunięcie `apps/companion` i podobne).
  - W historii nie ma commitów, których autorem byłby Claude, Copilot ani Codex. Jedyny agent-autor w danych to Devin. Commity człowieka z agentem jako współautorem zostają (36% zachowanych commitów ma agenta w trailerze `Co-authored-by`).
- **Scalone tożsamości:** Hariom Balhara (2 adresy), Alex van Andel = emrysal (ten sam adres), Peer Richelsen, Pedro Castro, Rajiv Sahal, Volnei Munhoz, Eesh Midha, Anshuman = Anshumancanrock, Abhishek = abhix4.
- **Założenie do potwierdzenia:** 5 commitów autora „cal.com" z adresu `morgan@cal.com` przypisano do Morgana (API v2, pulowanie Prisma).
- **Skala zespołu:** do marca 2026 ok. 15 osób rdzenia (28–57 autorów miesięcznie). Od maja 5–18 autorów miesięcznie, głównie jednorazowych. W październiku 2026 są 3 autorzy. Przy takiej skali skupienie wiedzy w jednej osobie to norma. Ryzykiem jest brak aktywnych osób, a nie koncentracja.
- **Ograniczenia:** brak commitów nie dowodzi niedostępności. Tematy ustalono ręcznie z tytułów commitów. „Może wesprzeć" to wniosek z historii, nie deklaracja. `gh` nie jest zainstalowane, więc brak danych o reviewach i zgłoszeniach.

## 1. `features/bookings` (167 commitów, 37 osób)

| Osoba | Commity | Ostatni w obszarze | Tematy | Może wesprzeć w |
|---|---|---|---|---|
| Hariom Balhara | 21 | 2026-03-09 | audyt rezerwacji (DI, integracja z cancel, confirm, create, reschedule, no-show, impersonacja, `actionSource`); cache kalendarza; prefill URL | audit log, cykl życia rezerwacji |
| Benny Joo | 17 | 2026-03-04 | refaktor warstw (repozytoria do `features`, usuwanie importów tRPC/web); poprawki round-robin i OOO; wyciek credentiali do adapterów wideo | DI i granice warstw, RR |
| Anik Dhabal Babu | 17 | 2026-02-06 | poprawki: seats (e-maile, SMS, URL spotkania), reschedule (RR niepotwierdzony, zmiana hosta), fallback Google Meet i lokalizacji, walidacja blocklisty e-mail, flaki testów | seated i reschedule, e-maile, regresje |
| Rajiv Sahal | 13 | 2026-03-18 | seated i org admin (cancel, reschedule); embed i atomy Booker; ukrywanie brandingu | seated, Booker/embed |
| Joe Au-Yeung | 13 | 2026-02-12 | powody przypisania i routing trace; raporty błędnych przypisań; blocklista domen; payload workflow | routing i assignment |
| Udit Takkar | 12 | 2026-03-19 | distributed tracing; niestandardowa lokalizacja hosta; konfiguracja powodu anulowania; wydajność | tracing, wydajność |
| Morgan | 11 | 2026-02-03 | Tasker (powiadomienia e-mail/SMS); `CalendarEventBuilder`; `hostSubsetIds` w RR; billing platformy | tasker, e-maile |

**Aktywni po forku w tym obszarze:**
- Anirban Singha (3 commity, do 2026-08-01): tiebreaker w RR, sprzątanie Bookera, `getLocationByType`.
- Kartik Saini (2026-10-18): overlay calendar v2 i troubleshooter v2.
- shafi-VM (2026-07-09): zwrot płatności za miejsca przy anulowaniu płatnego seated.
- Jimmy He: `handlePayment` w `createNewSeat`.
- Bryan Varela: webhook Daily na `BookingRepository`.
- Chayan Das: 404 dla nieistniejącej rezerwacji.
- Romit: usuwał testy integracyjne, więc wie, co skasowano.

## 2. Handlery tRPC `viewer/bookings` (60 commitów, 22 osoby)

| Osoba | Commity | Ostatni | Tematy |
|---|---|---|---|
| Hariom Balhara | 12 (20%) | 2026-03-09 | audyt w `confirm`, `requestReschedule`, `addGuests`, `editLocation`; `BookingHistoryViewerService` |
| Joe Au-Yeung | 6 | 2026-02-12 | raporty błędnych przypisań, routing trace, poświadczenia przy `requestReschedule` |
| Syed Ali Shahbaz | 4 | 2026-02-17 | reasignacja managed event; `icalSequence`; revert `assignmentReason` w webhookach (#27891) |
| Keith Williams | 4 | 2026-02-11 | wydajność zapytań (`UNION ALL`, raw SQL); testy `get.handler` |
| Anik Dhabal Babu | 4 | 2026-02-02 | poprawki `confirm.handler`, no-show dla adminów |
| Eunjae Lee | 3 | 2025-12-15 | lista rezerwacji (`get.handler`, schemat, filtry) |

`editLocation` i `addGuests`, czyli najsłabiej przetestowane handlery z artefaktu 2, mają w historii głównie wkład Hariom (audyt) oraz Volnei i Rajiva (po 1–2 commity). Nie ma tu autora „od testów".

**Po forku:** Anirban Singha (2), Bandhan Majumder (1, opis typu wydarzenia w mailu potwierdzającym), Romit (2, usuwanie testów).

## 3. `platform/libraries` + API v2 bookings (100 commitów, 18 osób)

| Osoba | Commity | Ostatni | Tematy |
|---|---|---|---|
| Morgan | 22 | 2026-02-05 | kontrolery 2024-04-15 i 2024-08-13; `bookingRequiresAuthentication`; `rrHostSubsetIds`; deploy API v2 na Vercel; Tasker i Trigger.dev; kontroler OAuth2; billing platformy |
| Hariom Balhara | 17 | 2026-03-09 | przekazywanie uuid z API v2, audyt, `actionSource` |
| Rajiv Sahal | 11 | 2026-03-18 | endpointy attendees (POST/GET/DELETE), update lokalizacji, atom Troubleshooter, reguły importów |
| Benny Joo | 8 | 2026-02-10 | przebudowa fasady `libraries` po przenosinach repozytoriów do `features` |
| Lauris Skraucis | 8 | 2026-02-09 | PBAC w API v2, OAuth 2.0 dla atomów, poprawki wyjść cancel i reschedule |
| Volnei Munhoz | 6 | 2026-01-01 | autoryzacja endpointów reasignacji; zależności, TypeScript, Vitest |
| Pedro Castro | 5 | 2026-04-14 | perf output service; zależności |

**Po forku: nikt.** Jedyny ślad to commit z literówkami (Mandar Joshi). To najpilniejszy obszar do kontaktu: wiedza o `platform/libraries` i API v2 skupia się w Morganie, Rajivie i Laurisie, a żaden nie commitował po 2026-03-18.

## 4. Web: `modules/bookings` + `components/booking` (125 commitów, 33 osoby)

| Osoba | Commity | Ostatni | Tematy |
|---|---|---|---|
| Eunjae Lee | 23 (18%) | 2026-02-13 | redesign v3 (widok kalendarza, `BookingDetailsSheet`, revert 14.11 i flaga 19.11); feature opt-in; filtry i segmenty |
| Anik Dhabal Babu | 10 | 2026-02-03 | poprawki widoków (awaiting payment, seated, locale weryfikacji) |
| Benny Joo | 9 | 2026-02-09 | przenosiny komponentów i hooków do `apps/web/modules`; usuwanie importów tRPC |
| Udit Takkar | 8 | 2026-02-24 | lokalizacja hosta; powód anulowania |
| Rajiv Sahal | 7 | 2026-02-25 | embed i atomy; usuwanie cykli z `CalendarView` |
| Hariom Balhara | 7 | 2026-02-17 | historia rezerwacji w szufladzie; zdarzenia SDK dla embeda; test `usePrefetch` |
| Joe Au-Yeung | 6 | 2026-02-12 | badge powodu przypisania, dialog routing trace |

**Po forku:** Kartik Saini (overlay calendar v2 i troubleshooter v2, `Booker.tsx`, `AvailableTimes.tsx`, `useCalendars.ts`, 2026-10-18). To jedyna osoba aktywnie rozwijająca UI Bookera po wygaśnięciu rdzenia. Anirban Singha i Romit wnieśli po jednym commicie.

## 5. Onboarding (50 commitów, 12 osób)

| Osoba | Commity | Ostatni | Tematy |
|---|---|---|---|
| sean-brydon | 35 (70%) | 2026-02-13 | cały onboarding v3: osobisty, team, organizacja; store z IndexedDB; `getting-started`; przepływ upgrade'u organizacji; zdarzenia PostHog; włączenie globalne i para revertów 13.02 |
| Alex van Andel (emrysal) | 3 | 2026-01-22 | wyciągnięcie funkcji wyboru harmonogramu; revert przeprojektowania tworzenia teamu (#26733) |
| Benny Joo | 2 | 2026-01-29 | przenosiny hooków i store'ów |

Reszta (Volnei, Eunjae, Rajiv, Hariom, Carina, Keith, Pasquale, Jagadish) ma po 1–2 commity. **Po forku** jest jeden commit: Cael Shepley, poprawka przycisku „Continue" (2026-04-29).

70% u jednej osoby jest tu normalne przy tej skali zespołu. Problem polega na tym, że sean-brydon nie commitował od 2026-02-23. Powód revertów #27933 zna prawdopodobnie tylko on lub Keith Williams (revert w `onboarding/personal`, 2026-01-12).

## Z kim rozmawiać

| Priorytet | Osoba | Dlaczego |
|---|---|---|
| 1 | Hariom Balhara | obecny w obszarach 1–4; audyt rezerwacji przenika core, tRPC i API v2 |
| 2 | Morgan | jedyna osoba z szeroką wiedzą o API v2, Taskerze i wdrożeniu na Vercel |
| 3 | Eunjae Lee | redesign rezerwacji v3 i opt-in flag |
| 4 | Anik Dhabal Babu, Rajiv Sahal | regresje w seated/reschedule/e-mailach (Anik); embed, atomy i API v2 (Rajiv) |
| 5 | sean-brydon | jedyny właściciel onboardingu v3 |
| Aktywni dziś | Kartik Saini, Anirban Singha | jedyni z commitami w obszarach 1, 2 i 4 w ostatnich 5 miesiącach |

Przed kontaktem sprawdź, kto z rdzenia jeszcze współpracuje. Historia gita pokazuje tylko, kto commitował.
