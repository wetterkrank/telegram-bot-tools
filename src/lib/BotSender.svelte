<script lang="ts">
  import type { TelegramSendMessageResponse } from '../types/telegram';
  import LogBox from './components/LogBox.svelte';
  import { checkBotToken } from './telegram/bot-token-check';

  // Reactive state
  let botToken: string = '';
  let chatId: string = '';
  let message: string = '';
  let isSending: boolean = false;
  let logEntries: { text: string; type: 'success' | 'error' | 'info'; id: number }[] = [];

  // Log management
  function addLogEntry(text: string, type: 'success' | 'error' | 'info' = 'info') {
    logEntries = [...logEntries, { text, type, id: Date.now() }];
  }

  function clearLog() {
    logEntries = [];
  }

  // Send message to Telegram
  async function sendDataToTelegram(params: { botToken: string; chatId: string; message: string }): Promise<TelegramSendMessageResponse> {
    const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.message,
        parse_mode: 'MarkdownV2'
      }),
    });
    return response.json() as Promise<TelegramSendMessageResponse>;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!botToken || !chatId || !message) return;

    isSending = true;
    clearLog();
    addLogEntry("Sending message...", "info");

    try {
      const result = await sendDataToTelegram({
        botToken,
        chatId,
        message
      });

      if (result.ok) {
        addLogEntry("Message sent successfully!", "success");
        // Clear form fields after successful send
        chatId = '';
        message = '';
      } else {
        addLogEntry(`Error: ${result.description}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      addLogEntry(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    } finally {
      isSending = false;
    }
  }

  async function handleTokenValidation(token: string) {
    if (!token) {
      clearLog();
      return;
    }

    const result = await checkBotToken(token);
    addLogEntry(result.message, result.success ? 'success' : 'error');
  }

  // Debounced token validation
  let tokenTimeout: number | undefined;
  $: if (botToken) {
    clearTimeout(tokenTimeout);
    tokenTimeout = window.setTimeout(() => handleTokenValidation(botToken), 500);
  } else {
    clearLog();
  }
</script>

<div class="row">
  <div class="col-12">
    <h1 class="mb-3">Bot Sender</h1>
    <p class="lead mb-4">
      Sends a message from your bot to specifed chats
    </p>
  </div>
</div>

<div class="row">
  <div class="col-lg-6 mb-3">
    <div class="card">
      <div class="card-body">
        <form on:submit|preventDefault={handleSubmit}>
          <div class="mb-3">
            <label for="botToken" class="form-label">Bot Token (<a href="https://t.me/BotFather" target="_blank" class="text-decoration-none">@BotFather</a>):</label>
            <input
              type="text"
              id="botToken"
              class="form-control"
              bind:value={botToken}
              required
            />
            <div class="form-text">
              This app runs in your browser and does not store the bot token.
            </div>
          </div>

          <div class="mb-3">
            <label for="chatId" class="form-label">Chat ID (<a href="https://t.me/userinfobot" target="_blank" class="text-decoration-none">@userinfobot</a> to get yours):</label>
            <input
              type="text"
              id="chatId"
              class="form-control"
              bind:value={chatId}
              required
            />
          </div>

          <div class="mb-3">
            <label for="message" class="form-label">
              Message (<a href="https://core.telegram.org/bots/api#markdownv2-style" target="_blank" class="text-decoration-none">MarkdownV2</a>):
            </label>
            <textarea
              id="message"
              class="form-control"
              rows="6"
              bind:value={message}
              required
            ></textarea>
          </div>

          <div class="d-grid">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              disabled={isSending || !botToken || !chatId || !message}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="col-lg-6">
    <LogBox {logEntries} />
  </div>
</div>
