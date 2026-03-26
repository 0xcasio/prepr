import { InterviewLoop } from '../../parser/types';

export function serializeInterviewLoops(loops: InterviewLoop[]): string {
  return loops
    .map(loop => {
      const fieldsText = loop.fields
        .map(f => `- ${f.key}: ${f.value}`)
        .join('\n');
      return `### ${loop.companyName}\n${fieldsText}`;
    })
    .join('\n\n');
}
