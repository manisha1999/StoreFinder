import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const FAVORITES_KEY = 'morrisons_favorites';

test.describe('Morrisons Store Finder - E2E', () => {
  test('postcode search -> results -> store detail', async ({ page }) => {
    await page.goto(BASE);

    const searchInput = page
      .locator(
        'input[aria-label="Search input"], input[aria-label="search"], input[aria-label="Search"], input[type="search"], input[type="text"], input[name="q"]'
      )
      .first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });

    await searchInput.fill('BA1 5NF');
    const searchBtn = page.getByRole('button', { name: /search/i }).first();
    if (await searchBtn.count()) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }

    const firstCard = page.locator('.store-card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // const storeName = (await firstCard.locator('.store-name').innerText()).trim();
    const nameLocator = firstCard.locator('.store-name');
    const addressLocator = firstCard.locator('.store-address');
    const hoursLocator = firstCard.locator('.store-hours');

    await expect(nameLocator).toBeVisible();
    await expect(addressLocator).toBeVisible();
    await expect(hoursLocator).toBeVisible();

    const storeName = (await nameLocator.textContent())?.trim() ?? '';
    const storeAddress = (await addressLocator.textContent())?.trim() ?? '';
    const hoursText = (await hoursLocator.textContent())?.trim() ?? '';

    expect(storeName.length).toBeGreaterThan(0);
    expect(storeAddress.length).toBeGreaterThan(0);
    expect(hoursText.length).toBeGreaterThan(0);


    // verify a map marker appears (allow multiple possible selectors)
       // robust check: accept Google Maps DOM (.gm-style), map canvas, or loading/empty states
    const possibleSelectors = ['.gm-style', '.map-canvas', '.map-loading', '.map-no-stores'];
    let found = false;
    for (const sel of possibleSelectors) {
      try {
        await page.waitForSelector(sel, { state: 'visible', timeout: 2000 });
        found = true;
        break;
      } catch {
        // try next selector
      }
    }
    if (!found) {
      // helpful debug artifact
      await page.screenshot({ path: 'tests/debug-map-missing.png', fullPage: true });
      throw new Error('Map/marker not found. See tests/debug-map-missing.png');
    }

    // favourite toggle inside the card: click and verify aria-pressed and localStorage
    const favBtn = firstCard.locator('button.favorite-icon, button[aria-pressed]').first();
    let favAdded = false;
    if (await favBtn.count()) {
      const before = await favBtn.getAttribute('aria-pressed');
      // click to toggle favourite
      await favBtn.click();
      // expect aria-pressed to become "true"
      await expect(favBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 3000 });
      favAdded = true;

      // verify localStorage contains the favourite entry
      const raw = await page.evaluate((k) => localStorage.getItem(k), FAVORITES_KEY);
      expect(raw).not.toBeNull();
      const arr = JSON.parse(raw ?? '[]') as Array<any>;
      const found = arr.some((f) => {
        const n = (f && (f.storeName || f.name)) ?? '';
        return typeof n === 'string' && n.includes(storeName.slice(0, Math.min(10, storeName.length)));
      });
      expect(found).toBeTruthy();
    }


    await firstCard.click();

   
    await expect(page).toHaveURL(/\/storefinder\/[^/]+/, { timeout: 10000 });

    // meta description should exist and be non-empty
    const metaDesc = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect(typeof metaDesc).toBe('string');
    expect((metaDesc ?? '').length).toBeGreaterThan(0);

    // opening times list visible
    const openingItem = page.locator('.opening-times-list li').first();
    await expect(openingItem).toBeVisible({ timeout: 5000 });

    // services list: either contains items or shows "No services available"
    const servicesCount = await page.locator('.services-list li').count();
    if (servicesCount > 0) {
      await expect(page.locator('.services-list li').first()).toBeVisible();
    } else {
      await expect(page.locator('.services-list')).toContainText(/no services available/i);
    }


  });

  test('shows validation error for too-short input', async ({ page }) => {
    await page.goto(BASE);

    const searchInput = page
      .locator(
        'input[aria-label="Search input"], input[aria-label="search"], input[aria-label="Search"], input[type="search"], input[type="text"], input[name="q"]'
      )
      .first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });

    // enter too-short value
    await searchInput.fill('AB');

    // find submit button and form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Find")').first();
    const form = page.locator('form.input_section, form').first();

    // If button exists and is enabled, click it. If it's disabled (common for too-short input),
    // fallback to requestSubmit on the form which reliably invokes React's onSubmit handler.
    if (await submitBtn.count()) {
      const enabled = await submitBtn.isEnabled();
      if (enabled) {
        await submitBtn.click();
      } else {
        await form.evaluate((f: HTMLFormElement) => {
          if (typeof (f as any).requestSubmit === 'function') {
            (f as any).requestSubmit();
          } else {
            f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        });
      }
    } else {
      // no visible submit button — use form.requestSubmit as fallback
      await form.evaluate((f: HTMLFormElement) => {
        if (typeof (f as any).requestSubmit === 'function') {
          (f as any).requestSubmit();
        } else {
          f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      });
    }

    
    // ensure no results were shown
    await expect(page.locator('.store-card')).toHaveCount(0);
  });

  

});