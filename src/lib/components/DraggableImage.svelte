<script lang="ts">
  import type { ImageItem } from '$lib/store.svelte';
  import { boardStore } from '$lib/store.svelte';

  let { item } = $props<{ item: ImageItem }>();

  let isDragging = $state(false);

  function handleDragStart(e: DragEvent) {
    isDragging = true;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.id);
    }
  }

  function handleDragEnd() {
    isDragging = false;
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    if (item.tierId !== 'pool') {
      boardStore.moveItem(item.id, 'pool');
    }
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    boardStore.deleteItem(item.id);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="draggable-wrapper" 
  class:dragging={isDragging}
  draggable="true" 
  ondragstart={handleDragStart} 
  ondragend={handleDragEnd}
  oncontextmenu={handleContextMenu}
  data-item-id={item.id}
>
  <!-- svelte-ignore a11y_missing_attribute -->
  <img src={item.url} draggable="false" />
  
  {#if item.tierId === 'pool'}
    <button class="delete-btn" onclick={handleDelete} aria-label="Delete image">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  {/if}
</div>

<style>
  .draggable-wrapper {
    height: 100%;
    cursor: grab;
    transition: transform 0.2s, opacity 0.2s, filter 0.2s;
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    position: relative; /* added for absolute positioning of delete button */
  }

  .draggable-wrapper:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
    z-index: 10;
  }

  .draggable-wrapper:hover .delete-btn {
    opacity: 1;
  }

  .draggable-wrapper:active {
    cursor: grabbing;
  }

  .draggable-wrapper.dragging {
    opacity: 0.5;
    filter: grayscale(0.5);
  }

  img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    display: block;
    pointer-events: none;
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(220, 38, 38, 0.9);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s, transform 0.1s;
    cursor: pointer;
  }

  .delete-btn:hover {
    background-color: rgb(220, 38, 38);
    transform: scale(1.1);
  }
</style>
