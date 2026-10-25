# Artifact 2: Struktura zależności (cal.diy)

Podsumowanie analizy `dependency-cruiser` wykonanej na obszarach z `artifact-1-territory.md`. Czterema krokami: cykle, granice warstw, ryzyka testowalności, graf `features/bookings` ↔ powierzchnie.
Zakres: `apps/web`, `apps/api/v2`, `packages/*`. Żadnego testu nie uruchamiano; w repo nie zmieniono żadnego pliku poza dodaniem plików w `context/map/`.

## Metoda

- Narzędzie: `dependency-cruiser` 18.7.0 (już w repo), istniejący `.dependency-cruiser.cjs` (reguły warstw, `exclude` dla `dist`/`.next`/`.turbo`/`coverage`, `tsPreCompilationDeps: true`).
- Dwa biegi, bo konfiguracja czyta jeden `tsConfig`:
  - web: `apps/web packages` z `apps/web/tsconfig.json`;
  - API v2: `apps/api/v2 packages` z `apps/api/v2/tsconfig.json` (aliasy `@/*` i `@calcom/platform-*`).
- Zmiana pomocnicza: `tsPreCompilationDeps: "specify"`. Zbiór krawędzi jest ten sam, ale importy usuwane przy kompilacji dostają flagę `preCompilationOnly` (rozróżnienie runtime / tylko typy).
- Konfiguracje i skrypty pomocnicze leżały w katalogu tymczasowym poza repo. Nie są częścią artefaktu.
- Baseline (`.dependency-cruiser-known-violations.json`): 722 wpisy: 489 `not-to-unresolvable`, 132 `no-circular`, 75 `app-store-not-to-higher-layers`, 17 `atoms-not-to-trpc-or-web`, 6 `features-not-to-higher-layers`, 3 `lib-not-to-higher-layers`. Skrypt `yarn depcruise` skanuje tylko `apps/web packages`, więc `apps/api/v2` nie jest pokryty.

## 1. Cykle zależności w obszarach aktywnych

Obszary z mapy + partnerzy ze współzmian. Cykle liczone na trzech poziomach: statyczny runtime, runtime z `import()`, wszystko razem (z typami).

**Cykle runtime (realne):**

| Pętla | Gdzie | W baselinie |
|---|---|---|
| `getAllUserBookings.ts` ↔ `get.handler.ts` (2 pliki) | `features/bookings` ↔ `trpc/.../viewer/bookings` | tak |
| `platform/types/bookings`: `get-bookings.output.ts` → `@calcom/platform-types` (własny barrel) → `./bookings` → `./2024-08-13` → `./outputs` (5 plików) | `platform/types` | tak |
| `bookings.service.ts` ↔ `input.service.ts` (2 pliki; stała zod `eventTypeBookingFieldsSchema` w serwisie głównym) | `api/v2/.../platform/bookings` | **nie** (poza zasięgiem skryptu) |

**Cykle tylko z importów typów (nie problem architektoniczny):** 41-węzłowy kłębek wokół `RegularBookingService`, `EventManager`, `getCalendar`, `CalendarSubscriptionService`, `getUserAvailability`, z minimalnymi pętlami 2–3 plików (`dto/types.d.ts` ↔ `RegularBookingService.ts`, `handleCancelBooking` ↔ `cancelAttendeeSeat`, `CalendarEventBuilder` ↔ `BookingRepository` ↔ `IBookingRepository`), plus drobne: `NavigationItem` ↔ `useShouldDisplayNavigationItem` (shell), `CheckedTeamSelect` ↔ `HostEditDialogs` (features/eventtypes), `EventAvailabilityTab` ↔ `…WebWrapper` (modules/event-types), fixture'y Playwright (`testUtils` ↔ `fixtures`).
Najkrótsza pętla przez `getCalendar` (5 plików: `getCalendar` → `CalendarSubscriptionService` -typ→ `CalendarSyncService` → `handleCancelBooking` → `EventManager` → `getCalendar`) jest o jeden `import type` od cyklu runtime.

