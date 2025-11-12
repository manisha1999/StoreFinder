import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Use current location' }).click();
  await expect(page.getByRole('button', { name: 'Morrisons Daily Bristol Oldland Common', exact: true })).toBeVisible();
  await expect(page.getByLabel('Find a store')).toContainText('Morrisons Stores');
  await page.getByRole('button', { name: 'Filter search' }).click();
 
  await expect(page.getByRole('button', { name: 'Filter search' })).toBeVisible();
});