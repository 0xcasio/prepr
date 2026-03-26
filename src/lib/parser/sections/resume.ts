import { ResumeAnalysis } from '../types';
import { parseBulletList, parseNumberedSubItems, parseSubBullets } from '../utils';

export function parseResume(text: string): ResumeAnalysis {
  const bullets = parseBulletList(text);
  const find = (key: string) => bullets.find(b => b.key === key)?.value ?? '';

  return {
    positioningStrengths: parseNumberedSubItems(find('Positioning strengths')),
    likelyInterviewerConcerns: parseNumberedSubItems(find('Likely interviewer concerns')),
    careerNarrativeGaps: parseNumberedSubItems(find('Career narrative gaps')),
    storySeeds: parseSubBullets(find('Story seeds')),
  };
}
