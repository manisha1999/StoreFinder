import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
 
  await page.goto('http://localhost:3000/');
  await page.getByRole('searchbox', { name: 'Postcode or location search' }).click();
  await page.getByRole('searchbox', { name: 'Postcode or location search' }).fill('BA15NF');
  await page.getByRole('button', { name: 'Enter Postcode or location' }).click();
  await page.getByText('Search StoresFilter searchMorrisons StoresMorrisons Daily').click();
  await page.getByText('Search Results for BA15NFBath').click();
  await page.goto('http://localhost:3000/BA15NF');
  await page.getByRole('searchbox', { name: 'Postcode or location search' }).click();
  

});


