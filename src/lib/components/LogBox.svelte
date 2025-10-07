<script lang="ts">
  export let logEntries: { text: string; type: 'success' | 'error' | 'info'; id: number }[] = [];
  export let title: string = 'Results';
</script>

<div class="card">
  <div class="card-header">
    <h5 class="card-title mb-0">{title}</h5>
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
