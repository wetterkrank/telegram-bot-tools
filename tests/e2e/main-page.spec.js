import { test, expect } from '@playwright/test';

test.describe('Main Page E2E Tests', () => {
  test('should render main page correctly', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the description is visible
    await expect(page.getByText('A couple of web-based tools for managing Telegram bots.')).toBeVisible();

    // Check that both tool cards are present
    await expect(page.getByRole('heading', { name: 'Bot Names' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bot Sender' })).toBeVisible();
  });

  test('should navigate to bot names page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the Bot Names link in navigation
    await page.locator('ul.nav').getByRole('link', { name: 'Bot Names' }).click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Check that we're on the bot names page
    await expect(page.getByRole('heading', { name: 'Bot Names' })).toBeVisible();

    // Check that the URL has changed
    expect(page.url()).toContain('/bot-names');
  });

  test('should navigate to bot sender page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the Bot Sender link in navigation
    await page.locator('ul.nav').getByRole('link', { name: 'Bot Sender' }).click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Check that the URL has changed
    expect(page.url()).toContain('/bot-sender');
  });
});
