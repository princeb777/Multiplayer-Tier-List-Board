<script lang="ts">
  import TierBoard from '$lib/components/TierBoard.svelte';
  import ImagePool from '$lib/components/ImagePool.svelte';
  import { page } from '$app/stores';
  import { boardStore } from '$lib/store.svelte';

  $effect(() => {
    boardStore.setRoomId($page.params.roomId);
  });
</script>

<svelte:head>
  <title>Tier List Maker</title>
</svelte:head>

<main class="app-container">
  <TierBoard />
  <ImagePool />
</main>

<style>
  .app-container {
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
  }
</style>
