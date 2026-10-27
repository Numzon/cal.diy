# Refactor ścieżki tworzenia rezerwacji: martwe API (C4) i dokończenie DI (C2) — plan implementacji

## Overview

Plan realizuje dwie z trzech refactor opportunities z rankingu w `context/changes/refactor-opportunities/research.md`:

- **C4(a–d):** usunięcie martwego API `RegularBookingService` oraz martwych zależności DI i zmiennych lokalnych;
- **C2:** dokończenie wstrzykiwania zależności na ścieżce tworzenia rezerwacji, aż `prismaClient` zniknie z `IBookingServiceDependencies`.

Po drodze powstaje harness testów integracyjnych na testcontainers (Postgres 18). Pilnuje on jedynego realnego ryzyka C2: w API v2 wstrzykiwany klient Prisma nie ma rozszerzeń `$extends` (klucz idempotencji, filtr zablokowanych użytkowników), więc przeniesienie zapytania na `deps` mogłoby po cichu wyłączyć te gwarancje.

C1 (rozbicie `handler` na fazy) pozostaje osobną zmianą.

## Current State Analysis

- **Martwe API.** Wszystkie te elementy mają 0 wywołań (research V21–V27):
  - `RegularBookingService.createBookingForApiV1` (`RBS:2673-2689`, `@deprecated`, warunek usunięcia spełniony w forku `ab21c7f805`) oraz łańcuch `getBookingDataSchemaForApi.ts` / `bookingCreateBodySchemaForApi`;
  - `rescheduleBooking` w `RBS:2663-2671` i `RecurringBookingService.ts:160-174`;
  - `IBookingService` (członkowie typu `any`, nikt nie typuje względem niego) i `IBookingCreateService`;
  - klucz `deps.hashedLinkService` (`RBS:429`);
  - zmienne lokalne `assignmentReason` (`:1703`, nigdy nieprzypisana), `isNormalBookingOrFirstRecurringSlot` (`:655`), `_crmRecordId` (`:789`), `firstUser` (`:808`).
- **Niepełne DI.**
  - 10 helperów `packages/features/bookings/lib/handleNewBooking/` (dalej `HNB/`) importuje globalny `prisma` (11 wywołań, V12). `RBS` sam woła `deps.prismaClient` 6× (`:829, 1312, 1777, 2141, 2258, 2446`, V15). Dochodzą `new UsersRepository()` (`RBS:1736`), `new BookingRepository(prisma)` (`originalRescheduledBookingUtils.ts:9`) i `new UserRepository(prisma)` (`loadUsers.ts:128`).
  - TODO w `packages/features/bookings/di/RegularBookingService.module.ts:23` deklaruje cel: „remove prisma dependency and instead inject the repositories”.
- **Dwa klienty o różnej semantyce w v2.**
  - Web: `deps.prismaClient` to globalny singleton z 4 rozszerzeniami (`packages/prisma/index.ts:79-83`).
  - v2: to `PrismaWriteService.prisma` bez `$extends` (`apps/api/v2/src/modules/prisma/prisma-write.service.ts:61,64`), rzutowany w `apps/api/v2/src/lib/services/regular-booking.service.ts:32`. Wstrzykiwane w v2 `PrismaBookingRepository`/`PrismaUserRepository` również są bez rozszerzeń.
  - Główny `booking.create` w v2 dostaje dziś klucz idempotencji tylko dlatego, że `createBooking.ts` używa globalnego klienta zbundlowanego w `dist` `platform-libraries` (`packages/platform/libraries/vite.config.js:57-70` nie wyklucza `@calcom/prisma`).
- **Testy.**
  - Unit testy `HNB/` przechodzą przez prawdziwy kontener DI (`HNB/test/getNewBookingHandler.ts:3-13`) na prismock. Prismock to jeden obiekt dla `prisma` i `deps.prismaClient` (`packages/testing/src/lib/__mocks__/prisma.ts:98-101`) i nie stosuje `$extends`.
  - Żaden test nie sprawdza `idempotencyKey`, mapowania P2002 → 409 (`RBS:1821-1824`) ani filtra `exclude-locked-users`. Test „locked user” (`fresh-booking.test.ts:3621`) przechodzi dzięki `filterBlockedUsers`, nie dzięki rozszerzeniu.
- **CI.**
  - `apps/api/v2` nie ma `type-check:ci` ani `lint`. Typy v2 sprawdza tylko `build-api-v2` (`nest build`), uruchamiany pod etykietą `ready-for-e2e`.
  - `testcontainers` nie występuje w repo, a `vitest.workspace.ts` jest martwy w Vitest 4.1.8.
  - `node_modules` nie są zainstalowane.

## Desired End State

- `RegularBookingService` ma wyłącznie metody `createBooking` i `fireBookingEvents`. Brak `IBookingService`, `IBookingCreateService`, `getBookingDataSchemaForApi.ts`, `bookingCreateBodySchemaForApi` i parametru `bookingDataSchemaGetter`.
- `IBookingServiceDependencies` **nie zawiera** `prismaClient` ani `hashedLinkService`. Zawiera natomiast `profileRepository`, `scheduleRepository`, `eventTypeRepository`, `credentialRepository` i `bookingSeatRepository`, wiązane w obu korzeniach DI (web ioctopus, v2 Nest) bez rzutowania `as unknown as PrismaClient` w `regular-booking.service.ts`.
- 10 helperów `HNB/` nie ma importu wartości z `@calcom/prisma`. Każdy dostaje repozytorium jako wymagany parametr. TODO w `RegularBookingService.module.ts:23` jest usunięte.
- Gwarancje rozszerzeń na ścieżce tworzenia są jawne w metodach repozytoriów i identyczne w web i v2:
  - ACCEPTED `booking.create` ustawia `idempotencyKey` tym samym algorytmem co rozszerzenie;
  - anulowanie oryginału przy reschedule zeruje klucz;
  - 3 zapytania `user.find*` filtrują `locked: false`.
- Nowy tryb `VITEST_MODE=containers` uruchamia `*.container-test.ts` na Postgresie 18 z testcontainers. Job `container-test` jest częścią `required` w `pr.yml` i `all-checks.yml`.

**Weryfikacja stanu końcowego:**
- `git grep -n "prismaClient" packages/features/bookings/lib/service/RegularBookingService.ts` → 0.
- `git grep -n "import prisma" -- packages/features/bookings/lib/handleNewBooking ":!*.test.ts" ":!*integration-test.ts" ":!**/test/**"` → 0.
- `yarn type-check:ci --force`, `TZ=UTC yarn test packages/features/bookings`, `yarn test:containers` i `yarn turbo run build --filter=@calcom/api-v2` przechodzą.
- PR-y z etykietą `ready-for-e2e` mają zielone `build-api-v2`, `e2e-api-v2` i `e2e`.

### Key Discoveries:

- **Wariant (A), czyli rozszerzenia na klientach v2, zmieniłby zachowanie około 64 plików v2.** Zablokowani użytkownicy dostaliby 401 w `apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts:198-338` i `next-auth.strategy.ts:28`. To zmiana behawioralna, więc odrzucona na rzecz jawnego parytetu w repozytoriach.
- **Rozszerzenie idempotencji** (`packages/prisma/extensions/booking-idempotency-key.ts:27-50`):
  - przy `create` ze statusem ACCEPTED liczy klucz `uuidv5("${start}.${end}.${user.connect.id}[.${reassignById}]")`;
  - przy `update`/`updateMany` na CANCELLED/REJECTED zeruje go.
  - `IdempotencyKeyService.generate` (`packages/lib/idempotencyKey/idempotencyKeyService.ts:3-19`) jest identyczną kopią. `@calcom/prisma` nie zależy od `@calcom/lib`, więc to `lib` musi delegować do `prisma`, nie odwrotnie.
