# Morrisons Store Finder — Notes for interviewer

This file explains what I built, design and implementation decisions, where to look in the codebase, how to run the app and the most important points to evaluate.

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
  - `src/Components/StoreCache/StoreCache.tsx`
  - `src/Components/Favourites/Favourites.tsx`
- SEO / metadata
  - `StoreDetailPage`, `Home`, `SearchFeature`, `StoreCard` (use `react-helmet` blocks)
- CI & Lighthouse
  - `bitbucket-pipelines.yml`
<!-- - Tests
  - `tests/` (Playwright), `src/*.test.tsx` (Jest) -->





## Environment / CI variables
- `VERCEL_TOKEN` — for deploy step (set in CI)


## Known limitations / TODOs
- Some optional native packages were avoided in CI (`npm install --no-optional`) to prevent kernel/module calls on hosted runners.
- If using React 19, some third‑party libs may still declare peer deps for React <= 18; I used `react-helmet` (sync) to avoid `react-helmet-async` peer issues.

# Steps to run and check
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
   on chrome extension

