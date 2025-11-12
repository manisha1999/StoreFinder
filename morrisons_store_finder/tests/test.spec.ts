import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('searchbox', { name: 'Postcode or location search' }).fill('BA1 5NF');
  await page.getByRole('searchbox', { name: 'Postcode or location search' }).press('Enter');
  await page.getByRole('button', { name: 'Enter Postcode or location' }).click();
  await expect(page.getByRole('heading', { name: 'Nearby Stores (10)' })).toBeVisible();
});