- **Precedens jawnego klucza:** `BookingRepository.createBookingForManagedEventReassignment` (`BookingRepository.ts:1932,1955`). Precedens transakcji w repozytorium: `managedEventReassignmentTransaction` (`:2008-2037`).
- **Filtr `locked` jest wyłączany przez dowolny klucz `"locked":` w `where`** (`exclude-locked-users.ts:44-49`). Jawne `locked: false` jest więc w web neutralne: rozszerzenie widzi klucz i nic nie dodaje.
- **`BookingRepository.update` się nie nada:** `BookingUpdateData` (`IBookingRepository.ts:22-27`) nie przyjmuje `iCalUID`, `location`, `metadata` ani `references`. Potrzebne są nowe metody.
- **`handleSeats` nie dostaje dziś żadnych deps.** Pole dodane do `NewSeatedBookingObject` (`handleSeats/types.d.ts:26-61`) dociera do 4 callerów `findBookingQuery` przez `RescheduleSeatedBookingObject` (`:63`).
- **`BookingEmailAndSmsTaskService` ma już `bookingRepository`** w `IBookingTaskServiceDependencies` (`tasker/BookingEmailAndSmsTaskService.ts:14-17`).
- **Wiązanie DI:**
  - Web: `bindModuleToClassOnToken` wymaga zgodności kluczy `depsMap` z deps konstruktora (`packages/features/di/di.ts:24-28`), więc `tsc` web łapie rozjazd. `Schedule.ts` eksportuje tylko `scheduleRepositoryModule`, bez `moduleLoader`. `BookingSeatRepository` nie ma modułu ani tokenu.
  - v2: `packages/platform/libraries/repositories.ts:1-15` nie eksportuje `CredentialRepository` ani `BookingSeatRepository`. v2 ma natywne klasy o kolidujących nazwach: `BookingSeatRepository` w `modules/booking-seat` i `CredentialsRepository`, więc wrappery nazywamy `PrismaBookingSeatRepository` i `PrismaCredentialRepository`.
