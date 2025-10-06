import { test, expect } from '@playwright/test';

test.describe('Main Page E2E Tests', () => {
  test('should render main page correctly', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Telegram Bot Tools' })).toBeVisible();

    // Check that the description is visible
    await expect(page.getByText('A collection of web-based tools for managing Telegram bots.')).toBeVisible();

    // Check that both tool cards are present
    await expect(page.getByRole('heading', { name: 'Bot Names' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bot Sender' })).toBeVisible();

    // Check that the navigation links are present
    await expect(page.locator('ul.nav').getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.locator('ul.nav').getByRole('link', { name: 'Bot Names' })).toBeVisible();
    await expect(page.locator('ul.nav').getByRole('link', { name: 'Bot Sender' })).toBeVisible();
  });

  test('should navigate to bot names page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the Bot Names link in navigation
    await page.locator('ul.nav').getByRole('link', { name: 'Bot Names' }).click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Check that we're on the bot names page
    await expect(page.getByRole('heading', { name: 'Bot Rename' })).toBeVisible();

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

    // Check that we're on the bot sender page
    await expect(page.getByRole('heading', { name: 'Send Message as Telegram Bot' })).toBeVisible();

    // Check that the URL has changed
    expect(page.url()).toContain('/bot-sender');
  });

  test('should navigate using main page cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the "Update Bot Names" button in the card
    await page.getByRole('link', { name: 'Update Bot Names' }).click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Check that we're on the bot names page
    await expect(page.getByRole('heading', { name: 'Bot Rename' })).toBeVisible();

    // Go back to main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the "Send Messages" button in the card
    await page.getByRole('link', { name: 'Send Messages' }).click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Check that we're on the bot sender page
    await expect(page.getByRole('heading', { name: 'Send Message as Telegram Bot' })).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is set correctly
    await expect(page).toHaveTitle('Telegram Bot Tools');
  });

  test('should display header with navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that the header is present
    await expect(page.getByRole('banner')).toBeVisible();

    // Check that the logo/title is clickable and links to home
    const logoLink = page.getByRole('link', { name: 'Telegram Bot Tools' });
    await expect(logoLink).toBeVisible();

    // Check that all navigation items are present
    const navItems = ['Home', 'Bot Names', 'Bot Sender'];
    for (const item of navItems) {
      await expect(page.locator('ul.nav').getByRole('link', { name: item })).toBeVisible();
    }
  });
});
