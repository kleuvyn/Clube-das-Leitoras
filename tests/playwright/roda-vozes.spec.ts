import { test, expect } from '@playwright/test';

test('roda de vozes page loads and allows adding a participant', async ({ page }) => {
  await page.goto('/roda-vozes');
  await expect(page).toHaveTitle(/Clube das Leitoras/i);

  const participanteNome = `Vozes Playwright ${Date.now()}`;

  const nomeInput = page.locator('input[placeholder="digite seu nome..."]');
  const entrarButton = page.locator('button', { hasText: 'entrar na roda' });

  await expect(nomeInput).toBeVisible();
  await nomeInput.fill(participanteNome);
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/roda-vozes') && response.request().method() === 'POST'),
    entrarButton.click(),
  ]);

  await expect(page.locator(`text=${participanteNome}`)).toBeVisible({ timeout: 5000 });
});

test('roda de vozes allows selecting a speaker and moving to the next participant', async ({ page }) => {
  await page.goto('/roda-vozes');
  await expect(page).toHaveTitle(/Clube das Leitoras/i);

  const primeiroNome = `Playwright Voz 1 ${Date.now()}`;
  const segundoNome = `Playwright Voz 2 ${Date.now()}`;

  await page.fill('input[placeholder="digite seu nome..."]', primeiroNome);
  await page.click('button:has-text("entrar na roda")');
  await expect(page.locator(`text=${primeiroNome}`)).toBeVisible({ timeout: 5000 });

  await page.fill('input[placeholder="digite seu nome..."]', segundoNome);
  await page.click('button:has-text("entrar na roda")');
  await expect(page.locator(`text=${segundoNome}`)).toBeVisible({ timeout: 5000 });

  const participanteCard = page.locator('div').filter({ hasText: primeiroNome }).first();
  await participanteCard.scrollIntoViewIfNeeded();
  await expect(participanteCard).toBeVisible({ timeout: 10000 });
  await participanteCard.click();
  await expect(page.getByText('falando agora')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(primeiroNome)).toBeVisible({ timeout: 10000 });

  await page.click('button:has-text("próxima pessoa")');
  await expect(page.getByText('falando agora')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(segundoNome)).toBeVisible({ timeout: 10000 });
});