- **Testcontainers i Vitest:**
  - `process.env` ustawione w `globalSetup` trafia do workerów `pool: "forks"` (vitest 4.1.8 `pool.ts:123-127`). `provide`/`inject` to udokumentowany kanał (https://vitest.dev/config/globalsetup).
  - `test.env` nadpisałoby `process.env`, więc nie wolno tam wpisywać `DATABASE_URL`.
  - `@testcontainers/postgresql` 12.x wymaga Node ≥ 22.22, a CI ma Node 20 (`.github/actions/yarn-install/action.yml:16-17`), więc wersja 11.x.

## What We're NOT Doing

- **C1:** rozbicie `handler` na fazy, w tym C9 (podwójny lookup reschedule) i poprawka N1 (nieosiągalny guard `event_type_not_found`). Osobna zmiana.
- **C4(e):** gałąź taskera `isBookingEmailSmsTaskerEnabled` (`RBS:2215, 2527-2544`). To decyzja roadmapowa (trigger.dev).
- **`CreateBookingMeta.noEmail`** zostaje, bo czyta go `RecurringBookingService.ts:60,102` (V28).
- **`HashedLinkService` jako provider** zostaje w obu korzeniach DI, bo czyta go `BookingEventHandlerService`. Znika tylko klucz w kontrakcie `RBS`.
- **Rozszerzenia `$extends` na `PrismaWriteService`/`PrismaReadService`** (wariant A) nie są wprowadzane.
- **Własne użycia globalnego `prisma` w `handleSeats/*`** (8 plików) zostają. Zmieniają się tylko sygnatury potrzebne do przekazania `bookingRepository` do `findBookingQuery`. Anulowania w `lastAttendeeDeleteBooking.ts:57` i `combineTwoSeatedBookings.ts:151` dalej idą przez rozszerzony klient.
- **Wywołania globalnego klienta poza 10 helperami i `RBS`** zostają: statyczne `ProfileRepository.findFirstOrganizationIdForUser` (`loadAndValidateUsers.ts:137`), `getOrgIdFromMemberOrTeamId`, `enrichUsersWithDelegationCredentials`, kontenery `getQualifiedHostsService`, `getUserAvailabilityService`, `getBusyTimesService`. Mają własne granice DI.
- **Usunięcie globalnego klienta zbundlowanego w `dist` `platform-libraries` z procesu v2.**
- **Odrzuceni w researchu:** C3 (atomowość), C5 (`EventPayloadType`), C6 (kontrakt odpowiedzi), C7 (wspólna fabryka DI), C8 (resztki EE), C10 (strażnik DTO v2).
- **Skrypt `type-check:ci` dla `apps/api/v2`** nie powstaje. Osłoną jest lokalny `nest build` i etykieta.
- **Migracja istniejących `*.integration-test.ts` na testcontainers.**

## Implementation Approach

1. **Najpierw C4, bo zmniejsza powierzchnię,** którą C2 i tak rusza: kontrakt 9 zależności w 3 miejscach i martwe metody w klasie. Kroki są czysto usuwające.
2. **Potem harness testcontainers z testami charakteryzującymi** obecny kontrakt rozszerzeń na globalnym, rozszerzonym kliencie. To pierwszy krok wybranej strategii testów: charakterystyka przed przeniesieniem.
3. **C2 idzie od zapytań neutralnych wobec rozszerzeń do wrażliwych:**
   - przez istniejący `bookingRepository`;
   - przez `handleSeats`;
   - nowe zależności `schedule`/`eventType`, potem `bookingSeat`;
   - `user.*` z jawnym `locked: false`;
   - zapis z jawnym `idempotencyKey`;
   - na końcu `credential` i `profile` oraz usunięcie `prismaClient`.
4. **Fazy 8 i 9 dodają testy kontenerowe nowych metod na kliencie bez rozszerzeń,** czyli w tej samej sytuacji, w jakiej działają w v2.
5. **Konwencje:**
   - helpery dostają repozytorium jako wymagany parametr, bez fallbacku na globalny klient;
   - nowe metody repozytoriów stosują `select` i nazewnictwo z `agents/rules/data-repository-methods.md` (bez powtarzania encji, `Include` dla relacji);
   - logika biznesowa zostaje w helperach i serwisie.
6. **Każda faza to jeden PR** (do 10 plików, do 500 linii), osobno odwracalny. Każda dotyka kodu osiągalnego z v2 przez `@calcom/platform-libraries`, więc każda przechodzi lokalnie `nest build` i w CI pod etykietą `ready-for-e2e`.

## Critical Implementation Details

### Timing & lifecycle

- **Kolejność w transakcji (faza 9).** W `createBooking` wyzerowanie `idempotencyKey` anulowanego oryginału musi nastąpić w tej samej transakcji **przed** utworzeniem nowej rezerwacji, tak jak dziś (`createBooking.ts:139-147`). Inaczej reschedule na ten sam slot u tego samego organizatora złamie unikalność klucza.
- **Testy kontenerowe i globalny klient.** `globalSetup` musi ustawić `DATABASE_URL`/`DATABASE_DIRECT_URL` bezwarunkowo, zanim workery zaimportują `@calcom/prisma`, bo `packages/prisma/index.ts:10,48` czyta env przy ładowaniu modułu. Ustawienie musi też nadpisać wartości z `.env` (`vitest.config.mts:6-11`). Ten sam `globalSetup` usuwa `INSIGHTS_DATABASE_URL` i `USE_POOL`. Sam `globalSetup` nie może importować `@calcom/prisma`.

### State sequencing

- **Prismock po fazie 9.** Klucz idempotencji pojawi się też w testach unit, bo jest ustawiany jawnie, a nie przez rozszerzenie. Jeśli prismock egzekwuje `@unique` na `idempotencyKey` [U], testy tworzące dwa razy ACCEPTED dla tego samego organizatora i slotu bez anulowania zaczną zwracać 409. Takie zachowanie odpowiada produkcji. Testy należy poprawić tylko wtedy, gdy zależą od duplikatu przypadkowo, a nie maskować błąd.

### Debug & observability

- **`updateLastActiveAt` (faza 8).** Dziś błąd jest raportowany do Sentry i rzucany dalej (`packages/features/users/users.repository.ts:6-17`). Wywołanie w `RBS` zachowuje `captureException` i rethrow, a metoda repozytorium zostaje czystym `update`.

## Faza 1: C4(a+b) — martwe API serwisu

### Overview

Usunięcie `createBookingForApiV1` z łańcuchem schematów `ForApi` i parametrem `bookingDataSchemaGetter`, metod `rescheduleBooking` w obu serwisach oraz nieużywanych interfejsów. Faza usuwa 3 pliki.

### Changes Required:

#### 1. Martwe metody i parametr handlera

**File**: `packages/features/bookings/lib/service/RegularBookingService.ts`

**Intent**: Usunąć metody `createBookingForApiV1` (`:2673-2689`) i `rescheduleBooking` (`:2663-2671`) oraz `implements IBookingService` (`:2585`, import `:112`). `handler` przestaje przyjmować trzeci parametr i woła `getBookingDataSchema` bezpośrednio (`:490`, `:540`). Znika import typu `BookingDataSchemaGetter` (`:19`).

**Contract**: `handler(input, deps)` ma 2 parametry, a klasa ma metody `createBooking` i `fireBookingEvents`. `createBooking` nie zmienia sygnatury.

#### 2. Typ getter-a schematu

**File**: `packages/features/bookings/lib/dto/types.d.ts`

**Intent**: Usunąć import typu `getBookingDataSchemaForApi` (`:6`) i unię `BookingDataSchemaGetter` (`:13`), która nie ma innych użytkowników.

**Contract**: Brak eksportu `BookingDataSchemaGetter`.

#### 3. Schematy `ForApi`

**File**: `packages/features/bookings/lib/getBookingDataSchemaForApi.ts` (usunięcie pliku), `packages/features/bookings/lib/bookingCreateBodySchema.ts`

**Intent**: Usunąć moduł bez importów wartości (V23) oraz `bookingCreateBodySchemaForApi` (`:108-111`), który czytał tylko ten moduł.

**Contract**: `bookingCreateSchemaLegacyPropsForApi` (`:97-106`) **zostaje**, bo używają go `getBookingData.ts` i `getCustomInputsResponses.ts:6`.

#### 4. Serwis cykliczny i interfejsy

**File**: `packages/features/bookings/lib/service/RecurringBookingService.ts`, `packages/features/bookings/lib/interfaces/IBookingService.ts` (usunięcie), `packages/features/bookings/lib/interfaces/IBookingCreateService.ts` (usunięcie)

**Intent**: Usunąć `RecurringBookingService.rescheduleBooking` (`:160-174`), `implements IBookingService` (`:141`) i import (`:5`), a potem oba pliki interfejsów (0 innych referencji, V24).

**Contract**: `RecurringBookingService` ma metodę `createBooking` bez zmian sygnatury.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- Brak referencji: `git grep -nE "createBookingForApiV1|getBookingDataSchemaForApi|bookingCreateBodySchemaForApi|IBookingService|IBookingCreateService|BookingDataSchemaGetter" -- apps packages` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e`

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 2: C4(c+d) — martwe zależności DI i zmienne lokalne

### Overview

Usunięcie klucza `hashedLinkService` z kontraktu `RBS` w obu korzeniach DI oraz martwych zmiennych lokalnych i importów w `handler`.

### Changes Required:

#### 1. Klucz `hashedLinkService`

**File**: `packages/features/bookings/lib/service/RegularBookingService.ts`, `packages/features/bookings/di/RegularBookingService.module.ts`, `apps/api/v2/src/lib/services/regular-booking.service.ts`

**Intent**: Usunąć pole z `IBookingServiceDependencies` (`RBS:429`, import typu `:41`), wpis `depsMap` (`module.ts:29`, import `:11`) oraz parametr konstruktora i pole `super` w v2 (`:12`, `:23`, `:34`).

**Contract**: `IBookingServiceDependencies` ma 8 pól. Provider `HashedLinkService` w `apps/api/v2/src/lib/modules/regular-booking.module.ts:14,46` i w web `BookingEventHandlerService.module.ts:17` **zostaje**.

#### 2. Martwe zmienne lokalne

**File**: `packages/features/bookings/lib/service/RegularBookingService.ts`

**Intent**: Usunąć zmienne lokalne bez odczytu lub bez przypisania i kod od nich zależny:
- `assignmentReason` (`:1703`), martwy blok `:1757-1765` i spread `:2252`;
- `isNormalBookingOrFirstRecurringSlot` (`:655-657`);
- `_crmRecordId` (`:789`);
- `firstUser` (`:808`);
- osierocone importy `getAssignmentReasonCategory` (`:25`) i `AssignmentReasonEnum` (`:71`).

**Contract**: Brak zmian obserwowalnego zachowania. Webhook i payload nie zmieniają kształtu, bo `assignmentReason` był zawsze `undefined`.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- Brak referencji w RBS: `git grep -nE "hashedLinkService|assignmentReason|isNormalBookingOrFirstRecurringSlot|_crmRecordId|firstUser" packages/features/bookings/lib/service/RegularBookingService.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (w tym `webhook.e2e.ts`)

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 3: Harness testcontainers i charakterystyka kontraktu rozszerzeń

### Overview

Nowy tryb testów `VITEST_MODE=containers` na Postgresie 18 z testcontainers, wymagany job CI oraz testy charakteryzujące, co dziś gwarantują rozszerzenia `booking-idempotency-key` i `exclude-locked-users` na globalnym kliencie.

### Changes Required:

#### 1. Zależności

**File**: `packages/testing/package.json`, `yarn.lock`

**Intent**: Dodać devDependencies `@testcontainers/postgresql` (linia 11.x, zgodna z Node 20 w CI) i `@prisma/adapter-pg` w wersji z `packages/prisma/package.json` (6.16.1).

**Contract**: Brak zmian w root `resolutions`. Jeśli `tar-fs` 2.1.4 z root `resolutions` złamie start kontenera, zakres rozwiązania zawęzić do `testcontainers/tar-fs`.

#### 2. Helpery kontenera

**File**: `packages/testing/src/lib/containers/postgres.ts` (nowy)

**Intent**: Funkcje używane przez `globalSetup` i testy.

**Contract**:
- `startPostgresContainer()`: obraz `postgres:18`, baza o nazwie innej niż `postgres`.
- `applyMigrations(url)`: `prisma migrate deploy --schema packages/prisma/schema.prisma` z `DATABASE_URL` i `DATABASE_DIRECT_URL` = `url`, uruchamiane przez `process.execPath` (bez `yarn.cmd` na Windows). Rzuca przy niezerowym kodzie wyjścia. Nie używać `db push`, bo pomija widoki SQL.
- `createUnextendedPrismaClient(url)`: `new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })` z `@calcom/prisma/client`, tak jak `prisma-write.service.ts:63-66`.

#### 3. Global setup

**File**: `packages/testing/src/containersGlobalSetup.ts` (nowy)

**Intent**: Wystartować kontener raz na uruchomienie, nałożyć migracje, nadpisać env i udostępnić URL przez `project.provide("containerDatabaseUrl", url)`. Teardown zatrzymuje kontener.

**Contract**: Bez importu `@calcom/prisma`. Typowanie przez `declare module "vitest" { interface ProvidedContext { containerDatabaseUrl: string } }`. Kolejność i env opisuje sekcja Critical Implementation Details.

#### 4. Tryb vitest i skrypt

**File**: `vitest.config.mts`, `package.json` (root)

**Intent**:
- Przy `VITEST_MODE=containers`: include `packages/**/*.container-test.ts` i `apps/**/*.container-test.ts`, `globalSetup` z punktu 3, `environment: "node"` oraz exclude `packages/embeds`, jak w trybach integration/timezone.
- Pozostałe tryby bez zmian.
- Root script `test:containers` = `VITEST_MODE=containers TZ=UTC vitest run`.

**Contract**: Pliki `*.container-test.ts` nie pasują do domyślnego globu ani do `*.integration-test.ts`. `DATABASE_URL` nie trafia do `test.env`.

#### 5. Job CI

**File**: `.github/workflows/container-tests.yml` (nowy), `.github/workflows/pr.yml`, `.github/workflows/all-checks.yml`

**Intent**:
- Reusable workflow wzorowany na `unit-tests.yml`: `ubuntu-latest`, checkout, `yarn-install`, `yarn prisma generate`, `yarn test:containers`, własny `timeout-minutes`.
- Logowanie do Docker Hub (`docker/login-action`) tylko wtedy, gdy sekrety `DOCKERHUB_*` są dostępne.
- Job `container-test` w `pr.yml` z tym samym warunkiem co `unit-test` (`pr.yml:310-315`), bez etykiety, dopisany do `required.needs` i do warunku porażki (`:416-473`). To samo w `all-checks.yml` (`required.needs` `:78`).

**Contract**: Job nie zależy od `build`, `setup-db` ani etykiety `ready-for-e2e`.

#### 6. Testy charakteryzujące rozszerzenia

**File**: `packages/prisma/extensions/booking-idempotency-key.container-test.ts` (nowy), `packages/prisma/extensions/exclude-locked-users.container-test.ts` (nowy)

**Intent**: Na globalnym `prisma` (rozszerzonym, wskazującym na kontener) udokumentować zachowanie, które fazy 8–9 muszą odtworzyć jawnie.

**Contract**:
- **Idempotencja:**
  - ACCEPTED `booking.create` z `user.connect` ustawia niepusty `idempotencyKey`;
  - drugi ACCEPTED create dla tego samego organizatora, startu i końca rzuca `P2002`;
  - PENDING create nie ustawia klucza;
  - `update` na CANCELLED zeruje klucz, po czym ten sam slot da się zarezerwować ponownie.
- **Locked:**
  - `user.findFirst`, `findUnique` i `findMany` pomijają użytkownika z `locked: true`;
  - jawne `locked` w `where` wyłącza filtr.
- Dane mają unikalny prefiks na uruchomienie i są sprzątane w `afterEach`.

### Success Criteria:

#### Automated Verification:

- Testy kontenerowe przechodzą lokalnie przy działającym Dockerze: `yarn test:containers`
- Domyślny tryb nie podejmuje plików kontenerowych: `TZ=UTC yarn test packages/prisma/extensions` uruchamia wyłącznie istniejący `disallow-undefined-delete-update-many.test.ts`
- Type check przechodzi: `yarn type-check:ci --force`
- Lint przechodzi: `yarn lint`
- Job `container-test` jest zielony w PR bez etykiety `ready-for-e2e`

#### Manual Verification:

- Job `required` w PR wymienia `container-test` w `needs` i failuje, gdy `container-test` failuje (sprawdzone celowo zepsutą asercją na gałęzi roboczej, potem cofniętą)
- `yarn test:containers` działa na Windows z Docker Desktop

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 4: C2-1 — zapytania przez istniejący `bookingRepository`

### Overview

Przeniesienie zapytań neutralnych wobec rozszerzeń na `deps.bookingRepository`, który jest już wstrzykiwany w obu korzeniach DI.

### Changes Required:

#### 1. Lookup oryginalnej rezerwacji

**File**: `packages/features/bookings/lib/handleNewBooking/originalRescheduledBookingUtils.ts`, `packages/features/bookings/lib/service/RegularBookingService.ts`, `packages/features/bookings/lib/tasker/BookingEmailAndSmsTaskService.ts`

**Intent**: `getOriginalRescheduledBooking` przyjmuje `bookingRepository` jako wymagany parametr zamiast `new BookingRepository(prisma)` (`:7-10`, usunąć `// TODO: Inject.`). Callerzy:
- `RBS:660`;
- `validateRescheduleRestrictions` (`RBS:435`, wołana w `:529`), która dostaje `bookingRepository` jako nowy parametr;
- tasker (`:108`), który przekazuje `this.dependencies.bookingRepository`.

**Contract**: Używa istniejącej metody `BookingRepository.findOriginalRescheduledBooking(uid, seatsEventType)` (`BookingRepository.ts:1170-1217`). Typy `BookingType`/`OriginalRescheduledBooking` nadal wynikają z jej zwrotu.

#### 2. Limit aktywnych rezerwacji bookera

**File**: `packages/features/bookings/lib/handleNewBooking/checkActiveBookingsLimitForBooker.ts`, `packages/features/bookings/repositories/BookingRepository.ts`

**Intent**: Zastąpić `booking.count` (`:45-59`) i `booking.findMany` (`:79-110`) nowymi metodami. Helper dostaje `bookingRepository` z `RBS:604`.

**Contract**: Nowe metody `countAcceptedByEventTypeIdAndAttendeeEmail({ eventTypeId, attendeeEmail, startTimeGte })` i `findManyAcceptedByEventTypeIdAndAttendeeEmailIncludeAttendeeSeat({ eventTypeId, attendeeEmail, startTimeGte, take })` z tymi samymi `where`, `orderBy` i `select` co dziś.

#### 3. Własne zapytania `booking` w RBS

**File**: `packages/features/bookings/lib/service/RegularBookingService.ts`, `packages/features/bookings/repositories/BookingRepository.ts`

**Intent**: Zastąpić `deps.prismaClient` w `:829-839` (pierwsza ACCEPTED rezerwacja na event type i start), `:2141-2148` (aktualizacja `iCalUID`) i `:2446-2459` (lokalizacja, metadata i `references.createMany`) nowymi metodami `BookingRepository`. Catch, który tylko loguje, przy `:2446` zostaje w `RBS`.

**Contract**:
- `findFirstAcceptedByEventTypeIdAndStartTimeIncludeAttendeeEmails({ eventTypeId, startTime })`, `select { userId, attendees { email } }`;
- `updateICalUID({ id, iCalUID })`;
- `updateLocationMetadataAndCreateReferences({ uid, location, metadata, references })` z `createMany`.
- Żadna nie zmienia statusu, więc parytet idempotencji nie dotyczy tych metod.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- Brak globalnego klienta w helperach fazy: `git grep -n "import prisma" -- packages/features/bookings/lib/handleNewBooking/originalRescheduledBookingUtils.ts packages/features/bookings/lib/handleNewBooking/checkActiveBookingsLimitForBooker.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`reschedule`, `booking-pages`)

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 5: C2-2 — `findBookingQuery` przez `handleSeats`

### Overview

`findBookingQuery` dostaje repozytorium przekazywane z `RBS` przez obiekt wejściowy `handleSeats`.

### Changes Required:

#### 1. Metoda i helper

**File**: `packages/features/bookings/lib/handleNewBooking/findBookingQuery.ts`, `packages/features/bookings/repositories/BookingRepository.ts`

**Intent**: Zastąpić `booking.findUnique` (`:6-44`) nową metodą. Helper przyjmuje `bookingRepository` jako wymagany parametr.

**Contract**: `findByIdIncludeUserAndEventTypeSettings(id)` z identycznym `select`. Nazwa `findByIdWithUserAndEventType` (`:2141-2172`) jest zajęta przez inny select.

#### 2. Przekazanie przez `handleSeats`

**File**: `packages/features/bookings/lib/handleSeats/types.d.ts`, `packages/features/bookings/lib/service/RegularBookingService.ts`, `packages/features/bookings/lib/handleSeats/create/createNewSeat.ts`, `packages/features/bookings/lib/handleSeats/reschedule/attendee/attendeeRescheduleSeatedBooking.ts`, `packages/features/bookings/lib/handleSeats/reschedule/owner/combineTwoSeatedBookings.ts`, `packages/features/bookings/lib/handleSeats/reschedule/owner/moveSeatedBookingToNewTimeSlot.ts`

**Intent**: Dodać `bookingRepository` do `NewSeatedBookingObject`. `RBS` (`:1586-1622`) przekazuje `deps.bookingRepository`, a 4 callerzy (`createNewSeat.ts:221`, `attendeeRescheduleSeatedBooking.ts:119`, `combineTwoSeatedBookings.ts:160`, `moveSeatedBookingToNewTimeSlot.ts:123`) podają je do `findBookingQuery`.

**Contract**: `NewSeatedBookingObject.bookingRepository: BookingRepository` (wymagane). `RescheduleSeatedBookingObject` dziedziczy pole. Pozostałe użycia globalnego `prisma` w tych plikach bez zmian.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy seats i bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- `findBookingQuery.ts` nie importuje wartości z `@calcom/prisma`: `git grep -n "import prisma" packages/features/bookings/lib/handleNewBooking/findBookingQuery.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`booking-seats`)

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 6: C2-3 — `scheduleRepository` i `eventTypeRepository`

