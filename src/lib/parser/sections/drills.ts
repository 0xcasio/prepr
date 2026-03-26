import { DrillProgression } from '../types';
import { parseBulletList } from '../utils';

export function parseDrillProgression(text: string): DrillProgression {
  const bullets = parseBulletList(text);
  const find = (key: string) => bullets.find(b => b.key === key)?.value ?? '';

  return {
    currentStage: find('Current stage'),
    gatesPassed: find('Gates passed'),
    revisitQueue: find('Revisit queue'),
  };
}
