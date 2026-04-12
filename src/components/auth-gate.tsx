'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Key, ExternalLink, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Auth gate — wraps the app content. Shows a setup screen
 * if no API key is configured, otherwise renders children.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, isLoading, refresh } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="animate-pulse text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!status.authenticated) {
    return <SetupScreen onSuccess={refresh} error={status.error} />;
  }

  return <>{children}</>;
}

function SetupScreen({
  onSuccess,
  error,
}: {
  onSuccess: () => void;
  error?: string;
}) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();

      if (data.authenticated) {
        onSuccess();
      } else {
        setSaveError(data.error || 'Failed to save API key.');
      }
    } catch {
      setSaveError('Failed to connect. Is the server running?');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-text-primary)] text-white text-2xl font-bold font-[family-name:var(--font-sans)] mb-4">
            P
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Prepr
          </h1>
          <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] mt-2">
            AI-powered interview coaching
          </p>
        </div>

        {/* Setup card */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-8">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-2">
            Connect your Claude account
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] mb-6">
            Enter your Anthropic API key to get started. Your key is stored
            locally on your machine — it never leaves this device.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API Key input */}
            <div>
              <label
                htmlFor="api-key"
                className="block text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1.5"
              >
                Anthropic API Key
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 rounded-[var(--radius-md)]',
                    'border border-[var(--color-border)] bg-[var(--color-bg)]',
                    'text-sm font-mono text-[var(--color-text-primary)]',
                    'placeholder:text-[var(--color-text-muted)]',
                    'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                  )}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {(saveError || error) && (
              <div className="bg-[var(--color-danger-subtle)] border border-[var(--color-danger)] rounded-[var(--radius-sm)] p-3">
                <p className="text-xs text-[var(--color-danger)] font-[family-name:var(--font-body)]">
                  {saveError || error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!apiKey.trim() || saving}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'bg-[var(--color-text-primary)] text-white',
                'font-semibold text-sm font-[family-name:var(--font-sans)]',
                'py-3 px-4 rounded-[var(--radius-md)]',
                'hover:opacity-90 transition-opacity',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Get Started'
              )}
            </button>
          </form>

          {/* Help link */}
          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--color-accent)] hover:underline font-[family-name:var(--font-body)]"
            >
              <ExternalLink className="h-3 w-3" />
              Get your API key from the Anthropic Console
            </a>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-2 font-[family-name:var(--font-body)]">
              Your key is stored in .prepr/config.json locally. It never
              leaves your machine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
