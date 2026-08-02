<script lang="ts">
  import { goto } from '$app/navigation';

  let selectedTemplate = 'standard';

  function createRoom() {
    const roomId = crypto.randomUUID().split('-')[0];
    goto(`/${roomId}?template=${selectedTemplate}`);
  }
</script>

<svelte:head>
  <title>Tier List Board</title>
</svelte:head>

<div class="landing-container">
  <h1>Multiplayer Tier List Board</h1>
  <p>Create a room, share the link, and collaboratively build a tier list in real-time!</p>
  
  <div class="settings">
    <label for="template">Tier Template:</label>
    <select id="template" bind:value={selectedTemplate}>
      <option value="standard">Standard (S to F)</option>
      <option value="short">Short (S to D)</option>
    </select>
  </div>

  <button class="create-btn" onclick={createRoom}>Create New Room</button>
</div>

<style>
  .landing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: var(--bg-color);
    color: var(--text-color);
    text-align: center;
    padding: 24px;
    box-sizing: border-box;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 32px;
    color: #94a3b8;
  }

  .settings {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  label {
    font-size: 1.1rem;
    color: #cbd5e1;
  }

  select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #475569;
    background-color: #1e293b;
    color: white;
    font-size: 1rem;
    outline: none;
  }

  select:focus {
    border-color: var(--accent-color);
  }

  .create-btn {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 16px 32px;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .create-btn:hover {
    background-color: #2563eb;
  }

  .create-btn:active {
    transform: scale(0.98);
  }
</style>
