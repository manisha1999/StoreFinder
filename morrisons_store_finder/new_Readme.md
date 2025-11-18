# Morrisons Store Finder — Notes for interviewer

This file explains what I built, design and implementation decisions, where to look in the codebase, how to run the app and the most important points to evaluate.

## What this project is
A single‑page React + TypeScript app that implements a Morrisons‑style Store Finder:
- Search by postcode or by browser geolocation
- Results as list + interactive map (desktop) / tabbed (mobile)
- Store detail pages with opening times, services and save‑to‑favourites
- Dynamic page titles & meta tags per route / interaction using `react-helmet`
- Local caching of search results and (short) store detail caching
- CI pipeline with optional Lighthouse audit and Vercel deploy steps
- Unit/E2E tests using Jest + Playwright (examples included)

## High‑level architecture
- React + TypeScript (strict mode)
- Routing: react-router (client side)
- State & data:
  - Custom hooks in `src/Hooks/` (useStoreSearch, useStoreDetails, useGeoCode, etc.)
  - Local persistence: favourites in `localStorage` (`Favourites` service)
  - Cache helper logic in `StoreCache` / utils (TTL behaviour for lists/details)
- Metadata: `react-helmet` used in components to set title/meta synchronously
- UI: componentised under `src/Components/` (Layout, Home, SearchFeature, Screen2, StoreCard, StoreDetails, Footer, NavBar)
- Map: component `StoreMap` (markers link to store detail route)
- CI: `bitbucket-pipelines.yml` (build → deploy → Lighthouse audit)
- Tests: Playwright tests in `tests/` and some Jest tests

## Key files to review
- Entry & app shell
  - `src/index.tsx`, `src/App.tsx`, `src/Components/Layout/Layout.tsx`
- Search & results
  - `src/Components/SearchFeature/SearchFeature.tsx`
  - `src/Hooks/useStoreSearch.tsx`
  - `src/Components/Screen2/Screen2.tsx`
- Store presentation & details
  - `src/Components/StoreCard/StoreCard.tsx`
  - `src/Components/StoreDetails/StoreDetailPage.tsx`
  - `src/Hooks/useStoreDetails.tsx`
- Caching & persistence
  - `src/Components/StoreCache/StoreCache.tsx` (or `src/Utils/cache.ts` if present)
  - `src/Components/Favourites/Favourites.tsx`
- SEO / metadata
  - `StoreDetailPage`, `Home`, `SearchFeature`, `Favourites`, `StoreCard` (use `react-helmet` blocks)
- CI & Lighthouse
  - `bitbucket-pipelines.yml`
- Tests
  - `tests/` (Playwright), `src/*.test.tsx` (Jest)

## How to run locally
1. Install
   ```
   cd morrisons_store_finder
   npm install
   ```
2. Start dev server
   ```
   npm start
   # open http://localhost:3000
   ```
3. Build
   ```
   npm run build
   ```
4. Run tests
   ```
   npm test
   npx playwright install
   npx playwright test
   ```

## Environment / CI variables
- `VERCEL_TOKEN` — for deploy step (set in CI)
- `SITE_URL` — used by Lighthouse audit step
- API base URL (if using a remote API) should be provided via `.env` / `REACT_APP_API_BASE_URL` (do not commit secrets)

## What to look for in evaluation
- Type safety: check `src/Hooks` and model types used in components
- API validation: runtime checks around external data
- Metadata: dynamic titles/meta in the components listed above
- Accessibility: semantic HTML, ARIA roles, keyboard interactions (StoreCard keyboard, focus management)
- Performance: image sizes, code splitting, Lighthouse report (CI artifact or run locally)
- Testing: unit tests for hooks/components and an E2E scenario (postcode → results → open detail)
- UX edge cases: geolocation fallback, empty states, error messages, favourites persistence

## Known limitations / TODOs
- Some optional native packages were avoided in CI (`npm install --no-optional`) to prevent kernel/module calls on hosted runners.
- If using React 19, some third‑party libs may still declare peer deps for React <= 18; I used `react-helmet` (sync) to avoid `react-helmet-async` peer issues.
- Lighthouse target scores require production optimisations (image compression, server headers). CI includes an audit step but production tuning may be needed to reach ≥90.

## Quick demo script for interviewer
1. Start app: `npm start`
2. Search a postcode (example: `BA1 5NF`) — observe:
   - URL updates
   - title/description change
   - results list + map markers
3. Click a store card — observe:
   - navigation to `/store/:id`
   - dynamic title/meta updated
4. Add a favourite — check localStorage or open Favourites page
5. Run Lighthouse locally:
   ```
   npm run build
   npx http-server ./build -p 8080 &
   npx lighthouse http://localhost:8080 --output html --output-path=./lighthouse-report.html --chrome-flags="--headless --no-sandbox"
   ```

## Contact notes for the interviewer
- I can walk through the custom hooks and explain caching strategy and metadata choices in 10 minutes.
- I can add stricter runtime validation (Zod), more tests, or implement server-side rendering for improved SEO on request.