### Overview

Dwie nowe zależności `RBS` z istniejącymi wrapperami v2. Obejmują `ensureAvailableUsers` oraz `getEventTypesFromDB`/`getEventType`.

### Changes Required:

#### 1. Moduł web dla `ScheduleRepository`

**File**: `packages/features/di/modules/Schedule.ts`

**Intent**: Dodać eksport `moduleLoader { token, loadModule }` obok istniejącego `scheduleRepositoryModule`, zgodnie z `agents/rules/patterns-dependency-injection.md`.

**Contract**: `moduleLoader satisfies ModuleLoader`, token jak dotychczasowy token repozytorium harmonogramu.

#### 2. Dostępność

**File**: `packages/features/bookings/lib/handleNewBooking/ensureAvailableUsers.ts`

**Intent**: Zastąpić `schedule.findUnique` (`:134-162`) istniejącą metodą o identycznym `select` (V17). Helper przyjmuje `scheduleRepository` jako wymagany parametr (callerzy `RBS:902, 917, 936, 962, 1066`).

**Contract**: `ScheduleRepository.findScheduleByIdForBuildDateRanges({ scheduleId })` (`ScheduleRepository.ts:22-55`).

#### 3. Event type

**File**: `packages/features/bookings/lib/handleNewBooking/getEventTypesFromDB.ts`, `packages/features/bookings/lib/handleNewBooking/getEventType.ts`, `packages/features/eventtypes/repositories/eventTypeRepository.ts`

