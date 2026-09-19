import { EventEnvelope, ConnectionStatus, ClientWsMessage } from '../types/events';

export class RealtimeWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private sessionId: string | null = null;
  private status: ConnectionStatus = 'OFFLINE';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: number | null = null;
  private pingInterval: number | null = null;
  private lastSequence = 0;

  private messageListeners: Set<(event: EventEnvelope) => void> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  constructor(baseUrl?: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const port = '8000';
    this.url = baseUrl || `${protocol}//${host}:${port}/ws`;
  }

  public connect(sessionId?: string): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.sessionId === sessionId) return;
      this.disconnect();
    }

    this.sessionId = sessionId || null;
    const targetUrl = this.sessionId ? `${this.url}/${this.sessionId}` : this.url;

    this.setStatus(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0;
        this.startPingInterval();

        if (this.sessionId) {
          this.sendMessage({
            action: 'SUBSCRIBE',
            session_id: this.sessionId,
          });
        }
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const envelope: EventEnvelope = JSON.parse(event.data);
          
          // Duplicate event & sequence ordering filter
          if (envelope.sequence && envelope.sequence <= this.lastSequence) {
            return;
          }
          if (envelope.sequence) {
            this.lastSequence = envelope.sequence;
          }

          this.messageListeners.forEach((listener) => listener(envelope));
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };

      this.ws.onclose = () => {
        this.stopPingInterval();
        if (this.status !== 'OFFLINE') {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.setStatus('OFFLINE');
    this.stopPingInterval();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  public sendMessage(msg: ClientWsMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  public onMessage(callback: (event: EventEnvelope) => void): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  private setStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('OFFLINE');
      return;
    }

    this.setStatus('RECONNECTING');
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect(this.sessionId || undefined);
    }, delay);
  }

  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = window.setInterval(() => {
      this.sendMessage({ action: 'PING', payload: { timestamp: Date.now() } });
    }, 20000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const realtimeClient = new RealtimeWebSocketClient();
