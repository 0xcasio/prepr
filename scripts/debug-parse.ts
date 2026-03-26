/**
 * debug-parse.ts
 *
 * Reads your coaching_state.md, runs it through the parser,
 * and prints a human-readable summary so you can verify nothing was lost.
 *
 * Usage:
 *   npm run debug-parse
 *   npm run debug-parse -- --json      (dump full raw JSON instead)
 */

import fs from 'fs';
import path from 'path';
import { parse } from '../src/lib/parser/index';

const STATE_FILE = path.resolve(__dirname, '../../coaching_state.md');
const RAW_JSON = process.argv.includes('--json');

// ── Load file ────────────────────────────────────────────────────────────────
if (!fs.existsSync(STATE_FILE)) {
  console.error(`\n❌  Could not find coaching_state.md at:\n   ${STATE_FILE}\n`);
  process.exit(1);
}

const markdown = fs.readFileSync(STATE_FILE, 'utf-8');
const state = parse(markdown);

// ── Raw JSON mode ─────────────────────────────────────────────────────────────
if (RAW_JSON) {
  console.log(JSON.stringify(state, null, 2));
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const line = (label: string, value: unknown) => {
  const val = value === undefined || value === null || value === '' ? '(empty)' : String(value);
  console.log(`  ${label.padEnd(28)} ${val}`);
};

const count = (arr: unknown[] | undefined) =>
  arr ? `${arr.length} item${arr.length !== 1 ? 's' : ''}` : '(empty)';

const fieldVal = (fields: { key: string; value: string }[] | undefined, key: string) =>
  fields?.find(f => f.key.toLowerCase().includes(key.toLowerCase()))?.value ?? '(not found)';

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log(`  Coaching State — ${state.name || '(name not found)'}`);
console.log(`  Last updated: ${state.lastUpdated || '(not set)'}`);
console.log('══════════════════════════════════════════════════\n');

// Profile
console.log('▸ Profile');
line('Target role(s)', state.profile?.targetRoles);
line('Seniority band', state.profile?.seniorityBand);
line('Track', state.profile?.track);
line('Interview timeline', state.profile?.interviewTimeline);
line('Time-aware mode', state.profile?.timeAwareMode);
line('Feedback directness', state.profile?.feedbackDirectness);
line('Biggest concern', state.profile?.biggestConcern);

// Resume
console.log('\n▸ Resume Analysis');
line('Positioning strengths', count(state.resumeAnalysis?.positioningStrengths));
line('Interviewer concerns', count(state.resumeAnalysis?.likelyInterviewerConcerns));
line('Career narrative gaps', count(state.resumeAnalysis?.careerNarrativeGaps));
line('Story seeds', count(state.resumeAnalysis?.storySeeds));

// Storybank
console.log('\n▸ Storybank');
line('Stories (index rows)', count(state.storybank));
line('Story details (full)', count(state.storyDetails));
if (state.storybank?.length) {
  state.storybank.forEach(s =>
    console.log(`    ${s.id.padEnd(6)}  ${s.title.padEnd(40)}  [${s.primarySkill}]`)
  );
}

// Scores
console.log('\n▸ Score History');
line('Score rows', count(state.scoreHistory?.recentScores));
line('Has historical summary', state.scoreHistory?.historicalSummary ? 'yes' : 'no');
if (state.scoreHistory?.recentScores?.length) {
  const latest = state.scoreHistory.recentScores[state.scoreHistory.recentScores.length - 1];
  console.log(`    Latest: ${latest.date}  ${latest.context}  Sub:${latest.sub} Str:${latest.str} Rel:${latest.rel} Cred:${latest.cred} Diff:${latest.diff}`);
}

// Outcomes
console.log('\n▸ Outcome Log');
line('Outcome rows', count(state.outcomeLog));
if (state.outcomeLog?.length) {
  state.outcomeLog.forEach(o =>
    console.log(`    ${o.date}  ${o.company.padEnd(20)}  ${o.round.padEnd(12)}  ${o.result}`)
  );
}

// Interview Intelligence
console.log('\n▸ Interview Intelligence');
line('Questions in bank', count(state.interviewIntelligence?.questionBank));
line('Effective patterns', count(state.interviewIntelligence?.effectivePatterns));
line('Ineffective patterns', count(state.interviewIntelligence?.ineffectivePatterns));
line('Recruiter feedback rows', count(state.interviewIntelligence?.recruiterFeedback));
line('Company patterns', count(state.interviewIntelligence?.companyPatterns));

// Drills
console.log('\n▸ Drill Progression');
line('Current stage', state.drillProgression?.currentStage);
line('Gates passed', state.drillProgression?.gatesPassed);
line('Revisit queue', state.drillProgression?.revisitQueue);

// Interview Loops
console.log('\n▸ Interview Loops');
line('Active loops', count(state.interviewLoops));
if (state.interviewLoops?.length) {
  state.interviewLoops.forEach(l => {
    const status = fieldVal(l.fields, 'status');
    const next   = fieldVal(l.fields, 'next round');
    console.log(`    ${l.companyName.padEnd(24)}  status: ${status.padEnd(16)}  next: ${next}`);
  });
}

// Strategy
console.log('\n▸ Active Coaching Strategy');
if (state.activeStrategy?.fields?.length) {
  state.activeStrategy.fields.slice(0, 4).forEach(f =>
    console.log(`    ${f.key.padEnd(26)}  ${f.value.slice(0, 60)}${f.value.length > 60 ? '…' : ''}`)
  );
} else {
  console.log('    (empty)');
}

// Meta / Sessions / Notes
console.log('\n▸ Misc');
line('Meta-check rows', count(state.metaCheckLog));
line('Session log rows', count(state.sessionLog?.recentSessions));
line('Coaching notes', count(state.coachingNotes));

console.log('\n══════════════════════════════════════════════════');
console.log('  ✅  Parse complete — no errors thrown');
console.log('  Tip: run with --json flag for the full data object');
console.log('══════════════════════════════════════════════════\n');