**Intent**: Zastąpić `eventType.findUniqueOrThrow` (`:204-209`) nową metodą zwracającą surowy wiersz. Post-processing (`withSelectedCalendars`, parsowanie zod, `:211-240`) zostaje w helperze. `eventTypeRepository` przechodzi przez `getEventType` (jedyny caller to `RBS:523`).

**Contract**: `EventTypeRepository.findByIdIncludeHostsUsersAndTeamOrThrow({ id })` z `select: getEventTypesFromDBSelect` (`getEventTypesFromDB.ts:17-201`).

#### 4. Wiązanie

**File**: `packages/features/bookings/lib/service/RegularBookingService.ts`, `packages/features/bookings/di/RegularBookingService.module.ts`, `apps/api/v2/src/lib/services/regular-booking.service.ts`, `apps/api/v2/src/lib/modules/regular-booking.module.ts`

**Intent**: Dodać `scheduleRepository` i `eventTypeRepository` do `IBookingServiceDependencies`, do `depsMap` (moduleLoadery `Schedule.ts`, `EventType.ts`), do konstruktora i `super` v2 (`PrismaScheduleRepository`, `PrismaEventTypeRepository`) oraz do providerów `regular-booking.module.ts:26-55`.

**Contract**: Pola typowane klasami bibliotecznymi, tak jak `bookingRepository`.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- Brak `import prisma` w `ensureAvailableUsers.ts` i `getEventTypesFromDB.ts`: `git grep -n "import prisma" packages/features/bookings/lib/handleNewBooking/ensureAvailableUsers.ts packages/features/bookings/lib/handleNewBooking/getEventTypesFromDB.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e`
- Smoke w web: rezerwacja event type z `restrictionScheduleId` przechodzi i odrzuca slot poza harmonogramem

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 7: C2-4 — `bookingSeatRepository`

### Overview

Nowa zależność bez istniejącego modułu web i wrappera v2. Obejmuje `getSeatedBooking` i zapis miejsca w `RBS:1777`.

### Changes Required:

#### 1. Repozytorium

**File**: `packages/features/bookings/repositories/BookingSeatRepository.ts`

**Intent**: Dodać metody dla `bookingSeat.findUnique` z `getSeatedBooking.ts:7-15` i `bookingSeat.create` z `RBS:1777-1797`.

**Contract**:
- `findByReferenceUidIncludeBookingAndAttendee(referenceUid)` zwraca to samo co dzisiejszy `include { booking, attendee }`, ale przez `select`, jeśli konsumenci używają tylko części pól.
- `create({ referenceUid, bookingId, attendeeId, data, metadata })`.

#### 2. Moduł i token web

**File**: `packages/features/bookings/di/BookingSeatRepository.module.ts` (nowy), `packages/features/bookings/di/tokens.ts`

**Intent**: Token `BOOKING_SEAT_REPOSITORY` i `moduleLoader` z zależnością `prismaClient`, wzorowane na `packages/features/di/modules/Booking.ts`.

**Contract**: `moduleLoader satisfies ModuleLoader`. Token trafia do centralnego `DI_TOKENS` przez spread tokenów bookings.

#### 3. Helper i RBS

**File**: `packages/features/bookings/lib/handleNewBooking/getSeatedBooking.ts`, `packages/features/bookings/lib/service/RegularBookingService.ts`

**Intent**: `getSeatedBooking` przyjmuje `bookingSeatRepository` jako wymagany parametr (callerzy `RBS:448` w `validateRescheduleRestrictions`, który dostaje nowy parametr, oraz `RBS:653`). `RBS:1777` używa `deps.bookingSeatRepository.create`. Pole `bookingSeatRepository` trafia do `IBookingServiceDependencies`.

**Contract**: Zwracany kształt `getSeatedBooking` bez zmian dla konsumentów w `RBS`.

#### 4. Wiązanie

**File**: `packages/features/bookings/di/RegularBookingService.module.ts`, `packages/platform/libraries/repositories.ts`, `apps/api/v2/src/lib/repositories/prisma-booking-seat.repository.ts` (nowy), `apps/api/v2/src/lib/services/regular-booking.service.ts`, `apps/api/v2/src/lib/modules/regular-booking.module.ts`

**Intent**:
- Wpis `depsMap`.
- Eksport `BookingSeatRepository` z `platform-libraries`.
- Wrapper Nest `PrismaBookingSeatRepository` wzorowany na `prisma-booking.repository.ts`, z nazwą rozróżnioną od natywnego `modules/booking-seat/booking-seat.repository.ts`.
- Konstruktor i `super` v2, provider w module.

**Contract**: Brak zmian w natywnym `BookingSeatRepository` v2.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów i seats przechodzą: `TZ=UTC yarn test packages/features/bookings`
- Brak `import prisma` w `getSeatedBooking.ts`: `git grep -n "import prisma" packages/features/bookings/lib/handleNewBooking/getSeatedBooking.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` (seated bookings 2024-08-13) i `e2e` (`booking-seats`)

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 8: C2-5 — zapytania `user.*` z jawnym `locked: false`

### Overview

Trzy zapytania `user.find*` przechodzą na `deps.userRepository` z jawnym filtrem `locked: false`. Zapis `lastActiveAt` przechodzi na `UserRepository`. Testy kontenerowe dowodzą parytetu na kliencie bez rozszerzeń.

### Changes Required:

#### 1. Metody `UserRepository`

**File**: `packages/features/users/repositories/UserRepository.ts`

**Intent**: Nowe metody z identycznym `where`/`select` jak dzisiejsze zapytania i jawnym `locked: false` w `where`. Jawny klucz w web wyłącza rozszerzenie bez zmiany wyniku, a w v2 zastępuje brakujące rozszerzenie.

