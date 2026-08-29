import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'http://127.0.0.1:4173/Nisulka-Tools/';
const toolsRoot = path.join(ROOT, 'tools');
const tools = fs.existsSync(toolsRoot)
  ? fs.readdirSync(toolsRoot, { recursive: true })
      .filter(p => typeof p === 'string' && p.endsWith(`${path.sep}index.html`))
      .map(p => p.slice(0, -`${path.sep}index.html`.length).split(path.sep).join('/'))
      .filter(p => p.length > 0)
      .sort()
  : [];
const categoriesRoot = path.join(ROOT, 'categories');
const categories = fs.existsSync(categoriesRoot)
  ? fs.readdirSync(categoriesRoot, { withFileTypes: true })
      .filter(e => e.isDirectory() && fs.existsSync(path.join(categoriesRoot, e.name, 'index.html')))
      .map(e => e.name).sort()
  : [];

async function checkPage(page, url, label) {
  const failedResponses = [];
  const pageErrors = [];
  const onResponse = response => {
    if (response.url().startsWith('http://127.0.0.1:4173/') && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  };
  const onPageError = error => pageErrors.push(error.message);
  page.on('response', onResponse);
  page.on('pageerror', onPageError);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);
  await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
  await expect(page.locator('title')).not.toHaveText('');
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('#site-header-mount')).toBeAttached();
  await expect(page.locator('#site-footer-mount')).toBeAttached();
  expect(await page.locator('#site-header-mount').locator('xpath=./*').count(), `${label}: header did not mount`).toBeGreaterThan(0);
  expect(await page.locator('#site-footer-mount').locator('xpath=./*').count(), `${label}: footer did not mount`).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2), `${label}: horizontal overflow`).toBeFalsy();
  expect(pageErrors, `${label}: browser errors`).toEqual([]);
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

  test('search page loads without console errors', async ({ page }) => {
    await checkPage(page, `${BASE}search.html`, 'search');
    await expect(page.locator('#search-page-input')).toBeVisible();
    await expect(page.locator('#search-results')).toBeAttached();
  });

  test('PWA manifest is valid and scoped', async ({ request }) => {
    const response = await request.get(`${BASE}manifest.webmanifest`);
    expect(response.ok()).toBeTruthy();
    const manifest = await response.json();
    expect(manifest.scope).toBe('/Nisulka-Tools/');
    expect(manifest.start_url).toContain('/Nisulka-Tools/');
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  for (const slug of tools) {
    test(`tool: ${slug}`, async ({ page }) => {
      await checkPage(page, `${BASE}tools/${slug}/`, slug);
    });
  }

  for (const slug of categories) {
    test(`category: ${slug}`, async ({ page }) => {
      await checkPage(page, `${BASE}categories/${slug}/`, slug);
    });
  }
});
