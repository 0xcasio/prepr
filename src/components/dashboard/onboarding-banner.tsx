'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, BookOpen, Dumbbell, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/hooks/use-chat';
import type { CoachingState } from '@/lib/parser/types';

interface OnboardingBannerProps {
  state: CoachingState;
}

type BannerVariant = 'kickoff' | 'stories' | 'practice' | null;

function detectVariant(state: CoachingState): BannerVariant {
  if (state.storybank.length === 0) {
    return 'stories';
  }

  const hasActiveLoops = state.interviewLoops.some((loop) => {
    const status = loop.fields.find((f) => f.key.toLowerCase().includes('status'))?.value ?? '';
    return status.toLowerCase().includes('interviewing');
  });

  if (hasActiveLoops) {
    const recentScores = state.scoreHistory.recentScores;
    if (recentScores.length === 0) return 'practice';

    const lastDate = recentScores[recentScores.length - 1]?.date;
    if (lastDate) {
      const last = new Date(lastDate + 'T00:00:00');
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 3) return 'practice';
    }
  }

  return null;
}

const BANNER_DISMISSED_KEY = 'prepr-banner-dismissed';

const variants = {
  kickoff: {
    icon: Rocket,
    title: 'Welcome to Prepr!',
    description: "Let's set up your coaching profile to get personalized interview coaching.",
    cta: 'Start Kickoff',
    command: 'kickoff',
    iconColor: 'text-[var(--color-accent)]',
    iconBg: 'bg-[var(--color-accent-subtle)]',
  },
  stories: {
    icon: BookOpen,
    title: 'Build your story arsenal',
    description: 'Your storybank is empty. Great answers start with strong stories.',
    cta: 'Build Stories',
    command: 'stories',
    iconColor: 'text-[var(--color-success)]',
    iconBg: 'bg-[var(--color-success-subtle)]',
  },
  practice: {
    icon: Dumbbell,
    title: 'Time to get sharp',
    description: 'You have active interviews coming up. A quick practice session keeps your delivery fresh.',
    cta: 'Practice Now',
    command: 'practice',
    iconColor: 'text-[var(--color-accent)]',
    iconBg: 'bg-[var(--color-accent-subtle)]',
  },
};

export function OnboardingBanner({ state }: OnboardingBannerProps) {
  const router = useRouter();
  const { queueCommand } = useChat();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!stored) return false;
    const ts = parseInt(stored);
    return Date.now() - ts < 24 * 60 * 60 * 1000;
  });

  const variant = detectVariant(state);

  if (!variant || dismissed) return null;

  const config = variants[variant];
  const Icon = config.icon;

  const handleCTA = () => {
    queueCommand(config.command);
    router.push('/chat');
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
  };

  return (
    <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 md:p-6">
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5 pr-6">
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] shrink-0',
          config.iconBg
        )}>
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-0.5">
            {config.title}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] leading-relaxed">
            {config.description}
          </p>
        </div>

        <button
          onClick={handleCTA}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]',
            'bg-[var(--color-text-primary)] text-white',
            'text-sm font-semibold font-[family-name:var(--font-sans)]',
            'hover:opacity-90 transition-opacity',
            'shrink-0 cursor-pointer'
          )}
        >
          {config.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
