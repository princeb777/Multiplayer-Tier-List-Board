import { SvelteMap } from 'svelte/reactivity';
import { io, Socket } from 'socket.io-client';

export type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'pool';

export interface Tier {
  id: TierId;
  label: string;
  color: string;
}

export interface ImageItem {
  id: string;
  url: string;
  tierId: TierId;
  orderIndex: number;
}

export const TIERS: Tier[] = [
  { id: 'S', label: 'S', color: 'var(--tier-s-color)' },
  { id: 'A', label: 'A', color: 'var(--tier-a-color)' },
  { id: 'B', label: 'B', color: 'var(--tier-b-color)' },
  { id: 'C', label: 'C', color: 'var(--tier-c-color)' },
  { id: 'D', label: 'D', color: 'var(--tier-d-color)' },
  { id: 'E', label: 'E', color: 'var(--tier-e-color)' },
  { id: 'F', label: 'F', color: 'var(--tier-f-color)' },
];

class BoardStore {
  items = new SvelteMap<string, ImageItem>();
  roomId: string | null = null;
  socket: Socket | null = null;
  
  // Track if a local update is happening so we don't infinitely broadcast
  isLocalUpdate = false;

  setRoomId(roomId: string) {
    if (this.roomId === roomId) return;
    this.roomId = roomId;
    
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Connect to the same origin where the Vite dev server is running
    this.socket = io();

    this.socket.on('connect', () => {
      this.socket?.emit('join-room', this.roomId);
    });

    this.socket.on('sync-state', (newState: ImageItem[]) => {
      // Server broadcasted new state, update locally without re-broadcasting
      this.isLocalUpdate = true;
      this.items.clear();
      newState.forEach(item => {
        this.items.set(item.id, item);
      });
      this.isLocalUpdate = false;
    });
  }

  private broadcastState() {
    if (!this.roomId || !this.socket || this.isLocalUpdate) return;
    const currentState = Array.from(this.items.values());
    this.socket.emit('update-state', this.roomId, currentState);
  }

  getItemsForTier(tierId: TierId): ImageItem[] {
    const tierItems: ImageItem[] = [];
    for (const item of this.items.values()) {
      if (item.tierId === tierId) {
        tierItems.push(item);
      }
    }
    return tierItems.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async addImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      const url = data.url;

      const id = crypto.randomUUID();
      const poolItems = this.getItemsForTier('pool');
      const orderIndex = poolItems.length > 0 ? poolItems[poolItems.length - 1].orderIndex + 1 : 0;
      
      this.items.set(id, {
        id,
        url,
        tierId: 'pool',
        orderIndex
      });

      this.broadcastState();
    } catch (err) {
      console.error('Error adding image:', err);
    }
  }

  moveItem(itemId: string, targetTierId: TierId, insertAfterItemId: string | null = null) {
    const item = this.items.get(itemId);
    if (!item) return;

    const targetItems = this.getItemsForTier(targetTierId).filter(i => i.id !== itemId);
    
    let newIndex = 0;
    if (insertAfterItemId) {
      const idx = targetItems.findIndex(i => i.id === insertAfterItemId);
      if (idx !== -1) {
        newIndex = idx + 1;
      }
    }

    targetItems.splice(newIndex, 0, item);

    targetItems.forEach((itm, index) => {
      const existing = this.items.get(itm.id)!;
      this.items.set(itm.id, {
        ...existing,
        tierId: targetTierId,
        orderIndex: index
      });
    });

    this.broadcastState();
  }

  deleteItem(itemId: string) {
    this.items.delete(itemId);
    this.broadcastState();
  }

  resetBoard() {
    let orderIndex = this.getItemsForTier('pool').length;
    for (const [id, item] of this.items.entries()) {
      if (item.tierId !== 'pool') {
        this.items.set(id, { ...item, tierId: 'pool', orderIndex: orderIndex++ });
      }
    }
    this.broadcastState();
  }
}

export const boardStore = new BoardStore();
