import chokidar from 'chokidar';
import { getCoachingStatePath } from './config';

export type FileChangeListener = (event: { type: string; timestamp: number }) => void;

// Store the singleton on globalThis to survive HMR re-evaluations
const globalKey = '__interviewCoachWatcher__' as const;

interface WatcherState {
  initialized: boolean;
  listeners: Set<FileChangeListener>;
}

function getWatcherState(): WatcherState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g[globalKey]) {
    g[globalKey] = {
      initialized: false,
      listeners: new Set<FileChangeListener>(),
    };
  }
  return g[globalKey];
}

/**
 * Initializes the Chokidar file watcher (singleton, survives HMR).
 * Watches coaching_state.md and broadcasts "file-changed" events
 * to all registered SSE listeners.
 */
export function initWatcher(): void {
  const state = getWatcherState();
  if (state.initialized) return;
  state.initialized = true;

  const filePath = getCoachingStatePath();

  const watcher = chokidar.watch(filePath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500, // Wait 500ms of no changes before firing
      pollInterval: 100,
    },
  });

  watcher.on('change', () => {
    const event = { type: 'file-changed', timestamp: Date.now() };
    for (const listener of state.listeners) {
      try {
        listener(event);
      } catch (err) {
        // Listener may have been cleaned up — remove it and log
        console.warn('[watcher] Listener threw an error, removing:', err);
        state.listeners.delete(listener);
      }
    }
  });

  watcher.on('error', (error) => {
    console.error('[watcher] Error watching coaching_state.md:', error);
  });
}

/**
 * Register a listener for file change events.
 * Returns an unsubscribe function.
 */
export function onFileChange(listener: FileChangeListener): () => void {
  const state = getWatcherState();

  // Ensure watcher is running
  initWatcher();

  state.listeners.add(listener);
  return () => {
    state.listeners.delete(listener);
  };
}

/**
 * Returns the number of currently connected listeners.
 * Useful for debugging/health checks.
 */
export function getListenerCount(): number {
  return getWatcherState().listeners.size;
}
