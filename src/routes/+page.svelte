<script lang="ts">
  import { goto } from '$app/navigation';

  function createRoom() {
    const roomId = crypto.randomUUID().split('-')[0];
    goto(`/${roomId}`);
  }
</script>

<svelte:head>
  <title>Tier List Board</title>
</svelte:head>

<div class="landing-container">
  <h1>Multiplayer Tier List Board</h1>
  <p>Create a room, share the link, and collaboratively build a tier list in real-time!</p>
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
