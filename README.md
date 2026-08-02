# Multiplayer Tier List Board 🏆

A highly responsive, real-time collaborative tier list maker built with **SvelteKit 5** and **Socket.io**. Create a room, share the link, and collaboratively rank images with your friends in real time!

## 🚀 Features

- **Real-Time Multiplayer**: Instantly see your friends drag, drop, upload, and delete images. Everything stays perfectly in sync across the network.
- **Dynamic Full-Screen Layout**: The UI dynamically flexes to fit your screen exactly. No scrolling required! Images auto-scale and squeeze themselves to fit the layout.
- **Native Drag & Drop**: Silky smooth, dependency-free drag and drop using the native HTML5 API.
- **Instant Room Generation**: Just click "Create New Room", grab the generated URL, and invite others.
- **Quality of Life**: 
  - Right-click images on the board to quickly toss them back into the pool.
  - Delete unwanted images by hovering over them in the pool.
  - Reset the entire board with one click.

## 🛠️ Tech Stack

This project uses a modern, lightweight, and extremely fast technology stack:

### Frontend
- **Framework**: SvelteKit
- **Reactivity**: Svelte 5 (utilizing the new Runes system: `$state`, `$derived`, `$effect`, and `$props`)
- **Language**: TypeScript
- **State Management**: `SvelteMap` (from `svelte/reactivity`) to handle deep state reactivity when elements move between tiers.
- **Styling**: Pure Vanilla CSS featuring Flexbox for the dynamic layout and CSS variables for theming.

### Backend & Real-Time Sync
- **WebSockets**: `socket.io` and `socket.io-client` for handling rooms and broadcasting state updates between connected clients.
- **File Uploads**: SvelteKit backend API route (`+server.ts`) that accepts `multipart/form-data` and saves uploaded images directly to the `static/uploads/` directory.
- **Server Injection**: A custom Vite plugin inside `vite.config.ts` that attaches the Socket.io WebSocket server directly to the Vite HTTP server, bypassing the need for a separate Node backend during development.

## ⚙️ How it Works

1. **Routing & Rooms**: The app uses SvelteKit dynamic routing (`src/routes/[roomId]/+page.svelte`). When you create a room, the app generates a UUID, redirects you to it, and connects to the WebSocket server requesting to join that specific `roomId`.
2. **State Synchronization**: The source of truth for the board lives in `src/lib/store.svelte.ts`. Whenever an image is added, moved, or deleted, the frontend updates its local state instantly, then broadcasts that state payload to the WebSocket server. The server then rebroadcasts it to everyone else in the room.
3. **Image Hosting**: Because local `blob:` URLs don't work across networks, uploading an image hits the `POST /api/upload` endpoint. The server saves the image file to the local disk and returns a permanent URL (`/uploads/...`) which is then synced across the room.

## 💻 Getting Started

To run the project on your local machine:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start the dev server (exposed to your local network)**:
   ```bash
   pnpm run dev
   ```

3. Open your browser and navigate to the Local or Network IP provided in the terminal (e.g., `http://localhost:5173/`).
4. Click **Create New Room** and copy the URL to a second device on your Wi-Fi to test the multiplayer capabilities!

## 📝 License
MIT
