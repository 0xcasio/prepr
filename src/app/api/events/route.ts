import { onFileChange } from '@/lib/watcher';

/**
 * GET /api/events
 * Server-Sent Events endpoint.
 *
 * Streams file-change events and periodic heartbeats to keep connections alive.
 * Clients connect via EventSource and receive:
 *   - event: file-changed  (when coaching_state.md changes)
 *   - event: heartbeat     (every 30s to prevent timeout)
 */
export async function GET() {
  const encoder = new TextEncoder();

  // Track cleanup functions so the cancel callback can reference them
  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`)
      );

      // Subscribe to file change events
      unsubscribe = onFileChange((event) => {
        try {
          controller.enqueue(
            encoder.encode(`event: file-changed\ndata: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Stream may have been closed by client — cleanup will happen in cancel()
        }
      });

      // Heartbeat every 30s to keep the connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`)
          );
        } catch {
          // Stream closed — cleanup will happen in cancel()
        }
      }, 30_000);
    },

    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering if proxied
    },
  });
}

// Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