**Contract**:
- `findFirstVerifiedByEmailOrSecondaryEmail({ email })`: z `checkIfBookerEmailIsBlocked.ts:28-53`.
- `findByIdIncludeCalendarCredentials({ id })`: z `loadAndValidateUsers.ts:112-122`.
- `findManyByUsernameListIncludeCredentials({ orgSlug, usernameList })`: z `loadUsers.ts:128-141`, z użyciem `_getWhereClauseForFindingUsersByUsername`. Zamyka TODO `loadUsers.ts:117-120`.
- `updateLastActiveAt({ id })`: `user.update` z `lastActiveAt: new Date()`, bez filtra (rozszerzenie nie dotyczy `update`).

#### 2. Helpery

**File**: `packages/features/bookings/lib/handleNewBooking/checkIfBookerEmailIsBlocked.ts`, `packages/features/bookings/lib/handleNewBooking/loadAndValidateUsers.ts`, `packages/features/bookings/lib/handleNewBooking/loadUsers.ts`, `packages/features/bookings/lib/service/RegularBookingService.ts`

**Intent**:
- Helpery przyjmują `userRepository` jako wymagany parametr. `checkIfBookerEmailIsBlocked` dostaje go z `RBS:581`. `loadAndValidateUsers` dostaje go przez `InputProps` z `RBS:791` i przekazuje do `loadUsers`.
- `RBS:1736-1737` woła `deps.userRepository.updateLastActiveAt` i zachowuje `captureException` z rethrow (patrz Critical Implementation Details).

**Contract**: Brak `new UserRepository(prisma)` i `import prisma` w tych plikach.

#### 3. Sprzątanie `UsersRepository`

**File**: `packages/features/users/users.repository.ts`, `packages/features/users/users.repository.interface.ts`

**Intent**: Usunąć `updateLastActiveAt` z klasy i interfejsu, bo po zmianie ma 0 wywołań. `findUserTeams` zostaje.

**Contract**: `IUsersRepository` traci członka `updateLastActiveAt`.

#### 4. Testy parytetu filtra locked

**File**: `packages/features/users/repositories/UserRepository.container-test.ts` (nowy)

**Intent**: Na `createUnextendedPrismaClient(inject("containerDatabaseUrl"))` utworzyć pary użytkowników (zablokowany i odblokowany, ten sam e-mail lub username) i sprawdzić, że 3 nowe metody find pomijają zablokowanego, a zwracają odblokowanego. To samo wejście na globalnym rozszerzonym kliencie daje identyczny wynik.

**Contract**: Asercje na zwracanych rekordach, nie na argumentach wywołań.

### Success Criteria:

#### Automated Verification:

- Testy kontenerowe przechodzą: `yarn test:containers`
- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów przechodzą, w tym „user is locked” w `fresh-booking.test.ts`: `TZ=UTC yarn test packages/features/bookings`
- Brak globalnego klienta w plikach fazy: `git grep -nE "import prisma|new UserRepository\(prisma\)|UsersRepository" -- packages/features/bookings/lib/handleNewBooking/checkIfBookerEmailIsBlocked.ts packages/features/bookings/lib/handleNewBooking/loadAndValidateUsers.ts packages/features/bookings/lib/handleNewBooking/loadUsers.ts packages/features/bookings/lib/service/RegularBookingService.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e`
- Smoke w web: rezerwacja u organizatora z `locked: true` kończy się błędem `eventTypeUser.notFound`, a u odblokowanego przechodzi

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 9: C2-6 — zapis rezerwacji z jawnym `idempotencyKey`

### Overview

Transakcja „anuluj oryginał + utwórz rezerwację” z `createBooking.ts` przechodzi do `BookingRepository` z jawnym parytetem idempotencji. Algorytm klucza zostaje jeden. (Wyszukanie poświadczeń płatności w `createBooking.ts:130` przechodzi w fazie 10, żeby PR mieścił się w limicie plików.)

### Changes Required:

#### 1. Jeden algorytm klucza

**File**: `packages/prisma/extensions/booking-idempotency-key.ts`, `packages/lib/idempotencyKey/idempotencyKeyService.ts`

**Intent**: Rozszerzenie eksportuje `generateIdempotencyKey`, a `IdempotencyKeyService.generate` deleguje do niego. Kierunek zależności `lib → prisma` jest już obecny, a odwrotny tworzyłby cykl.

**Contract**: Sygnatura `IdempotencyKeyService.generate` bez zmian (jedyny inny caller to `CalendarSyncService.ts:274`). Rozszerzenie zachowuje dotychczasowe zachowanie.

#### 2. Metoda transakcyjna

**File**: `packages/features/bookings/repositories/BookingRepository.ts`

**Intent**: Nowa metoda wykonuje w `this.prismaClient.$transaction`: opcjonalną aktualizację oryginału na CANCELLED z jawnym `idempotencyKey: null`, potem `booking.create`. Przy statusie ACCEPTED create ustawia jawnie `idempotencyKey = IdempotencyKeyService.generate({ startTime, endTime, userId: data.user.connect.id })`. Zwraca rekord z tym samym `include`/`select` co dziś (`user` z `uuid, email, name, timeZone, username, isPlatformManaged`, `attendees`, `payment`, `references`).

**Contract**: `createIncludeUserAttendeesPaymentAndReferences({ data, originalBookingToCancel?: { id, rescheduledBy } })`. Kolejność opisuje sekcja Critical Implementation Details.

#### 3. Helper i RBS

**File**: `packages/features/bookings/lib/handleNewBooking/createBooking.ts`, `packages/features/bookings/lib/service/RegularBookingService.ts`

**Intent**: `saveBooking` (`:96-148`) woła nową metodę zamiast `prisma.$transaction`. `createBooking` przyjmuje `bookingRepository` jako wymagane pole parametru, przekazywane z `RBS:1707`. Mapowanie P2002 → 409 `BookingConflict` w `RBS:1821-1824` pozostaje bez zmian.

**Contract**: Zwrot `{ ...booking, userUuid }` bez zmian.

#### 4. Testy parytetu idempotencji

**File**: `packages/features/bookings/repositories/BookingRepository.container-test.ts` (nowy)

**Intent**: Na kliencie bez rozszerzeń sprawdzić nową metodę:
- ACCEPTED create ustawia klucz równy kluczowi, który dla tego samego wejścia nadaje rozszerzony globalny klient;
- duplikat ACCEPTED rzuca `P2002`;
- PENDING nie ustawia klucza;
- reschedule z `originalBookingToCancel` na ten sam slot u tego samego organizatora przechodzi, a oryginał ma `idempotencyKey = null` i status CANCELLED.

**Contract**: Te same zachowania co w `booking-idempotency-key.container-test.ts` z fazy 3.

### Success Criteria:

#### Automated Verification:

- Testy kontenerowe przechodzą: `yarn test:containers`
- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy bookingów, seats i calendar-sync przechodzą: `TZ=UTC yarn test packages/features`
- `createBooking.ts` nie wywołuje `prisma.$transaction`: `git grep -n "\$transaction" packages/features/bookings/lib/handleNewBooking/createBooking.ts` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`reschedule`, `booking-pages`, `payment`)
- Smoke w web: reschedule rezerwacji na ten sam termin się udaje, a oryginał jest CANCELLED

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej przed kolejną fazą.

---

## Faza 10: C2-7 — `credentialRepository`, `profileRepository` i usunięcie `prismaClient`

### Overview

Ostatnie zapytania na `deps.prismaClient` i globalnym kliencie (poświadczenia płatności, profil organizatora) przechodzą na repozytoria. `prismaClient` znika z kontraktu DI w obu korzeniach.

### Changes Required:

#### 1. Poświadczenia płatności

**File**: `packages/features/credentials/repositories/CredentialRepository.ts`, `packages/features/bookings/lib/handleNewBooking/createBooking.ts`

