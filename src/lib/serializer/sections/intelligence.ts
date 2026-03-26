import { InterviewIntelligence } from '../../parser/types';
import { serializeMarkdownTable } from '../utils';

export function serializeInterviewIntelligence(intel: InterviewIntelligence): string {
  // Question Bank
  const qbHeaders = ['Date', 'Company', 'Role', 'Round Type', 'Question', 'Competency', 'Score', 'Outcome'];
  const qbRows = intel.questionBank.map(q => [
    q.date, q.company, q.role, q.roundType, q.question, q.competency, q.score, q.outcome,
  ]);
  const qbTable = serializeMarkdownTable(qbHeaders, qbRows);

  // Effective / Ineffective patterns
  const effective = intel.effectivePatterns.map(p => `- ${p}`).join('\n');
  const ineffective = intel.ineffectivePatterns.map(p => `- ${p}`).join('\n');

  // Recruiter feedback
  const rfHeaders = ['Date', 'Company', 'Source', 'Feedback', 'Linked Dimension'];
  const rfRows = intel.recruiterFeedback.map(r => [r.date, r.company, r.source, r.feedback, r.linkedDimension]);
  const rfTable = serializeMarkdownTable(rfHeaders, rfRows);

  // Company patterns (merged into one section)
  const cpParts = intel.companyPatterns.map(cp => {
    const bullets = cp.bullets.map(b => `- ${b}`).join('\n');
    return `#### ${cp.company}\n${bullets}`;
  });
  const cpSection = `### Company Patterns\n${cpParts.join('\n\n')}`;

  const historicalSummary = intel.historicalSummary || 'None yet.';

  return [
    `### Question Bank`,
    qbTable,
    `\n### Effective Patterns (what works for this candidate)`,
    effective,
    `\n### Ineffective Patterns (what keeps not working)`,
    ineffective,
    `\n### Recruiter/Interviewer Feedback`,
    rfTable,
    `\n${cpSection}`,
    `\n### Historical Intelligence Summary`,
    historicalSummary,
  ].join('\n');
}
