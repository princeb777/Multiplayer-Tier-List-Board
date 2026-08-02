<script lang="ts">
  import { boardStore } from '$lib/store.svelte';
  import TierRow from './TierRow.svelte';
</script>

<div class="tier-board">
  {#each boardStore.tiers as tier (tier.id)}
    <TierRow {tier} />
  {/each}
</div>

<style>
  .tier-board {
    display: flex;
    flex-direction: column;
    flex: 3;
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border-color);
    min-height: 0;
  }
</style>
