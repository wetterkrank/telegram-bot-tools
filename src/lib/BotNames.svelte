<script lang="ts">
  import type { TelegramResponse, TelegramBotInfo } from '../types/telegram';
  import LogBox from './components/LogBox.svelte';
  import { validateBotToken } from './functions/botTokenValidation';

  // What can we update?
  type updateModes = 'name' | 'shortDescription' | 'description';

  // Reactive state
  let botToken: string = '';
  let updateMode: updateModes = 'name';
  let csvData: string = '';
  let logEntries: { text: string; type: 'success' | 'error' | 'info'; id: number }[] = [];
  let isProcessing: boolean = false;

  // CSV parsing function
  function parseCSV(csvData: string): { languageCode: string; text: string }[] {
    return csvData
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row)
      .map((row) => {
        const [languageCode, ...textParts] = row.split(",");
        const text = textParts.join(",").trim();
        const cleanText = text.match(/^"(.*)"$/) ? text.slice(1, -1) : text;
        return {
          languageCode: languageCode.trim(),
          text: cleanText,
        };
      });
  }

  // Add log entry
  function addLogEntry(text: string, type: 'success' | 'error' | 'info' = 'info') {
    logEntries = [...logEntries, { text, type, id: Date.now() }];
  }

  // Clear log
  function clearLog() {
    logEntries = [];
  }

  // Update type text mapping
  const updateTypeTexts: Record<updateModes, string> = {
    name: 'name',
    shortDescription: 'short description',
    description: 'description'
  };

  // Endpoint parameters mapping
  const endpointParams: Record<updateModes, keyof TelegramBotInfo> = {
      name: 'name',
      shortDescription: 'short_description',
      description: 'description'
    };

  // Validate bot token using shared utility
  async function handleTokenValidation(token: string) {
    if (!token) {
      clearLog();
      return;
    }

    const result = await validateBotToken(token);
    addLogEntry(result.message, result.success ? 'success' : 'error');
  }

  // Handle form submission
  async function handleSubmit() {
    if (!botToken || !csvData) return;

    isProcessing = true;
    clearLog();

    const rows = parseCSV(csvData);
    const updateTypeText = updateTypeTexts[updateMode] || 'unknown';

    addLogEntry(`Updating bot's ${updateTypeText}...`);

    const endpoints: Record<typeof updateMode, string> = {
      name: 'setMyName',
      shortDescription: 'setMyShortDescription',
      description: 'setMyDescription'
    };

    for (const row of rows) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoints[updateMode]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language_code: row.languageCode,
            [endpointParams[updateMode]]: row.text
          })
        });

        const data = await response.json() as TelegramResponse;
        addLogEntry(
          `${row.languageCode}: ${data.ok ? "OK" : data.description || "Error"}`,
          data.ok ? 'success' : 'error'
        );

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        addLogEntry(
          `${row.languageCode}: ${error instanceof Error ? error.message : "Unknown error"}`,
          'error'
        );
      }
    }

    isProcessing = false;
  }

  // Handle verify button
  async function handleVerify() {
    if (!botToken) return;

    isProcessing = true;
    clearLog();

    const updateTypeText = updateTypeTexts[updateMode];
    addLogEntry(`Checking bot's current ${updateTypeText}...`);

    const getEndpoints: Record<typeof updateMode, string> = {
      name: 'getMyName',
      shortDescription: 'getMyShortDescription',
      description: 'getMyDescription'
    };

    const rows = [{ languageCode: '', text: '' }, ...parseCSV(csvData)];

    for (const row of rows) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/${getEndpoints[updateMode]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language_code: row.languageCode })
        });

        const data = await response.json() as TelegramResponse<TelegramBotInfo>;
        const currentValue = data.ok && data.result ?
          (data.result[endpointParams[updateMode]] || '') : '';

        addLogEntry(`${row.languageCode || "generic"}: ${currentValue || "(not set)"}`);

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        addLogEntry(
          `${row.languageCode}: ${error instanceof Error ? error.message : "Unknown error"}`,
          'error'
        );
      }
    }

    isProcessing = false;
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
    <h1 class="mb-3">Bot Names</h1>
    <p class="lead mb-4">
      Updates the name, short description, and long description of your Telegram bot in different languages
    </p>
  </div>
</div>

<div class="row">
  <div class="col-lg-6">
    <form on:submit|preventDefault={handleSubmit} class="card">
      <div class="card-body">
        <div class="mb-3">
          <label for="botToken" class="form-label">
            Bot Token (<a href="https://t.me/BotFather" target="_blank" class="text-decoration-none">@BotFather</a>):
          </label>
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

        <fieldset class="mb-3">
          <legend class="form-label">What are we updating?</legend>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="updateType"
              id="updateName"
              value="name"
              bind:group={updateMode}
              checked
            />
            <label class="form-check-label" for="updateName">
              Name
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="updateType"
              id="updateShortDescription"
              value="shortDescription"
              bind:group={updateMode}
            />
            <label class="form-check-label" for="updateShortDescription">
              Short Description
              <span class="badge bg-secondary ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Shown on the bot's profile page and is sent together with the link when users share the bot, max 120 characters.">?</span>
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="updateType"
              id="updateDescription"
              value="description"
              bind:group={updateMode}
            />
            <label class="form-check-label" for="updateDescription">
              Long Description
              <span class="badge bg-secondary ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Shown in the chat with the bot if the chat is empty, max 512 characters.">?</span>
            </label>
          </div>
        </fieldset>

        <div class="mb-3">
          <label for="csvData" class="form-label">CSV Data (language_code,text):</label>
          <textarea
            id="csvData"
            class="form-control"
            rows="10"
            bind:value={csvData}
            required
            placeholder="en,This bot does something
es,Este bot hace algo
de,Dieser Bot macht etwas."
          ></textarea>
        </div>

        <div class="d-grid gap-2 d-md-flex">
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Update'}
          </button>
          <button
            type="button"
            class="btn btn-success"
            on:click={handleVerify}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Read Current Values'}
          </button>
        </div>
      </div>
    </form>
  </div>

  <div class="col-lg-6">
    <LogBox {logEntries} title="Results" />
  </div>
</div>
