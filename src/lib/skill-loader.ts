/**
 * Loads the interview coaching skill files for the chat system prompt.
 * Reads CLAUDE.md and coaching_state.md from the project root,
 * and provides access to reference files on demand.
 *
 * PERFORMANCE NOTE: The system prompt is kept lean (~7K tokens).
 * coaching_state.md is NOT embedded in the prompt — it's available via tool.
 * This prevents sending ~12K extra tokens on every tool-loop round-trip.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/** Root of the interview-coach-skill project (parent of interview-coach-web). */
const SKILL_ROOT = join(process.cwd(), '..');

/** Path to the coaching state file. */
const STATE_PATH = join(SKILL_ROOT, 'coaching_state.md');

/** Path to the CLAUDE.md skill definition. */
const CLAUDE_MD_PATH = join(SKILL_ROOT, 'CLAUDE.md');

/** Path to the references directory. */
const REFERENCES_DIR = join(SKILL_ROOT, 'references');

/**
 * Read a file safely, returning null if it doesn't exist.
 */
function readFileSafe(path: string): string | null {
  try {
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

/** Cache the CLAUDE.md content — it doesn't change during a server session. */
let cachedClaudeMd: string | null = null;

function getClaudeMd(): string {
  if (cachedClaudeMd === null) {
    cachedClaudeMd = readFileSafe(CLAUDE_MD_PATH) ?? '';
  }
  return cachedClaudeMd;
}

/**
 * Load the core system prompt — CLAUDE.md only (lean prompt).
 * coaching_state.md is NOT included — Claude fetches it via tool on first turn.
 */
export function loadSystemPrompt(): string {
  const claudeMd = getClaudeMd();
  const today = new Date().toISOString().split('T')[0];
  const stateExists = existsSync(STATE_PATH);

  let prompt = `You are an AI interview coach running inside the Prepr web app. Today's date is ${today}.\n\n`;
  prompt += `# Skill Instructions\n\n${claudeMd}\n\n`;

  prompt += `# Important Context\n\n`;
  prompt += `- You are running inside a web app, not a CLI terminal.\n`;
  prompt += `- **FIRST THING**: At the start of every conversation, use the read_coaching_state tool to load the candidate's current state. Do this before responding to the user.\n`;
  prompt += `- ${stateExists ? 'A coaching_state.md file exists and should be read.' : 'No coaching_state.md found. This is a new candidate. Suggest running kickoff.'}\n`;
  prompt += `- When you need reference files, use read_reference_batch to load multiple files at once (faster than individual calls).\n`;
  prompt += `- When you need to update the coaching state, use the write_coaching_state tool.\n`;
  prompt += `- Format your responses in markdown — the web app renders it properly.\n`;
  prompt += `- The candidate can see their dashboard, pipeline, storybank, and scores alongside this chat.\n`;

  return prompt;
}

/**
 * List available reference files (for tool descriptions).
 */
export function listReferenceFiles(): string[] {
  const files: string[] = [];

  function walk(dir: string, prefix: string) {
    try {
      const entries = require('fs').readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          walk(join(dir, entry.name), `${prefix}${entry.name}/`);
        } else if (entry.name.endsWith('.md')) {
          files.push(`${prefix}${entry.name}`);
        }
      }
    } catch {
      // Directory may not exist
    }
  }

  walk(REFERENCES_DIR, 'references/');
  return files;
}

/**
 * Read a specific reference file by relative path.
 * Only allows reading from the references/ directory for security.
 */
export function readReferenceFile(relativePath: string): string | null {
  // Sanitize path — only allow references/ prefix, no directory traversal
  const normalized = relativePath.replace(/\.\./g, '').replace(/^\//, '');
  if (!normalized.startsWith('references/')) return null;

  const fullPath = join(SKILL_ROOT, normalized);
  return readFileSafe(fullPath);
}

/**
 * Read multiple reference files at once — reduces tool-loop round-trips.
 */
export function readReferenceFiles(paths: string[]): Record<string, string> {
  const results: Record<string, string> = {};
  for (const p of paths) {
    const content = readReferenceFile(p);
    results[p] = content ?? `File not found: ${p}`;
  }
  return results;
}

/**
 * Read the current coaching state.
 */
export function readCoachingState(): string | null {
  return readFileSafe(STATE_PATH);
}

/**
 * Write updated coaching state to disk.
 */
export function writeCoachingState(content: string): boolean {
  try {
    require('fs').writeFileSync(STATE_PATH, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}
