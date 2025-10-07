<script lang="ts">
  type LogEntry = { text: string; type: 'success' | 'error' | 'info'; id: number };

  const { logEntries }: { logEntries: LogEntry[] } = $props();
  const entryClasses = {
    success: 'text-success',
    error: 'text-danger',
    info: ''
  };
</script>

<div class="card">
  <div class="card-header">
    <h5 class="card-title mb-0">Log</h5>
  </div>
  <div class="card-body">
    <div class="bg-light p-3 rounded font-monospace fs-6" style="min-height: 300px; max-height: 600px; overflow-y: auto;">
      {#if logEntries.length === 0}
        <div class="text-muted text-center fst-italic">Results will appear here</div>
      {:else}
        {#each logEntries as entry (entry.id)}
          <div class="rounded {entryClasses[entry.type]}">
            {entry.text}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
