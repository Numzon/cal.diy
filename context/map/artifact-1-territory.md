# Artifact 1: Terytorium aktywności (cal.diy)

Podsumowanie analizy historii gita. Okno: **2025-10-25 → 2026-10-19** (pełne 12 miesięcy; repo ma historię od 2021, 16,5 tys. commitów).
Dane: 1986 commitów bez merge'y → **1174** po filtrach. Wszystkie liczby poniżej pochodzą z tych samych filtrów, chyba że zaznaczono inaczej.

## Metoda

- **Jednostka:** commit dotykający folder/plik (commit liczy się raz na folder). Repo używa squash-merge, więc commit ≈ PR.
- **Ścieżki:** zmiany nazw/lokalizacji scalone przez mapowanie wstecz (`git log -M50%`); liczone tylko pliki istniejące na HEAD (`git ls-files`).
- **Odfiltrowany szum plikowy:** lockfile'y, snapshoty, `*.generated.*`, `.env*`, configi, `*.d.ts`, grafiki, `.md/.mdx`, `docs/`, `agents/`, tłumaczenia (`i18n/locales`), migracje `.sql`, `trigger.version.ts`. (Wyjątek: analiza „wspólnego mianownika" zostawia te pliki.)
- **Odfiltrowane commity:** boty (`cal-com-ci`, `github-actions`, `mintlify`), 60× `chore: release vX`, masowe zmiany (formatowanie Biome, lint-sweepy, `Prefix node protocol`, migracja ikon, Tailwind v4, przenosiny `features → web/modules`, wydzielenie `@calcom/i18n`, rebrand/purge `Cal.diy` z 2026-04-15 – 4080 plików). Duże featury zostały.
- **AI:** commit z autorem-agentem lub trailerem `Co-authored-by` (Devin, Claude*, Cursor, Copilot, cubic-dev-ai, CodeRabbit). Przy squashach to górna granica. Łącznie **447/1174 (38%)**, ok. 90% to Devin; tylko 9 commitów ma agenta jako autora.
- **Moduł:** folder na poziomie „realnego obszaru" (np. `packages/features/<x>`, `apps/web/modules/<x>`, `trpc/.../viewer/<x>`, `apps/api/v2/src/platform/<x>`).

## Zastrzeżenia ogólne

- Repo to **fork Cal.diy** (2026-04-15). EE usunięte, `apps/companion` przeniesione do `calcom/companion`. Kod z tych miejsc jest poza rankingami (kampanie billingowe w modułach niedoszacowane).
- Aktywność **spadła ok. 10×** po marcu 2026: 583 commity w Q1'26 → 59 w Q2 → 26 w Q3. Po kwietniu to głównie poprawki od społeczności (35 autorów od maja, AI ≈ 4–8%).
- `gh` nie jest zainstalowane → brak danych o PR-ach zamkniętych bez merge'a i otwartych zgłoszeniach. `origin` = fork `Numzon/cal.diy`.

## TOP 10 folderów/modułów

| # | Moduł | Commity | AI | Funkcja |
|---|---|---|---|---|
| 1 | `packages/features/bookings` | 163 | 50% | rdzeń rezerwacji (tworzenie, anulowanie, potwierdzanie, seats) |
| 2 | `apps/web/modules/bookings` | 94 | 43% | UI rezerwacji (lista, szczegóły, `BookingDetailsSheet`) |
| 3 | `apps/web/playwright` | 88 | 50% | testy E2E i fixtures |
| 4 | `packages/prisma` | 83 | 61% | schemat bazy i typy Zod |
| 5 | `apps/web/modules/event-types` | 61 | 28% | edytor i lista typów wydarzeń |
| 6 | `packages/trpc/.../viewer/bookings` | 57 | 56% | backend tRPC rezerwacji |
| 7 | `apps/web/modules/shell` | 54 | 39% | nawigacja i layout aplikacji |
| 8 | `apps/api/v2/src/platform/bookings` | 53 | 55% | publiczne REST API v2 rezerwacji |
| 9 | `packages/features/eventtypes` | 49 | 51% | logika i repozytorium typów wydarzeń |
| 10 | `apps/web/modules/onboarding` | 47 | 19% | onboarding nowych użytkowników |

## TOP 10 plików

| # | Plik | Commity | AI |
|---|---|---|---|
| 1 | `packages/prisma/schema.prisma` | 63 | 40 |
| 2 | `packages/features/bookings/lib/service/RegularBookingService.ts` | 43 | 20 |
| 3 | `packages/features/bookings/repositories/BookingRepository.ts` | 31 | 18 |
| 4 | `packages/features/eventtypes/repositories/eventTypeRepository.ts` | 24 | 12 |
| 5 | `packages/features/bookings/lib/handleCancelBooking.ts` | 22 | 13 |
| 6 | `packages/features/users/repositories/UserRepository.ts` | 22 | 11 |
| 7 | `apps/web/app/(use-page-wrapper)/settings/(settings-layout)/SettingsLayoutAppDirClient.tsx` | 21 | 10 |
| 8 | `packages/trpc/server/routers/viewer/bookings/confirm.handler.ts` | 20 | 10 |
| 9 | `apps/web/components/booking/BookingListItem.tsx` | 20 | 7 |
| 10 | `apps/web/modules/bookings/views/bookings-single-view.tsx` | 20 | 8 |

