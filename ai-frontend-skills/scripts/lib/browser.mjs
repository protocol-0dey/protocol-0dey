import { chromium } from 'playwright-core';

/**
 * Launches Chromium. Set CHROME_PATH to use an already installed Chrome/Chromium,
 * otherwise Playwright's own browser is used (install it with `npx playwright-core install chromium`).
 */
export async function launchBrowser() {
  const executablePath = process.env.CHROME_PATH || undefined;
  try {
    return await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  } catch (error) {
    console.error(
      'Could not start a browser. Set CHROME_PATH to a Chrome/Chromium binary, or run: npx playwright-core install chromium',
    );
    throw error;
  }
}

/** Opens a page and waits for it to settle, tolerating pages that never become fully idle. */
export async function openPage(context, url) {
  const page = await context.newPage();
  const problems = { consoleErrors: [], failedRequests: [] };
  page.on('pageerror', (error) => problems.consoleErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    problems.failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? 'failed'})`);
  });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
  await page.waitForTimeout(300);
  return { page, problems };
}
