<script lang="ts">
  import type { Tier, TierId } from '$lib/store.svelte';
  import { boardStore } from '$lib/store.svelte';
  import DraggableImage from './DraggableImage.svelte';

  let { tier } = $props<{ tier: Tier }>();

  let isDragOver = $state(false);

  function handleDragOver(e: DragEvent) {
    e.preventDefault(); // Necessary to allow dropping
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    
    if (!e.dataTransfer) return;
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId) return;

    // Calculate insertion index
    const targetEl = e.currentTarget as HTMLElement;
    const dropX = e.clientX;
    const dropY = e.clientY;
    
    let insertAfterItemId: string | null = null;
    const items = Array.from(targetEl.querySelectorAll('.draggable-wrapper'));
    
    let closestDist = Infinity;
    for (const itemEl of items) {
      const rect = itemEl.getBoundingClientRect();
      const itemMiddleX = rect.left + rect.width / 2;
      const itemMiddleY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(Math.pow(dropX - itemMiddleX, 2) + Math.pow(dropY - itemMiddleY, 2));
      
      if (dropX > rect.left && dropY > rect.top && dist < closestDist) {
        if (dropX > itemMiddleX) {
           insertAfterItemId = itemEl.getAttribute('data-item-id');
        } else {
           const prev = itemEl.previousElementSibling;
           if (prev && prev.classList.contains('draggable-wrapper')) {
             insertAfterItemId = prev.getAttribute('data-item-id');
           } else {
             insertAfterItemId = null;
           }
        }
        closestDist = dist;
      }
    }

    boardStore.moveItem(itemId, tier.id, insertAfterItemId);
  }

  let items = $derived(boardStore.getItemsForTier(tier.id));
</script>

<div class="tier-row-container">
  <div class="tier-label" style="background-color: {tier.color}">
    {tier.label}
  </div>
  
  <div 
    class="tier-content" 
    class:drag-over={isDragOver}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="region"
    aria-label="{tier.label} tier dropzone"
  >
    {#each items as item (item.id)}
      <DraggableImage {item} />
    {/each}
  </div>
</div>

<style>
  .tier-row-container {
    display: flex;
    flex: 1;
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border-color);
    overflow: hidden;
    min-height: 0;
  }

  .tier-row-container:first-child {
    border-top: none;
  }

  .tier-row-container:last-child {
    border-bottom: none;
  }

  .tier-label {
    width: 100px; /* Fixed width instead of variable */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: #000; /* Contrast text */
    text-shadow: 0px 1px 2px rgba(255,255,255,0.4);
    flex-shrink: 0;
    border-right: 1px solid var(--border-color);
  }

  .tier-content {
    flex-grow: 1;
    display: flex;
    align-items: center;
    padding: 0;
    gap: 0;
    flex-wrap: nowrap;
    overflow: hidden;
    transition: background-color 0.2s;
    min-height: 0;
    min-width: 0;
  }



  .tier-content.drag-over {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>
