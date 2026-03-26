import { InterviewLoop } from '../types';
import { splitSubsections } from '../utils';

export function parseInterviewLoops(text: string): InterviewLoop[] {
  const subsections = splitSubsections(text);

  return subsections.map(({ title, body }) => {
    const fields = parseLoopFields(body);
    return { companyName: title, fields };
  });
}

/**
 * Parse the mixed-format fields in an interview loop section.
 * Handles:
 *   - Simple: `- Key: value`
 *   - Multi-line indented: `- Key:\n  - sub1\n  - sub2`
 *   - Round formats: `- Round formats:\n  - Round 1: ...`
 */
function parseLoopFields(text: string): { key: string; value: string }[] {
  const lines = text.split('\n');
  const result: { key: string; value: string }[] = [];
  let current: { key: string; value: string } | null = null;

  for (const line of lines) {
    if (line.trim() === '') {
      if (current) {
        result.push(current);
        current = null;
      }
      continue;
    }

    // Top-level bullet "- Key: value" (not indented)
    const topMatch = line.match(/^- (.+?):\s*(.*)/);
    if (topMatch && !line.startsWith('  ')) {
      if (current) result.push(current);
      current = { key: topMatch[1], value: topMatch[2] };
      continue;
    }

    // Indented continuation
    if (current && line.startsWith('  ')) {
      current.value = current.value
        ? current.value + '\n' + line.trimEnd()
        : line.trimEnd();
      continue;
    }

    // Fallback: attach to current
    if (current) {
      current.value = current.value
        ? current.value + '\n' + line.trimEnd()
        : line.trimEnd();
    }
  }
  if (current) result.push(current);
  return result;
}
