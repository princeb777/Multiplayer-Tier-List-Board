<script lang="ts">
  import { boardStore } from '$lib/store.svelte';
  import DraggableImage from './DraggableImage.svelte';

  let fileInput: HTMLInputElement;
  let isDragOver = $state(false);

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      boardStore.addImage(input.files[i]);
    }
    input.value = ''; // Reset input
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    isDragOver = true;
  }

  function handleDragLeave() {
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
    
    // Simplistic calculation for a wrapping flexbox
    let closestDist = Infinity;
    for (const itemEl of items) {
      const rect = itemEl.getBoundingClientRect();
      const itemMiddleX = rect.left + rect.width / 2;
      const itemMiddleY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(Math.pow(dropX - itemMiddleX, 2) + Math.pow(dropY - itemMiddleY, 2));
      
      // If we are relatively close and to the right/bottom
      if (dropX > rect.left && dropY > rect.top && dist < closestDist) {
        if (dropX > itemMiddleX) {
           insertAfterItemId = itemEl.getAttribute('data-item-id');
        } else {
           // We are dropping before this item, so we want to insert after the PREVIOUS item
           const prev = itemEl.previousElementSibling;
           if (prev && prev.classList.contains('draggable-wrapper')) {
             insertAfterItemId = prev.getAttribute('data-item-id');
           } else {
             insertAfterItemId = null; // Insert at the beginning
           }
        }
        closestDist = dist;
      }
    }

    boardStore.moveItem(itemId, 'pool', insertAfterItemId);
  }

  let items = $derived(boardStore.getItemsForTier('pool'));
</script>

<div class="pool-container">
  <div class="pool-header">
    <button onclick={() => boardStore.resetBoard()} class="reset-btn" aria-label="Reset Board" title="Reset Board">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
    </button>
    <button onclick={() => fileInput.click()} class="upload-btn" aria-label="Upload Images" title="Upload Images">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
    </button>
    <input 
      type="file" 
      bind:this={fileInput} 
      onchange={handleFileSelect} 
      multiple 
      accept="image/*" 
      hidden
    />
  </div>

  <div 
    class="pool-content"
    class:drag-over={isDragOver}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="region"
    aria-label="Image pool dropzone"
  >
    {#if items.length === 0}
      <div class="empty-state">
        <p>No images in the pool.</p>
        <p class="subtext">Upload images or drag them back here from the tiers.</p>
      </div>
    {/if}
    {#each items as item (item.id)}
      <DraggableImage {item} />
    {/each}
  </div>
</div>

<style>
  .pool-container {
    background-color: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-top: none; 
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .pool-header {
    padding: 12px 12px 0 12px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .reset-btn,
  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 0;
    transition: background-color 0.2s, transform 0.1s;
  }

  .upload-btn {
    background-color: var(--accent-color);
  }

  .reset-btn {
    background-color: #475569; /* Slate 600 */
  }

  .upload-btn:hover {
    background-color: #2563eb;
  }

  .reset-btn:hover {
    background-color: #334155; /* Slate 700 */
  }

  .reset-btn:active,

  .upload-btn:active {
    transform: scale(0.98);
  }

  .pool-content {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 0;
    flex-grow: 1;
    overflow: hidden;
    transition: background-color 0.2s;
    min-height: 0;
  }

  /* Make items in the pool take up 1/3 of the pool height */
  .pool-content :global(.draggable-wrapper) {
    height: calc(100% / 3);
  }

  .pool-content.drag-over {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .empty-state {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
  }

  .empty-state .subtext {
    font-size: 0.875rem;
    margin-top: 4px;
  }
</style>
