'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthStatus } from '@/lib/auth';

export default function SettingsPage() {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  const handleSave = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newKey.trim() }),
      });
      const data = await res.json();

      if (data.authenticated) {
        setStatus(data);
        setNewKey('');
        setMessage({ type: 'success', text: 'API key updated successfully.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid key.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setStatus({ authenticated: false });
      setMessage({ type: 'success', text: 'API key removed. You will need to re-enter it.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove key.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1">
        Settings
      </h1>
      <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] mb-8">
        Manage your Prepr configuration
      </p>

      {/* API Key Section */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <h2 className="text-lg font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Anthropic API Key
          </h2>
        </div>

        {/* Current status */}
        {status?.authenticated ? (
          <div className="flex items-center justify-between bg-[var(--color-success-subtle)] rounded-[var(--radius-md)] px-4 py-3 mb-4">
            <div>
              <p className="text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
                Connected
              </p>
              <p className="text-xs font-mono text-[var(--color-text-secondary)] mt-0.5">
                {status.keyPrefix}
              </p>
            </div>
            <button
              onClick={handleRemove}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)] hover:underline disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <div className="bg-[var(--color-warning-subtle)] rounded-[var(--radius-md)] px-4 py-3 mb-4">
            <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)]">
              No API key configured. The coaching chat requires a key to work.
            </p>
          </div>
        )}

        {/* Update key */}
        <label
          htmlFor="settings-api-key"
          className="block text-sm font-medium font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1.5"
        >
          {status?.authenticated ? 'Update key' : 'Enter API key'}
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              id="settings-api-key"
              type={showKey ? 'text' : 'password'}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="sk-ant-..."
              className={cn(
                'w-full px-3 py-2.5 pr-10 rounded-[var(--radius-md)]',
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
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!newKey.trim() || saving}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]',
              'bg-[var(--color-text-primary)] text-white text-sm font-semibold font-[family-name:var(--font-sans)]',
              'hover:opacity-90 transition-opacity',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={cn(
              'mt-3 rounded-[var(--radius-sm)] px-3 py-2 text-xs font-[family-name:var(--font-body)]',
              message.type === 'success'
                ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'
                : 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)]'
            )}
          >
            {message.text}
          </div>
        )}

        <p className="text-[10px] text-[var(--color-text-muted)] mt-4 font-[family-name:var(--font-body)]">
          Stored locally in .prepr/config.json. Never sent anywhere except Anthropic&apos;s API.
        </p>
      </div>
    </div>
  );
}
