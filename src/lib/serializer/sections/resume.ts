import { ResumeAnalysis } from '../../parser/types';

export function serializeResume(r: ResumeAnalysis): string {
  const numberedList = (items: string[]) =>
    items.map((item, i) => `  ${i + 1}. ${item}`).join('\n');
  const bulletList = (items: string[]) =>
    items.map(item => `  - ${item}`).join('\n');

  return [
    `- Positioning strengths:\n${numberedList(r.positioningStrengths)}`,
    `\n- Likely interviewer concerns:\n${numberedList(r.likelyInterviewerConcerns)}`,
    `\n- Career narrative gaps:\n${numberedList(r.careerNarrativeGaps)}`,
    `\n- Story seeds:\n${bulletList(r.storySeeds)}`,
  ].join('\n');
}