Rezerwacje są dominującą domeną (moduły 1, 2, 6, 8 to ta sama domena w różnych warstwach).

## Trend kwartalny

| Kwartał | Commity | AI | Autorzy | `fix:` | `feat:` |
|---|---|---|---|---|---|
| Q4'25 (od 25 X) | 504 | 26% | 56 | 53% | 20% |
| Q1'26 | 583 | **54%** | 89 | 49% | 25% |
| Q2'26 | 59 | 8% | 29 | 66% | 3% |
| Q3'26 | 26 | 4% | 19 | 77% | 8% |
| Q4'26 (do 19 X) | 2 | 0% | 2 | – | – |

Etykiety trendu liczone po **udziale** modułu w aktywności (Q4'25 → Q1'26 → Q2–Q4'26; ostatni okres ma tylko 87 commitów, więc jest szumny):

- **Stałe:** `features/bookings` (13,9 → 14,1 → 12,6%), `playwright`, `event-types` (web), `trpc/bookings`, `features/eventtypes`.
- **Wygasające:** `modules/bookings` (8,5 → 8,2 → 3,4%), `prisma` (→ 1,1%), `shell`, `api/v2/platform/bookings` (0 od marca), `onboarding` (6,0 → 2,7 → 1,1%).
- **Sezonowe (fala wzrost→spadek):** `features/booking-audit`, `features/flags`, `api/v2` (korzeń), `calendar-subscription`, `emails/src`. Rzeczywista sezonowość roczna **niedowodliwa** na 12 miesiącach.
- **Rosnące:** brak w wartościach bezwzględnych; słaby sygnał względny dla `apps/web/app` i `apps/web/pages` (4 i 3 commity).

### Kampanie za skokami

| Kampania | Szczyt | Commity | Główny autor | AI |
|---|---|---|---|---|
| Onboarding v3 | X–XI 2025 | 34 | sean-brydon | 35% |
| Redesign rezerwacji v3 (calendar view, details sheet; revert 14 XI, flaga 19 XI) | XI 2025 | 15 | Eunjae Lee | 53% |
| Routing / assignment reasons / insights | XII 2025 | 23 | Joe Au-Yeung | 61% |
| Refaktor DI + serwisy/repozytoria | XII–I | 38 | Benny Joo, Eunjae Lee, Anik Dhabal Babu | 34% |
| Booking audit log | I 2026 | 26 | Hariom Balhara | 65% |
| Billing: proration/HWM/active-user | I 2026 | 18 | sean-brydon | 72% |
| OAuth 2.0 | I 2026 | 21 | Carina Wollendorfer, Lauris Skraucis | 52% |
| Feature opt-in / tri-state flags | I 2026 | 19 | Eunjae Lee | 84% |
| Tasker / Trigger.dev / deploy API v2 na Vercel | I 2026 | 15 | Morgan | 93% |
| Webhooks (wersjonowanie, producer/consumer) | I 2026 | 38 | Syed Ali Shahbaz | 53% |
| Calendar subscription / cache / overlay | I 2026 | 14 | Volnei Munhoz | 57% |

Skok stycznia (338 commitów) to konwergencja kilku kampanii mocno wspieranych przez agentów.

## Poprawki i reverty (TOP 5 obszarów)

Poprawka = prefiks `fix`/`hotfix`/`bugfix`; revert = `Revert…`/`revert:`/`fix: revert…` (liczony osobno i przypisany do obszaru, którego dotyczył). Średnia projektu: 53% poprawek (615/1155).

| Obszar | Commity | Poprawki | Reverty | Ocena |
|---|---|---|---|---|
| `packages/prisma` | 83 | 17% | 0 | stabilny, zmiany głównie addytywne |
| `packages/features/bookings` | 163 | 42% | 2 (1,2%) | ważny, punkty zapalne: reschedule (13), seated (8), e-maile (8), walidacja blocklisty (6) |
| `apps/web/modules/bookings` | 92 | 49% | 1 (1,1%) | UI po redesignie, stabilizuje się (6 poprawek `BookingDetailsSheet` w 12 dni) |
| `apps/web/playwright` | 84 | 57% | 1 (1,2%) | 24 z 48 poprawek to flaki E2E (tryb pracy CI, nie psucie funkcji) |
| `apps/web/modules/event-types` | 61 | 59% | 0 | 22 z 36 poprawek to polerowanie UI; ok. 10 funkcjonalnych |

Reverty w tych obszarach: redesign rezerwacji (#25172 → `modules/bookings`), hide cal branding user-level (#27626) i revert `assignmentReason` w payloadach webhooków (#27891) → `features/bookings`, poprawa stabilności E2E (#25919) → `playwright`. Para `revert (#27933)` / `Revert "revert (#27933)"` z 13 II dotyczy onboardingu v3 (nie liczona w tych pięciu).
**Klaster powtarzalnych poprawek:** walidacja blocklisty e-mail miała 7 poprawek w ok. 3 miesiące (3 XI → 7 II), rozłożonych na `prisma`, `features/bookings`, `playwright`. Brak obszaru wyraźnie „ciągle psującego się".

## Sprzężenia (współzmiany folderów)

Pominięto 52 commity dotykające ≥10 folderów oraz worki `(root)`. „%" = wspólne commity / commity mniej aktywnego z pary.

| Para | Razem | % |
|---|---|---|
| `features/bookings` ↔ `trpc/.../viewer/bookings` | 23 | 53% |
| `features/bookings` ↔ `prisma` | 18 | 27% |
| `features/bookings` ↔ `api/v2/.../platform/bookings` | 17 | 37% |
| `features/bookings` ↔ `modules/bookings` | 14 | 18% |
| `api/v2/.../platform/bookings` ↔ `platform/types/bookings` | 13 | 81% |
| `features/bookings` ↔ `platform/libraries` | 13 | 48% |
| `features/bookings` ↔ `features/booking-audit` | 11 | 48% |
| `features/bookings` ↔ `features/users` | 10 | 37% |

Trójka: `features/bookings` + `trpc/bookings` + `api/v2/platform/bookings` – 6 commitów (14%).

Wnioski dla TOP 3:
1. **`features/bookings`** – centrum sprzężeń; zmiana rdzenia wychodzi na trzy powierzchnie (tRPC, API v2, atomy przez `platform/libraries`).
2. **`modules/bookings`** – luźno związany z rdzeniem (18%); najsilniejsze pary to jego „bliźniak" `components/booking` (30%) i trasa `app/bookings/[status]`.
3. **`playwright`** – prawie bez sprzężeń (≤ 5 wspólnych commitów z którymkolwiek partnerem); dane nie rozstrzygają, czy to osobne PR-y, czy brak testów E2E dla zmienianych funkcji.

## Wspólny mianownik repo (pliki współzmieniające się z wieloma obszarami)

Liczone z plikami normalnie odfiltrowanymi jako szum, tylko istniejące dziś moduły partnerskie.

| Plik | Commity | Moduły | Zmieniany |
|---|---|---|---|
| `packages/i18n/locales/en/common.json` | 142 | 116 | ręcznie (176 commitów w oknie, 52% z AI); inne 37 języków tłumaczy bot Lingo.dev (14 commitów, ostatni 2026-02-18, żaden nie dotyka `en`) |
| `packages/prisma/schema.prisma` | 40 | 47 | ręcznie; 60/64 commitów z migracją SQL (83 nowe migracje); `zod/` i `enums/` w `.gitignore` |
| `yarn.lock` | 64 | 44 | narzędzie po ręcznej zmianie zależności; 0 botów (brak Renovate/Dependabota) |
| `docs/api-reference/v2/openapi.json` | 43 | 35 | generator (`yarn generate-swagger`), commitowany ręcznie; 43/46 z `apps/api/v2/src`; w `.github` brak kroku regenerującego/sprawdzającego |
| `.env.example`, `turbo.json`, `biome.json` | 15–20 | 15–20 | ręcznie, mały wolumen |

Najszerzej współzmieniane pliki kodu: `RegularBookingService.ts` (38 modułów), `UserRepository.ts` (36), `BookingRepository.ts` (36), `platform/libraries/index.ts` (22), `types/Calendar.d.ts` (19 modułów w 8 commitach). To rdzeń domeny rezerwacji, nie mianownik repo.

## Weryfikacja istnienia plików

- Wszystkie pliki z TOP 10, huby i foldery z tabel par istnieją na HEAD; liczniki zgodne z `git log --follow` (różnice = wyłączone commity masowe). Ścieżki po przeniesieniach scalone (np. `en/common.json` z `apps/web/public/static/locales/en/`).
- **Usunięte obszary:** `features/ee`, `modules/ee`, `api/v2/src/ee/*` – największy surowy partner `features/bookings` (13 commitów) i największa para ogółem (`features/ee` ↔ `modules/ee`, 18) zniknęły.
- **Częściowo żywe:** `features/tasker` (51% plików okna istnieje), `modules/booking-audit` (2 pliki), `modules/feature-flags` (1 plik).
- **Korekta dla `playwright`:** 28 z 78 dotkniętych plików usuniętych; z nimi `playwright` ↔ `modules/settings` = 10 (20%), ↔ `modules/bookings` = 9 (12%) zamiast 5 i 3. Wniosek „słabe sprzężenie" zostaje, ale poprzednie liczby były dolną granicą.
- **Uśpione sprzężenia** (ostatnia realna zmiana marzec–kwiecień 2026): `flags`, `tasker`, `booking-audit`, `platform/libraries`, `api/v2/lib/*`. Aktywne do października 2026: `features/bookings`, `modules/bookings`, `features/calendars`, `modules/calendars`.
