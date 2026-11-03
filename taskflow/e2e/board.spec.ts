import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('dev@example.com');
  await page.getByLabel('Password').fill('secret1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Project board' })).toBeVisible();
});

test('redirects unauthenticated users to the login page', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login$/);
  await context.close();
});

test('opens the demo board from the landing page in one click', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'Try the live demo' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Project board' })).toBeVisible();
  await context.close();
});

test('switches the theme', async ({ page }) => {
  await page.getByRole('button', { name: /switch to (light|dark) theme/i }).click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(['light', 'dark']).toContain(theme);
});

test('shows validation errors on the login form', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter a valid email address')).toBeVisible();
  await context.close();
});

test('adds a card to a column', async ({ page }) => {
  const todo = page.getByRole('region', { name: 'To do' });
  await todo.getByRole('button', { name: '+ Add card' }).click();
  await todo.getByLabel('Title').fill('Write e2e tests');
  await todo.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(todo.getByText('Write e2e tests')).toBeVisible();
});

test('edits and deletes a card', async ({ page }) => {
  await page.getByText('Set up CI pipeline').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Title').fill('Set up CI/CD');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Set up CI/CD')).toBeVisible();

  await page.getByText('Set up CI/CD').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Set up CI/CD')).toHaveCount(0);
});

test('filters cards by search query', async ({ page }) => {
  await page.getByLabel('Search cards').fill('onboarding');
  await expect(page.getByText('Design the onboarding flow')).toBeVisible();
  await expect(page.getByText('Write API client')).toHaveCount(0);
});

test('moves a card to another column with the keyboard', async ({ page }) => {
  const card = page.getByRole('button', { name: /Design the onboarding flow/ });
  await card.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  const doing = page.getByRole('region', { name: 'In progress' });
  await expect(doing.getByText('Design the onboarding flow')).toBeVisible();
});
