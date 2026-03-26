import path from 'path';

/**
 * Resolves the absolute path to coaching_state.md.
 * Uses COACHING_STATE_PATH env var (relative to project root, or absolute).
 * Defaults to ../coaching_state.md (one level up from interview-coach-web/).
 */
export function getCoachingStatePath(): string {
  const envPath = process.env.COACHING_STATE_PATH ?? '../coaching_state.md';

  if (path.isAbsolute(envPath)) {
    return envPath;
  }

  // Resolve relative to the project root (process.cwd() in Next.js).
  // turbopackIgnore prevents Turbopack from tracing the whole project tree.
  return path.join(/*turbopackIgnore: true*/ process.cwd(), envPath);
}
