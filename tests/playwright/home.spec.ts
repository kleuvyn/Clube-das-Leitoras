import { test, expect } from '@playwright/test';

test('homepage loads and shows site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Clube das Leitoras/i);
  await expect(page.getByRole('heading', { name: 'Clube das Leitoras' })).toBeVisible();
});
