/**
 * Tests for the file watcher module.
 * Tests the listener registration/unregistration and broadcast logic.
 */
import { describe, it, expect, vi } from 'vitest';
import { onFileChange, getListenerCount } from '@/lib/watcher';

describe('File Watcher — Listener Management', () => {
  it('registers a listener and returns an unsubscribe function', () => {
    const listener = vi.fn();
    const initialCount = getListenerCount();

    const unsubscribe = onFileChange(listener);
    expect(getListenerCount()).toBe(initialCount + 1);

    unsubscribe();
    expect(getListenerCount()).toBe(initialCount);
  });

  it('supports multiple concurrent listeners', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const initialCount = getListenerCount();

    const unsub1 = onFileChange(listener1);
    const unsub2 = onFileChange(listener2);
    expect(getListenerCount()).toBe(initialCount + 2);

    unsub1();
    expect(getListenerCount()).toBe(initialCount + 1);

    unsub2();
    expect(getListenerCount()).toBe(initialCount);
  });

  it('unsubscribing twice does not throw', () => {
    const listener = vi.fn();
    const unsubscribe = onFileChange(listener);

    unsubscribe();
    expect(() => unsubscribe()).not.toThrow();
  });
});
