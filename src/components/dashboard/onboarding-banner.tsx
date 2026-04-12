'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, BookOpen, Dumbbell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/hooks/use-chat';
import type { CoachingState } from '@/lib/parser/types';

interface OnboardingBannerProps {
  state: CoachingState;
}

type BannerVariant = 'kickoff' | 'stories' | 'practice' | null;

function detectVariant(state: CoachingState): BannerVariant {
  // No storybank at all → suggest building stories
  if (state.storybank.length === 0) {
    return 'stories';
  }

  // Has active loops but no recent practice (check score history)
  const hasActiveLoops = state.interviewLoops.some((loop) => {
    const status = loop.fields.find((f) => f.key.toLowerCase().includes('status'))?.value ?? '';
    return status.toLowerCase().includes('interviewing');
  });

  if (hasActiveLoops) {
    const recentScores = state.scoreHistory.recentScores;
    if (recentScores.length === 0) return 'practice';

    // Check if last practice was more than 3 days ago
    const lastDate = recentScores[recentScores.length - 1]?.date;
    if (lastDate) {
      const last = new Date(lastDate + 'T00:00:00');
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 3) return 'practice';
    }
  }

  // Everything looks healthy — no banner
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
    gradient: 'from-[var(--color-accent)] to-blue-600',
  },
  stories: {
    icon: BookOpen,
    title: 'Build your story arsenal',
    description: "Your storybank is empty. Great interview answers start with strong stories — let's build yours.",
    cta: 'Build Stories',
    command: 'stories',
    gradient: 'from-emerald-500 to-teal-600',
  },
  practice: {
    icon: Dumbbell,
    title: 'Time to get sharp',
    description: "You have active interviews coming up. A quick practice session keeps your delivery fresh.",
    cta: 'Practice Now',
    command: 'practice',
    gradient: 'from-purple-500 to-indigo-600',
  },
};

export function OnboardingBanner({ state }: OnboardingBannerProps) {
  const router = useRouter();
  const { queueCommand } = useChat();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!stored) return false;
    // Auto-expire dismissal after 24 hours
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
    <div className={cn(
      'relative rounded-[var(--radius-lg)] overflow-hidden',
      'bg-gradient-to-r', config.gradient,
      'p-6 md:p-8 text-white'
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 right-24 w-24 h-24 bg-white/5 rounded-full -mb-8" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-[var(--radius-sm)] hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 shrink-0">
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold font-[family-name:var(--font-sans)] mb-1">
            {config.title}
          </h3>
          <p className="text-sm text-white/85 font-[family-name:var(--font-body)] leading-relaxed">
            {config.description}
          </p>
        </div>

        <button
          onClick={handleCTA}
          className={cn(
            'px-5 py-2.5 rounded-[var(--radius-md)]',
            'bg-white text-gray-900',
            'text-sm font-semibold font-[family-name:var(--font-sans)]',
            'hover:bg-white/90 transition-colors',
            'shrink-0 cursor-pointer'
          )}
        >
          {config.cta}
        </button>
      </div>
    </div>
  );
}
