import { DrillProgression } from '../../parser/types';

export function serializeDrillProgression(d: DrillProgression): string {
  return [
    `- Current stage: ${d.currentStage}`,
    `- Gates passed: ${d.gatesPassed}`,
    `- Revisit queue: ${d.revisitQueue}`,
  ].join('\n');
}
