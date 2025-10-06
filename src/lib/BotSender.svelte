<script lang="ts">
  import { onMount } from 'svelte';
  import type { TelegramSendMessageResponse } from '../types/telegram';

  // Reactive state
  let botToken: string = '';
  let chatId: string = '';
  let message: string = '';
  let isSending: boolean = false;
  let toasts: { id: number; message: string; type: 'info' | 'success' | 'danger'; timestamp: number }[] = [];

  // Toast management
  function showToast(message: string, type: 'info' | 'success' | 'danger' = 'info') {
    const toast = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };
    toasts = [...toasts, toast];

    // Auto-remove toast after delay
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== toast.id);
    }, type === 'success' || type === 'info' ? 3000 : 5000);
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
    showToast("Sending...", "info");

    try {
      const result = await sendDataToTelegram({
        botToken,
        chatId,
        message
      });

      if (result.ok) {
        showToast("Message sent successfully!", "success");
      } else {
        showToast(`Error: ${result.description}`, "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, "danger");
    } finally {
      isSending = false;
    }
  }

  // Initialize Bootstrap tooltips
  onMount(() => {
    // Bootstrap tooltips will be initialized automatically
  });
</script>

<div class="row">
  <div class="col-12">
    <h1 class="mb-3">Bot Sender</h1>
    <p class="lead mb-4">
      Sends messages to specifed chats from your bot
    </p>
  </div>
</div>

<div class="row">
  <div class="col-lg-8">
    <div class="card shadow">
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
            <label for="chatId" class="form-label">Chat ID (<a href="https://t.me/userinfobot" target="_blank" class="text-decoration-none">@userinfobot</a>):</label>
            <input
              type="text"
              id="chatId"
              class="form-control"
              bind:value={chatId}
              required
            />
            <div class="form-text">

            </div>
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
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<!-- Toast Container -->
<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1050;">
  {#each toasts as toast (toast.id)}
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Telegram Bot</strong>
        <button
          type="button"
          class="btn-close"
          on:click={() => toasts = toasts.filter(t => t.id !== toast.id)}
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body">
        {toast.message}
      </div>
    </div>
  {/each}
</div>