**Intent**:
- Nowe metody instancyjne zastępują `credential.findFirstOrThrow` w `createBooking.ts:130-137` i `credential.findMany` w `RBS:2258-2277`. Istniejące `findPaymentCredential*` są statyczne i używają globalnego klienta (`:273-325`).
- `createBooking` przyjmuje `credentialRepository` jako wymagane pole parametru.

**Contract**:
- `findFirstByAppIdAndIdOrUserIdOrThrow({ appId, id?, userId })`, `select { id }`.
- `findManyPaymentByIdOrUserIdIncludeApp({ id?, userId })`, `select { key, appId, app { categories, dirName } }`. Wynik nie opuszcza serwisu (zasada o `credential.key` w odpowiedziach API).

#### 2. Profil organizatora

**File**: `packages/features/profile/repositories/ProfileRepository.ts`, `packages/features/profile/repositories/IProfileRepository.ts`

**Intent**: Nowa metoda instancyjna zastępuje `profile.findFirst` w `RBS:1312-1321`. Istniejące `findFirstByUserId` używa `profileSelect` bez `organization`.

**Contract**: `findFirstByUserIdIncludeOrganizationBranding({ userId })`, `select { organizationId, username, organization { hideBranding } }`. Dopisana do `IProfileRepository`.

#### 3. Kontrakt DI bez `prismaClient`

**File**: `packages/features/bookings/lib/service/RegularBookingService.ts`, `packages/features/bookings/di/RegularBookingService.module.ts`, `packages/platform/libraries/repositories.ts`, `apps/api/v2/src/lib/repositories/prisma-credential.repository.ts` (nowy), `apps/api/v2/src/lib/services/regular-booking.service.ts`, `apps/api/v2/src/lib/modules/regular-booking.module.ts`

**Intent**:
- `RBS` używa `deps.credentialRepository` (`:2258`) i `deps.profileRepository` (`:1312`) oraz przekazuje `credentialRepository` do `createBooking`.
- `IBookingServiceDependencies` traci `prismaClient` i zyskuje `credentialRepository` oraz `profileRepository`.
- Web: `depsMap` bez `prismaClient` i bez TODO (`:23-24`), z moduleLoaderami `Credential.ts` i `users/di/Profile.module.ts`.
- v2: eksport `CredentialRepository` z `platform-libraries`; wrapper `PrismaCredentialRepository`; konstruktor bez `PrismaWriteService` i bez rzutowania `as unknown as PrismaClient` (`:32`), z `PrismaCredentialRepository` i `PrismaProfileRepository` (precedens `booking-cancel.service.ts:15`); providery w module.

**Contract**: Pola `IBookingServiceDependencies`: `checkBookingAndDurationLimitsService`, `bookingRepository`, `luckyUserService`, `userRepository`, `bookingEmailAndSmsTasker`, `bookingEventHandler`, `webhookProducer`, `scheduleRepository`, `eventTypeRepository`, `bookingSeatRepository`, `credentialRepository`, `profileRepository`. `PrismaWriteService` zostaje providerem modułu, bo potrzebują go wrappery repozytoriów.

### Success Criteria:

#### Automated Verification:

- Type check przechodzi: `yarn type-check:ci --force`
- Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- Testy features przechodzą: `TZ=UTC yarn test packages/features`
- Testy kontenerowe przechodzą: `yarn test:containers`
- Brak `prismaClient` w RBS: `git grep -n "prismaClient" packages/features/bookings/lib/service/RegularBookingService.ts packages/features/bookings/di/RegularBookingService.module.ts apps/api/v2/src/lib/services/regular-booking.service.ts` zwraca 0 trafień
- Brak globalnego klienta w helperach `HNB/`: `git grep -n "import prisma" -- packages/features/bookings/lib/handleNewBooking ":!*.test.ts" ":!*integration-test.ts" ":!**/test/**"` zwraca 0 trafień
- Lint przechodzi: `yarn lint`

#### Manual Verification:

- PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`payment`, `booking-pages`)
- Smoke w web: płatna rezerwacja (Stripe test) i rezerwacja u organizatora z profilem organizacji przechodzą

**Implementation Note**: Po przejściu weryfikacji automatycznej zatrzymaj się na potwierdzenie weryfikacji ręcznej. To ostatnia faza.

---

## Testing Strategy

### Unit Tests:

- Istniejące unit testy `HNB/` i `handleSeats/test` przez `getNewBookingHandler` (prawdziwy kontener DI na prismock) pokrywają każdy krok przeniesienia zapytań neutralnych. Nie powstają nowe unit testy przekazywania parametrów (zakaz testowania wiązań i echa mocków).
- Po fazie 9 ten sam zestaw sprawdza, czy jawny klucz idempotencji nie łamie istniejących scenariuszy.

### Integration Tests:

- **Testcontainers (`*.container-test.ts`, `yarn test:containers`):**
  - faza 3: charakterystyka rozszerzeń na rozszerzonym globalnym kliencie;
  - faza 8: parytet filtra locked dla 3 nowych metod `UserRepository` na kliencie bez rozszerzeń;
  - faza 9: parytet idempotencji (klucz, duplikat → `P2002`, zerowanie przy anulowaniu, reschedule na ten sam slot) dla nowej metody `BookingRepository` na kliencie bez rozszerzeń.
- **Istniejące `*.integration-test.ts`** (`createNewSeat`, `spam-booking`) bez zmian, pod etykietą.
- **e2e v2** (`e2e-api-v2`, 04-15 i 08-13) to jedyny test faktycznego runtime v2. Uruchamiany pod etykietą `ready-for-e2e` w każdej fazie.

### Manual Testing Steps:

1. Każdy PR uruchomić z etykietą `ready-for-e2e` i potwierdzić zielone `build-api-v2`, `e2e-api-v2` i `e2e`.
2. Smoke w web po fazach 6, 8, 9 i 10 zgodnie z kryteriami ręcznymi tych faz.
3. Po fazie 3 celowo zepsuć asercję w teście kontenerowym na gałęzi roboczej i potwierdzić, że `required` failuje, a potem cofnąć zmianę.

## Performance Considerations

- **Zapytania:** zmiany są neutralne wydajnościowo. Te same zapytania z identycznym `select` przechodzą przez repozytoria, a `createMany` dla references zostaje.
- **v2 po fazie 10:** `RegularBookingService` nie dostaje już `PrismaWriteService` bezpośrednio, ale globalny klient zbundlowany w `dist` dalej istnieje w procesie (poza zakresem).
- **Job `container-test`:** około 595 migracji `migrate deploy` raz na uruchomienie [I: dziesiątki sekund], z osobnym `timeout-minutes`.

## Migration Notes

- **Bez migracji schematu i danych.** Klucz idempotencji ma ten sam algorytm i te same wartości, a w web rozszerzenie liczy go ponownie z tego samego wejścia.
- **Rollback:** każda faza to osobny PR, odwracalny przez revert. Fazy 4–10 zależą od kolejności tylko przez kontrakt `IBookingServiceDependencies`, więc revert późniejszej fazy nie wymaga revertu wcześniejszych.

## References

- Research: `context/changes/refactor-opportunities/research.md` (ranking sekcja 4, kandydaci C2 i C4, weryfikacja V1–V46)
- Analiza źródłowa: `context/changes/booking-analysis/research.md`
- Precedens wstrzykiwania repozytoriów: `a7a8c78494` (anulowanie), `packages/features/bookings/lib/handleCancelBooking.ts:81-92`
- Precedens jawnego klucza idempotencji i transakcji w repozytorium: `packages/features/bookings/repositories/BookingRepository.ts:1932,1955,2008-2037`
- Rozszerzenia: `packages/prisma/index.ts:67-83`, `packages/prisma/extensions/booking-idempotency-key.ts`, `packages/prisma/extensions/exclude-locked-users.ts`
- Klient v2: `apps/api/v2/src/modules/prisma/prisma-write.service.ts:55-66`, `apps/api/v2/src/lib/services/regular-booking.service.ts`
- Reguły: `agents/rules/patterns-dependency-injection.md`, `agents/rules/data-repository-methods.md`
- Vitest globalSetup: https://vitest.dev/config/globalsetup; testcontainers Postgres: https://node.testcontainers.org/modules/postgresql/

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: C4(a+b) — martwe API serwisu

