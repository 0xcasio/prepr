/**
 * Loads the interview coaching skill files for the chat system prompt.
 * Reads CLAUDE.md and coaching_state.md from the project root,
 * and provides access to reference files on demand.
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

/**
 * Load the core system prompt — CLAUDE.md + current coaching state.
 */
export function loadSystemPrompt(): string {
  const claudeMd = readFileSafe(CLAUDE_MD_PATH) ?? '';
  const state = readFileSafe(STATE_PATH) ?? '';

  const today = new Date().toISOString().split('T')[0];

  let prompt = `You are an AI interview coach running inside the Prepr web app. Today's date is ${today}.\n\n`;
  prompt += `# Skill Instructions\n\n${claudeMd}\n\n`;

  if (state) {
    prompt += `# Current Coaching State\n\nThe following is the candidate's current coaching_state.md:\n\n${state}\n`;
  } else {
    prompt += `# Current Coaching State\n\nNo coaching_state.md found. This is a new candidate. Suggest running kickoff.\n`;
  }

  prompt += `\n# Important Context\n\n`;
  prompt += `- You are running inside a web app, not a CLI terminal.\n`;
  prompt += `- When you need to read a reference file (e.g., references/commands/analyze.md), use the read_reference tool.\n`;
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