Thank you for reviewing the submission — I can adapt any part of the app on request.
```// filepath: /Users/manisha/store_finder/morrisons_store_finder/README_FOR_INTERVIEWER.md
# Morrisons Store Finder — Notes for interviewer

This file explains what I built, design and implementation decisions, where to look in the codebase, how to run the app and the most important points to evaluate.

## What this project is
A single‑page React + TypeScript app that implements a Morrisons‑style Store Finder:
- Search by postcode or by browser geolocation
- Results as list + interactive map (desktop) / tabbed (mobile)
- Store detail pages with opening times, services and save‑to‑favourites
- Dynamic page titles & meta tags per route / interaction using `react-helmet`
- Local caching of search results and (short) store detail caching
- CI pipeline with optional Lighthouse audit and Vercel deploy steps
- Unit/E2E tests using Jest + Playwright (examples included)

## High‑level architecture
- React + TypeScript (strict mode)
- Routing: react-router (client side)
- State & data:
  - Custom hooks in `src/Hooks/` (useStoreSearch, useStoreDetails, useGeoCode, etc.)
  - Local persistence: favourites in `localStorage` (`Favourites` service)
  - Cache helper logic in `StoreCache` / utils (TTL behaviour for lists/details)
- Metadata: `react-helmet` used in components to set title/meta synchronously
- UI: componentised under `src/Components/` (Layout, Home, SearchFeature, Screen2, StoreCard, StoreDetails, Footer, NavBar)
- Map: component `StoreMap` (markers link to store detail route)
- CI: `bitbucket-pipelines.yml` (build → deploy → Lighthouse audit)
- Tests: Playwright tests in `tests/` and some Jest tests

## Key files to review
- Entry & app shell
  - `src/index.tsx`, `src/App.tsx`, `src/Components/Layout/Layout.tsx`
- Search & results
  - `src/Components/SearchFeature/SearchFeature.tsx`
  - `src/Hooks/useStoreSearch.tsx`
  - `src/Components/Screen2/Screen2.tsx`
- Store presentation & details
  - `src/Components/StoreCard/StoreCard.tsx`
  - `src/Components/StoreDetails/StoreDetailPage.tsx`
  - `src/Hooks/useStoreDetails.tsx`
- Caching & persistence
  - `src/Components/StoreCache/StoreCache.tsx` (or `src/Utils/cache.ts` if present)
  - `src/Components/Favourites/Favourites.tsx`
- SEO / metadata
  - `StoreDetailPage`, `Home`, `SearchFeature`, `Favourites`, `StoreCard` (use `react-helmet` blocks)
- CI & Lighthouse
  - `bitbucket-pipelines.yml`
- Tests
  - `tests/` (Playwright), `src/*.test.tsx` (Jest)

## How to run locally
1. Install
   ```
   cd morrisons_store_finder
   npm install
   ```
2. Start dev server
   ```
   npm start
   # open http://localhost:3000
   ```
3. Build
   ```
   npm run build
   ```
4. Run tests
   ```
   npm test
   npx playwright install
   npx playwright test
   ```

## Environment / CI variables
- `VERCEL_TOKEN` — for deploy step (set in CI)
- `SITE_URL` — used by Lighthouse audit step
- API base URL (if using a remote API) should be provided via `.env` / `REACT_APP_API_BASE_URL` (do not commit secrets)

## What to look for in evaluation
- Type safety: check `src/Hooks` and model types used in components
- API validation: runtime checks around external data
- Metadata: dynamic titles/meta in the components listed above
- Accessibility: semantic HTML, ARIA roles, keyboard interactions (StoreCard keyboard, focus management)
- Performance: image sizes, code splitting, Lighthouse report (CI artifact or run locally)
- Testing: unit tests for hooks/components and an E2E scenario (postcode → results → open detail)
- UX edge cases: geolocation fallback, empty states, error messages, favourites persistence

## Known limitations / TODOs
- Some optional native packages were avoided in CI (`npm install --no-optional`) to prevent kernel/module calls on hosted runners.
- If using React 19, some third‑party libs may still declare peer deps for React <= 18; I used `react-helmet` (sync) to avoid `react-helmet-async` peer issues.
- Lighthouse target scores require production optimisations (image compression, server headers). CI includes an audit step but production tuning may be needed to reach ≥90.

## Quick demo script for interviewer
1. Start app: `npm start`
2. Search a postcode (example: `BA1 5NF`) — observe:
   - URL updates
   - title/description change
   - results list + map markers
3. Click a store card — observe:
   - navigation to `/store/:id`
   - dynamic title/meta updated
4. Add a favourite — check localStorage or open Favourites page
5. Run Lighthouse locally:
   ```
   npm run build
   npx http-server ./build -p 8080 &
   npx lighthouse http://localhost:8080 --output html --output-path=./lighthouse-report.html --chrome-flags="--headless --no-sandbox"
   ```

## Contact notes for the interviewer
- I can walk through the custom hooks and explain caching strategy and metadata choices in 10 minutes.
- I can add stricter runtime validation (Zod), more tests, or implement server-side rendering for improved SEO on request.

Thank you for reviewing the submission — I can adapt any part of the app on request.