export interface RealtimeMessage {
  type: 'board-updated';
  sender: string;
}

const CHANNEL_NAME = 'taskflow-realtime';
const senderId = Math.random().toString(36).slice(2, 10);

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  channel ??= new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

/**
 * Cross-tab realtime transport (BroadcastChannel). It plays the role a WebSocket
 * would play with a real backend: the rest of the app only depends on this interface.
 */
export const realtime = {
  publish(type: RealtimeMessage['type']): void {
    getChannel()?.postMessage({ type, sender: senderId } satisfies RealtimeMessage);
  },
  subscribe(handler: (message: RealtimeMessage) => void): () => void {
    if (typeof BroadcastChannel === 'undefined') return () => undefined;
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (event: MessageEvent<RealtimeMessage>) => {
      if (event.data.sender !== senderId) handler(event.data);
    };
    return () => ch.close();
  },
};
