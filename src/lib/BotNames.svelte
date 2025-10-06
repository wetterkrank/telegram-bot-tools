<script lang="ts">
  import type { TelegramResponse, TelegramBot, TelegramBotInfo } from '../types/telegram';
  // Reactive state
  let botToken: string = '';
  let updateType: 'name' | 'shortDescription' | 'description' = 'name';
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

  // Validate bot token
  async function validateBotToken(token: string) {
    if (!token) {
      clearLog();
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json() as TelegramResponse<TelegramBot>;

      if (data.ok && data.result) {
        const { first_name, username } = data.result;
        addLogEntry(`Connected to @${username} (${first_name})`, 'success');
      } else {
        addLogEntry(data.description || "Invalid bot token", 'error');
      }
    } catch (error) {
      addLogEntry(error instanceof Error ? error.message : "Connection error", 'error');
    }
  }

  // Handle form submission
  async function handleSubmit() {
    if (!botToken || !csvData) return;

    isProcessing = true;
    clearLog();

    const rows = parseCSV(csvData);
    const updateTypeText = updateType === 'name' ? 'name' :
                          updateType === 'shortDescription' ? 'short description' : 'description';

    addLogEntry(`Updating bot's ${updateTypeText}...`);

    const endpoints: Record<typeof updateType, string> = {
      name: 'setMyName',
      shortDescription: 'setMyShortDescription',
      description: 'setMyDescription'
    };

    for (const row of rows) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoints[updateType]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [updateType === 'name' ? 'name' :
             updateType === 'shortDescription' ? 'short_description' : 'description']: row.text,
            language_code: row.languageCode
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

    const updateTypeText = updateType === 'name' ? 'name' :
                          updateType === 'shortDescription' ? 'short description' : 'description';

    addLogEntry(`Checking bot's current ${updateTypeText}...`);

    const getEndpoints: Record<typeof updateType, string> = {
      name: 'getMyName',
      shortDescription: 'getMyShortDescription',
      description: 'getMyDescription'
    };

    const rows = [{ languageCode: '', text: '' }, ...parseCSV(csvData)];

    for (const row of rows) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/${getEndpoints[updateType]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language_code: row.languageCode })
        });

        const data = await response.json() as TelegramResponse<TelegramBotInfo>;
        const currentValue = data.ok && data.result ?
          (data.result[updateType === 'name' ? 'name' :
                        updateType === 'shortDescription' ? 'short_description' : 'description'] || '') : '';

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
    tokenTimeout = window.setTimeout(() => validateBotToken(botToken), 500);
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
              bind:group={updateType}
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
              bind:group={updateType}
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
              bind:group={updateType}
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
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Results</h5>
      </div>
      <div class="card-body">
        <div class="bg-light p-3 rounded" style="min-height: 300px; max-height: 600px; overflow-y: auto; font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace; font-size: 13px;">
          {#if logEntries.length === 0}
            <div class="text-muted text-center fst-italic">Results will appear here</div>
          {:else}
            {#each logEntries as entry (entry.id)}
              <div class="mb-2 p-2 rounded {entry.type === 'success' ? 'bg-success text-white' : entry.type === 'error' ? 'bg-danger text-white' : ''}">
                {entry.text}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