#### Automated

- [ ] 1.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 1.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 1.3 Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- [ ] 1.4 Brak referencji: `git grep -nE "createBookingForApiV1|getBookingDataSchemaForApi|bookingCreateBodySchemaForApi|IBookingService|IBookingCreateService|BookingDataSchemaGetter" -- apps packages` zwraca 0 trafień
- [ ] 1.5 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 1.6 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e`

### Phase 2: C4(c+d) — martwe zależności DI i zmienne lokalne

#### Automated

- [ ] 2.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 2.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 2.3 Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- [ ] 2.4 Brak referencji w RBS: `git grep -nE "hashedLinkService|assignmentReason|isNormalBookingOrFirstRecurringSlot|_crmRecordId|firstUser" packages/features/bookings/lib/service/RegularBookingService.ts` zwraca 0 trafień
- [ ] 2.5 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 2.6 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (w tym `webhook.e2e.ts`)

### Phase 3: Harness testcontainers i charakterystyka kontraktu rozszerzeń

#### Automated

- [ ] 3.1 Testy kontenerowe przechodzą lokalnie przy działającym Dockerze: `yarn test:containers`
- [ ] 3.2 Domyślny tryb nie podejmuje plików kontenerowych: `TZ=UTC yarn test packages/prisma/extensions` uruchamia wyłącznie istniejący `disallow-undefined-delete-update-many.test.ts`
- [ ] 3.3 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 3.4 Lint przechodzi: `yarn lint`
- [ ] 3.5 Job `container-test` jest zielony w PR bez etykiety `ready-for-e2e`

#### Manual

- [ ] 3.6 Job `required` w PR wymienia `container-test` w `needs` i failuje, gdy `container-test` failuje (sprawdzone celowo zepsutą asercją na gałęzi roboczej, potem cofniętą)
- [ ] 3.7 `yarn test:containers` działa na Windows z Docker Desktop

### Phase 4: C2-1 — zapytania przez istniejący `bookingRepository`

#### Automated

- [ ] 4.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 4.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 4.3 Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- [ ] 4.4 Brak globalnego klienta w helperach fazy: `git grep -n "import prisma" -- packages/features/bookings/lib/handleNewBooking/originalRescheduledBookingUtils.ts packages/features/bookings/lib/handleNewBooking/checkActiveBookingsLimitForBooker.ts` zwraca 0 trafień
- [ ] 4.5 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 4.6 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`reschedule`, `booking-pages`)

### Phase 5: C2-2 — `findBookingQuery` przez `handleSeats`

#### Automated

- [ ] 5.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 5.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 5.3 Testy seats i bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- [ ] 5.4 `findBookingQuery.ts` nie importuje wartości z `@calcom/prisma`: `git grep -n "import prisma" packages/features/bookings/lib/handleNewBooking/findBookingQuery.ts` zwraca 0 trafień
- [ ] 5.5 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 5.6 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`booking-seats`)

### Phase 6: C2-3 — `scheduleRepository` i `eventTypeRepository`

#### Automated

- [ ] 6.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 6.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 6.3 Testy bookingów przechodzą: `TZ=UTC yarn test packages/features/bookings`
- [ ] 6.4 Brak `import prisma` w `ensureAvailableUsers.ts` i `getEventTypesFromDB.ts`: `git grep -n "import prisma" packages/features/bookings/lib/handleNewBooking/ensureAvailableUsers.ts packages/features/bookings/lib/handleNewBooking/getEventTypesFromDB.ts` zwraca 0 trafień
- [ ] 6.5 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 6.6 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e`
- [ ] 6.7 Smoke w web: rezerwacja event type z `restrictionScheduleId` przechodzi i odrzuca slot poza harmonogramem

### Phase 7: C2-4 — `bookingSeatRepository`

#### Automated

- [ ] 7.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 7.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 7.3 Testy bookingów i seats przechodzą: `TZ=UTC yarn test packages/features/bookings`
- [ ] 7.4 Brak `import prisma` w `getSeatedBooking.ts`: `git grep -n "import prisma" packages/features/bookings/lib/handleNewBooking/getSeatedBooking.ts` zwraca 0 trafień
- [ ] 7.5 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 7.6 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` (seated bookings 2024-08-13) i `e2e` (`booking-seats`)

### Phase 8: C2-5 — zapytania `user.*` z jawnym `locked: false`

#### Automated

- [ ] 8.1 Testy kontenerowe przechodzą: `yarn test:containers`
- [ ] 8.2 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 8.3 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 8.4 Testy bookingów przechodzą, w tym „user is locked” w `fresh-booking.test.ts`: `TZ=UTC yarn test packages/features/bookings`
- [ ] 8.5 Brak globalnego klienta w plikach fazy: `git grep -nE "import prisma|new UserRepository\(prisma\)|UsersRepository" -- packages/features/bookings/lib/handleNewBooking/checkIfBookerEmailIsBlocked.ts packages/features/bookings/lib/handleNewBooking/loadAndValidateUsers.ts packages/features/bookings/lib/handleNewBooking/loadUsers.ts packages/features/bookings/lib/service/RegularBookingService.ts` zwraca 0 trafień
- [ ] 8.6 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 8.7 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e`
- [ ] 8.8 Smoke w web: rezerwacja u organizatora z `locked: true` kończy się błędem `eventTypeUser.notFound`, a u odblokowanego przechodzi

### Phase 9: C2-6 — zapis rezerwacji z jawnym `idempotencyKey`

#### Automated

- [ ] 9.1 Testy kontenerowe przechodzą: `yarn test:containers`
- [ ] 9.2 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 9.3 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 9.4 Testy bookingów, seats i calendar-sync przechodzą: `TZ=UTC yarn test packages/features`
- [ ] 9.5 `createBooking.ts` nie wywołuje `prisma.$transaction`: `git grep -n "\$transaction" packages/features/bookings/lib/handleNewBooking/createBooking.ts` zwraca 0 trafień
- [ ] 9.6 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 9.7 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`reschedule`, `booking-pages`, `payment`)
- [ ] 9.8 Smoke w web: reschedule rezerwacji na ten sam termin się udaje, a oryginał jest CANCELLED

### Phase 10: C2-7 — `credentialRepository`, `profileRepository` i usunięcie `prismaClient`

#### Automated

- [ ] 10.1 Type check przechodzi: `yarn type-check:ci --force`
- [ ] 10.2 Build API v2 przechodzi: `yarn turbo run build --filter=@calcom/api-v2`
- [ ] 10.3 Testy features przechodzą: `TZ=UTC yarn test packages/features`
- [ ] 10.4 Testy kontenerowe przechodzą: `yarn test:containers`
- [ ] 10.5 Brak `prismaClient` w RBS: `git grep -n "prismaClient" packages/features/bookings/lib/service/RegularBookingService.ts packages/features/bookings/di/RegularBookingService.module.ts apps/api/v2/src/lib/services/regular-booking.service.ts` zwraca 0 trafień
- [ ] 10.6 Brak globalnego klienta w helperach `HNB/`: `git grep -n "import prisma" -- packages/features/bookings/lib/handleNewBooking ":!*.test.ts" ":!*integration-test.ts" ":!**/test/**"` zwraca 0 trafień
- [ ] 10.7 Lint przechodzi: `yarn lint`

#### Manual

- [ ] 10.8 PR z etykietą `ready-for-e2e` ma zielone `build-api-v2`, `e2e-api-v2` i `e2e` (`payment`, `booking-pages`)
- [ ] 10.9 Smoke w web: płatna rezerwacja (Stripe test) i rezerwacja u organizatora z profilem organizacji przechodzą
