/**
 * Authentication for Prepr.
 * Stores the Anthropic API key locally in a config file.
 * No external services, no OAuth — just a local key stored on disk.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/** Config directory inside the project. */
const CONFIG_DIR = join(process.cwd(), '.prepr');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface PreprConfig {
  apiKey?: string;
  createdAt?: string;
}

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readConfig(): PreprConfig {
  try {
    if (!existsSync(CONFIG_FILE)) return {};
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(config: PreprConfig) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export interface AuthStatus {
  authenticated: boolean;
  keyPrefix?: string;
  error?: string;
}

/**
 * Get current auth status — checks if a valid API key is stored.
 */
export function getAuthStatus(): AuthStatus {
  const config = readConfig();

  if (!config.apiKey) {
    return {
      authenticated: false,
      error: 'No API key configured. Add your Anthropic API key to get started.',
    };
  }

  // Basic format validation
  if (!config.apiKey.startsWith('sk-ant-')) {
    return {
      authenticated: false,
      error: 'Invalid API key format. Anthropic keys start with "sk-ant-".',
    };
  }

  return {
    authenticated: true,
    keyPrefix: config.apiKey.slice(0, 12) + '...',
  };
}

/**
 * Save an API key to local config.
 */
export function saveApiKey(apiKey: string): AuthStatus {
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return {
      authenticated: false,
      error: 'Invalid API key. Anthropic keys start with "sk-ant-".',
    };
  }

  const config = readConfig();
  config.apiKey = apiKey;
  config.createdAt = new Date().toISOString();
  writeConfig(config);

  return {
    authenticated: true,
    keyPrefix: apiKey.slice(0, 12) + '...',
  };
}

/**
 * Remove the stored API key.
 */
export function removeApiKey(): void {
  const config = readConfig();
  delete config.apiKey;
  writeConfig(config);
}

/**
 * Get the stored API key for making Anthropic API calls.
 * Returns null if not configured.
 */
export function getAccessToken(): string | null {
  const config = readConfig();
  return config.apiKey ?? null;
}
