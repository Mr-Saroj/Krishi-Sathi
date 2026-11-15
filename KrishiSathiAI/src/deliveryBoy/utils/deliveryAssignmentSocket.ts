import { Client, IMessage } from '@stomp/stompjs';

type SocketCallbacks = {
  onAssignment: (message: IMessage) => void;
  onConnected?: () => void;
  onError?: (error: unknown) => void;
};

export function connectDeliveryAssignmentSocket(
  getToken: () => Promise<string | null>,
  callbacks: SocketCallbacks
) {
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL;
  if (!wsUrl) throw new Error('EXPO_PUBLIC_WS_URL is not configured');

  let token: string | null = null;

  const client = new Client({
    // Runs before every connect and reconnect, so the token is always fresh
    beforeConnect: async () => {
      token = await getToken();
    },

    // React Native's WebSocket accepts a third argument with headers
    webSocketFactory: () =>
      new (WebSocket as any)(wsUrl, null, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      }),

    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,

    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      client.subscribe('/user/queue/delivery-assignments', callbacks.onAssignment);
      callbacks.onConnected?.();
    },
    onStompError: (frame) => callbacks.onError?.(frame),
    onWebSocketError: (e) => callbacks.onError?.(e),
  });

  client.activate();
  return () => void client.deactivate();
}