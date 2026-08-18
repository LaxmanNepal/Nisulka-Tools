import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'http://127.0.0.1:4173/Nisulka-Tools/';
const tools = fs.readdirSync(path.join(ROOT, 'tools'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(ROOT, 'tools', entry.name, 'index.html')))
  .map(entry => entry.name)
  .sort();

async function checkPage(page, url, label) {
  const failedResponses = [];
  const pageErrors = [];

  const onResponse = response => {
    const requestUrl = response.url();
    if (requestUrl.startsWith('http://127.0.0.1:4173/') && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${requestUrl}`);
    }
  };
  const onPageError = error => pageErrors.push(error.message);

  page.on('response', onResponse);
  page.on('pageerror', onPageError);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
  await expect(page.locator('title')).not.toHaveText('');
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('#site-header-mount')).toBeAttached();
  await expect(page.locator('#site-footer-mount')).toBeAttached();

  const headerChildren = await page.locator('#site-header-mount').locator('xpath=./*').count();
  const footerChildren = await page.locator('#site-footer-mount').locator('xpath=./*').count();
  expect(headerChildren, `${label}: shared header did not mount`).toBeGreaterThan(0);
  expect(footerChildren, `${label}: shared footer did not mount`).toBeGreaterThan(0);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(horizontalOverflow, `${label}: horizontal overflow detected`).toBeFalsy();

  expect(pageErrors, `${label}: uncaught browser errors`).toEqual([]);
  expect(failedResponses, `${label}: broken local resources`).toEqual([]);

  page.off('response', onResponse);
  page.off('pageerror', onPageError);
}

test.describe('Nisulka Tools browser smoke tests', () => {
  test('homepage loads and renders the shared shell', async ({ page }) => {
    await checkPage(page, BASE, 'homepage');
    await expect(page.locator('#tool-search')).toBeVisible();
    await expect(page.locator('#all-tools')).toBeAttached();
  });

  for (const slug of tools) {
    test(`tool: ${slug}`, async ({ page }) => {
      await checkPage(page, `${BASE}tools/${slug}/`, slug);
    });
  }
});