**Bez żadnego cyklu:** `modules/bookings`, `modules/onboarding`, `packages/prisma`, `features/users`, `features/booking-audit`, `components/booking`, `platform/libraries`.
**Katalogi builda:** 0 własnych krawędzi do `dist`/`.next`. `@calcom/platform-libraries` (bare) i część `platform-*` mają `main` w `./dist/`, więc bez buildu importy się nie rozwiązują (w API v2: 62 pliki; w tym 14 w `platform/bookings`).

## 2. Granice warstw

Reguły z configu: 101 par from→to (82 runtime w produkcji, 7 runtime w testach, 12 tylko typy), **identyczne z baselinem, 0 nowych**. `trpc-not-to-web`: 0. `testing-not-to-web-or-features`: 0.

| Reguła | Pary | Uwagi |
|---|---|---|
| `app-store-not-to-higher-layers` | 75 (65 runtime prod, 6 test, 4 typy) | skupione w `_utils`, `webhooks`, `auth`, `credentials`, `calendar-subscription`; 14 par kończy się w `features/bookings` (7 plików app-store) |
| `atoms-not-to-trpc-or-web` | 17 (11 runtime, 6 typy) | m.in. `BookerPlatformWrapper.tsx` → `apps/web/modules/bookings/components/Booker.tsx` |
| `features-not-to-higher-layers` | 6 (4 runtime, 2 typy) | `getAllUserBookings`, `BookingAttendeesService`, `BookingAttendeesRemoveService` → handlery tRPC (`addGuests`, `get`); `di/…/AvailableSlots` → `slots/util.ts` |
| `lib-not-to-higher-layers` | 3 | moduł holidays + `lib/test/builder.ts` |

**Fundament `platform/types`:** czysty (importuje tylko `platform-constants`, `platform-enums`, siebie i npm). **Żadna reguła w configu go nie obejmuje** (podobnie `platform/libraries` i `apps/api/v2`). Importują go z góry: API v2 (141 plików), `atoms` (64 pliki, tylko typy), web (1, typ). `platform/libraries` nie importuje `apps/web` ani `apps/api`.

**Luki reguł (naruszenia niewidoczne dla configu):**
- `packages/lib/hooks/useLocale.ts` (424 importerów) importuje `apps/web/app/AppRouterI18nProvider` i `CustomI18nProvider`: najniższa warstwa → najwyższa.
- 8 krawędzi `lib` / `app-store` / `features` → `platform/atoms/hooks` (`useIsPlatform`: 23 importerów; w tym `features/bookings/components/Header.tsx`).
- 3 krawędzie testów `app-store/googlecalendar` → `apps/web/playwright/lib/*`.
- 4 importy typów `@calcom/web/modules/event-types/...` w `EventTypePlatformWrapper.tsx` (atoms) nierozwiązane, więc reguła ich nie widzi.

**Rejestry i konfiguracja jako kod (z projektu, nie dług):** `platform/libraries` (fasada, 91 krawędzi do `features`, 0 naruszeń), `features/flags` (27 plików, 1 naruszenie), `app-store/*.generated.*` (11 plików, 0), trasy `apps/web/app` (208 plików, 0 poza `useLocale`).

## 3. Ryzyka testowalności

Zamknięcie przechodnie liczone po krawędziach runtime (z `import()`, bez typów i npm); z pominięciem `vi.mock`, więc to górna granica.

| Obszar | Pliki prod | Testy w obszarze | Prod importowane bezpośrednio przez test | Zamknięcie: mediana / p90 / max |
|---|---|---|---|---|
| `features/bookings` | 193 | 56 | 26% | 22 / 477 / 925 |
| `modules/bookings` | 92 | 16 | 9% | 24 / 412 / 599 |
| `trpc/.../viewer/bookings` | 31 | 6 | 19% | 3 / 738 / 857 |
| `api/v2/platform/bookings` | 46 | 17 (tylko e2e) | 30% | 134 / 1057 / 1192 |
| `features/eventtypes` | 32 | 5 | 19% | 57 / 233 / 239 |
| `modules/event-types` | 38 | 1 | 3% | 150 / 436 / 714 |
| `modules/shell` | 18 | 1 | 6% | 29 / 214 / 249 |
| `modules/onboarding` | 27 | 1 | 7% | 23 / 146 / 253 |
| `packages/prisma` | 21 | 3 | 24% | 1 / 13 / 17 |
| `platform/libraries` | 18 | 0 | 0% | 269 / 838 / 926 |
| `platform/types` | 114 | 0 | 0% | 4 / 30 / 122 |

