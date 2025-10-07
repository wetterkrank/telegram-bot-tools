import { test, expect } from '@playwright/test';

test.describe('BotSender E2E Tests', () => {
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

  test('should handle complete successful message sending flow', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api.telegram.org/bot*/sendMessage', async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData());

      const mockResponse = {
        ok: true,
        result: {
          message_id: 123,
          from: {
            id: 123456789,
            is_bot: true,
            first_name: 'Test Bot',
            username: 'testbot'
          },
          chat: {
            id: parseInt(postData.chat_id),
            type: 'private'
          },
          date: Math.floor(Date.now() / 1000),
          text: postData.text
        }
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // Navigate to page first
    await page.goto('/bot-sender');
    await page.waitForLoadState('networkidle');

    // Check that submit button is disabled by default
    const submitButton = page.getByRole('button', { name: 'Send Message' });
    await expect(submitButton).toBeDisabled();

    // Fill in all required fields
    await page.getByLabel('Bot Token').fill('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
    await page.getByLabel('Chat IDs').fill('123456789');
    await page.getByLabel('Message').fill('Test message');

    // Submit the form
    await submitButton.click();

    // Wait for the log messages to appear (instead of waiting for response)
    await expect(page.getByText('Sending message to 1 chat(s)...')).toBeVisible();
    await expect(page.getByText('✓ 123456789')).toBeVisible();
    await expect(page.getByText('1 message(s) sent, 0 failed')).toBeVisible();

    // Check that form fields are preserved (not cleared in updated component)
    await expect(page.getByLabel('Chat IDs')).toHaveValue('123456789');
    await expect(page.getByLabel('Message')).toHaveValue('Test message');
    await expect(page.getByLabel('Bot Token')).toHaveValue('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
  });

  test('should handle API error and show error in log', async ({ page }) => {
    // Mock error response
    await page.route('**/api.telegram.org/bot*/sendMessage', async (route) => {
      const mockErrorResponse = {
        ok: false,
        description: 'Bad Request: chat not found'
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockErrorResponse)
      });
    });

    await page.goto('/bot-sender');
    await page.waitForLoadState('networkidle');

    // Fill in all required fields
    await page.getByLabel('Bot Token').fill('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
    await page.getByLabel('Chat IDs').fill('invalid-chat-id');
    await page.getByLabel('Message').fill('Test message');

    // Submit the form
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Wait for the log messages to appear (instead of waiting for response)
    await expect(page.getByText('Sending message to 1 chat(s)...')).toBeVisible();
    await expect(page.getByText('✗ invalid-chat-id: Bad Request: chat not found')).toBeVisible();
    await expect(page.getByText('0 message(s) sent, 1 failed')).toBeVisible();
  });
});
