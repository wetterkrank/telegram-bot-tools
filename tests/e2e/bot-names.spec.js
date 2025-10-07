import { test, expect } from '@playwright/test';

test.describe('BotNames E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock bot token validation
    await page.route('**/api.telegram.org/bot*/getMe', async (route) => {
      const mockResponse = {
        ok: true,
        result: {
          id: 123456789,
          is_bot: true,
          first_name: 'Test Bot',
          username: 'testbot',
          can_join_groups: true,
          can_read_all_group_messages: false,
          supports_inline_queries: false
        }
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });
  });

  test('should handle complete successful bot names update flow', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api.telegram.org/bot*/setMyName', async (route) => {
      const mockResponse = {
        ok: true,
        result: true
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // Navigate to page and verify initial state
    await page.goto('/bot-names');
    await page.waitForLoadState('networkidle');

    // Check that submit button is disabled by default
    const submitButton = page.getByRole('button', { name: 'Update' });
    await expect(submitButton).toBeDisabled();

    // Fill in bot token
    await page.getByLabel('Bot Token').fill('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');

    // Fill in CSV data
    const csvTextarea = page.getByLabel('CSV Data');
    await csvTextarea.fill('en,Test Bot\nes,Bot de Prueba\nde,Test Bot');

    // Check that submit button is now enabled
    await expect(submitButton).toBeEnabled();

    // Submit the form
    await submitButton.click();

    // Wait for API request to complete
    await page.waitForResponse('**/api.telegram.org/bot*/setMyName');

    // Check that success messages appear in log
    await expect(page.getByText("Updating bot's name...")).toBeVisible();
    await expect(page.getByText('en: OK')).toBeVisible();
    await expect(page.getByText('es: OK')).toBeVisible();
    await expect(page.getByText('de: OK')).toBeVisible();

    // Check that bot token is preserved (CSV field is not cleared in BotNames)
    await expect(page.getByLabel('Bot Token')).toHaveValue('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
  });

  test('should handle API error and show error in log', async ({ page }) => {
    // Mock error response
    await page.route('**/api.telegram.org/bot*/setMyName', async (route) => {
      const mockErrorResponse = {
        ok: false,
        description: 'Unauthorized'
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockErrorResponse)
      });
    });

    await page.goto('/bot-names');
    await page.waitForLoadState('networkidle');

    // Fill in bot token
    await page.getByLabel('Bot Token').fill('invalid-token');

    // Fill in CSV data
    const csvTextarea = page.getByLabel('CSV Data');
    await csvTextarea.fill('en,Test Bot\nes,Bot de Prueba\nde,Test Bot');

    // Submit the form
    await page.getByRole('button', { name: 'Update' }).click();

    // Wait for the request to complete
    await page.waitForResponse('**/api.telegram.org/bot*/setMyName');

    // Check that error messages appear in log
    await expect(page.getByText("Updating bot's name...")).toBeVisible();
    await expect(page.getByText('en: Unauthorized')).toBeVisible();
  });
});