Główne ryzyka:
- **Rdzeń rezerwacji** (`RegularBookingService.ts` 2690 linii, zamknięcie 890; `handleCancelBooking` 781; `EventManager` 734): testowany scenariuszami (`bookingScenario` + prismock, 73 pliki testowe; 22 testy jednostkowe + 1 integracyjny dosięgają usługi). Kontener DI to singleton modułu, 33 pliki importują globalny `prisma`, 28 dotyka IO, 23 czytają zegar.
- **Globalne mocki ukryte w setupie:** `packages/testing/src/setupVitest.ts` (6 aplikacji płatności, `payment.services.generated`, `crm.apps.generated`, 3 usługi Exchange, zapytania Salesforce), `bookingScenario.ts` (`calendar.services.generated`, `video.adapters.generated`, `@calcom/lib/crypto`), `apps/web/modules/test-setup.ts` (`next-auth/react`, `next/navigation`, `afterEach(vi.resetAllMocks)`). Prismock czyta `packages/prisma/schema.prisma` (ścieżka względna, testy tylko z korzenia repo) i łata znany błąd `webhook.findMany`.
- **Handlery tRPC bookings:** 14 handlerów, 11 importuje globalny `prisma` (nie `ctx.prisma`). Ciężkie: `reportBooking` 783, `confirm` 776, `addGuests` 738, `editLocation` 737, `requestReschedule` 424. `editLocation` ma 0 testów; `addGuests` tylko 1 integracyjny; 7 lekkich handlerów (zamknięcie ≤ 141) bez testów.
- **API v2:** tylko Jest e2e na `AppModule` (zamknięcie `bookings.module.ts` 1192), wymaga bazy i `yarn dev:build`; vitest wyklucza `apps/api/v2/**` i `packages/platform/**`.
- **Globalny stan:** `useBookerStore = createBookerStore()` (singleton, 779 linii, 108 zależnych plików prod, bez testu store'a); `useOnboardingStore = create(persist(…IndexedDB…))` bez testów; `bookingDetailsSheetStore` (fabryka + kontekst) bez testów.
- **Wejścia Next:** 56 plików `apps/web/app` / `pages` dotyka obszarów (zamknięcia do 929; np. `pages/api/book/event.ts`), a pod `apps/web/app` i `pages` jest tylko 14 testów. Server actions w event-types to tylko `revalidatePath`.
- **Prisma:** `index.ts` tworzy `PrismaPg`/`PrismaClient` i 4 rozszerzenia `$extends` przy imporcie; test ma tylko `disallow-undefined-delete-update-many`, trzy pozostałe rozszerzenia bez testów.
- **Środowisko hooków:** `*.test.ts` w `apps/web/modules` działają w projekcie `@calcom/lib` (node, bez jsdom), stąd np. `useSubmitOnboarding.test.ts` mockuje `useState`.

Ranking najbardziej podejrzanych: (1) `editLocation.handler.ts` + `addGuests.handler.ts`, (2) `platform/libraries/index.ts` + `bookings.ts`, (3) `Booker/store.ts` + `Booker.tsx`, (4) API v2 `bookings.module.ts`, (5) `RegularBookingService.ts` (kruchość scenariuszy), (6) `EventTypeWebWrapper.tsx`, (7) `onboarding-store.ts`, (8) `schema.prisma` + rozszerzenia, (9) `Shell.tsx`, (10) `EventManager.ts`.

## 4. Graf: jak `features/bookings` łączy się z tRPC, API v2 i atomami

Pliki: `artifact-2-features-bookings-surfaces.svg`, `.dot` (styl i klastry) i `.depcruise.dot` (surowy `depcruise-fmt -T flat`). Zbiór krawędzi (42) zgodny z wynikiem `depcruise-fmt`.

- **API v2 nie importuje `features/bookings` bezpośrednio (0).** Wchodzi tylko przez `platform/libraries` (`index.ts` 13, `bookings.ts` 3 + 1 typ, `event-types.ts` 1), a fasada re-eksportuje do `lib/`, `services/`, `di/`, `handleCancelBooking`, `getAllUserBookings`, `BookingAccessService`.
- **Web i atomy używają tych samych drzwi UI:** `Booker/` (web 55 + 16 typów, atomy 18 + 5), `types.ts`, `components/`, `lib/`.
- **tRPC używa drzwi serwerowych:** `BookingRepository` (5), `BookingAccessService` (4), `EventManager` (2), `handleCancelBooking` (1) plus `lib/` (8), `repositories/` (3), `services/` (2).
- **Krawędzie w górę (czerwone):** `services` → tRPC (`features-not-to-higher-layers`, 4 + 1 typ), `getAllUserBookings` ↔ tRPC (`no-circular`), `atoms` → `modules/bookings` (`atoms-not-to-trpc-or-web`).
- `platform/types`: 0 krawędzi do `features/bookings`.

Zastrzeżenia grafu: `platform/atoms` jest dodatkowym węzłem poza sześcioma modułami (importuje `features/bookings` bezpośrednio); bare `@calcom/platform-libraries` rozwiązano aliasem na `libraries/index.ts` w tsconfigu pochodnym (zgodnie z `vite.config.js`); krawędzie wewnętrzne `features/bookings` i testy pominięto; z `libraries` pokazano tylko 4 pliki łączące się z `features/bookings` lub tRPC; wzorzec `--collapse` jest stosowany przez `depcruise-fmt` dwukrotnie, więc musi być idempotentny (`[^/.]+(?=/|$)`); `dot` natywny nie był zainstalowany, więc SVG wyrenderowano Graphviz 16.1.0 w wersji WASM.

## Rekomendacje (według kolejności)

1. Dodać do `.dependency-cruiser.cjs` reguły dziś nieobecne: `platform/types` nie importuje wyżej, `platform/libraries` nie importuje `apps/*`, `lib`/`app-store` nie importują `apps/web`. Dołączyć `apps/api/v2` do skryptu `depcruise` (wymaga własnego `tsConfig`).
2. Rozciąć dwa małe cykle runtime: `getAllUserBookings` ↔ `get.handler` oraz `input.service` ↔ `bookings.service` (wynieść stałą zod). Zastąpić import z barrela `@calcom/platform-types` w `get-bookings.output.ts` importem bezpośrednim.
3. Przenieść kontekst i18n z `apps/web/app` do `packages/lib` (usuwa jedyny import w górę z 424 importerami); `useIsPlatform` do `lib`.
4. Wyciągnąć logikę z `addGuests.handler.ts` / `get.handler.ts` do usług w `features/bookings` (usuwa 4 pary naruszeń i cykl).
5. Testy: lekkie handlery tRPC (jednostkowe), store'y Booker i onboarding (jednostkowe z jsdom), rozszerzenia Prisma (integracyjne), DTO `platform/types` (bez mocków, wymaga konfiguracji poza vitest), zmiany w `Booker/`, `event-types`, onboarding i shell naturalnie kończą na e2e (Playwright: `onboarding.e2e.ts` ma 1 test).
6. Zdecydować o polityce importów typów (dziś reguły warstw liczą je z założenia) oraz o dodaniu do repo skryptów odtwarzających grafy.

## Do zweryfikowania

- Rzeczywiste pokrycie (`@vitest/coverage-v8`) vs statyczny zasięg testów z kroku 3.
- Czy handlery bez testów jednostkowych są pokryte przez e2e API v2 / Playwright.
- Czy `exclude-locked-users` i `exclude-pending-payment-teams` są wykonywane w jakimkolwiek teście.
- Nowa zależność `fake-indexeddb` (wymaga zgody, zgodnie z AGENTS.md).
