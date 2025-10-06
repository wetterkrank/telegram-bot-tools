<script lang="ts">
  import Header from './Header.svelte';
</script>

<div class="d-flex flex-column h-100">
  <div class="container">
    <Header />
  </div>

  <main class="flex-shrink-0">
    <div class="container">
      <slot />
    </div>
  </main>
</div>
