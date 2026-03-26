import { InterviewIntelligence, QuestionBankEntry, RecruiterFeedbackEntry, CompanyPattern } from '../types';
import { splitSubsections, parseMarkdownTable, splitLevel4Sections } from '../utils';

export function parseInterviewIntelligence(text: string): InterviewIntelligence {
  const subsections = splitSubsections(text);

  let questionBank: QuestionBankEntry[] = [];
  let effectivePatterns: string[] = [];
  let ineffectivePatterns: string[] = [];
  let recruiterFeedback: RecruiterFeedbackEntry[] = [];
  const companyPatterns: CompanyPattern[] = [];
  let historicalSummary = '';

  for (const { title, body } of subsections) {
    if (title === 'Question Bank') {
      const rows = parseMarkdownTable(body);
      questionBank = rows.map(r => ({
        date: r['Date'] ?? '',
        company: r['Company'] ?? '',
        role: r['Role'] ?? '',
        roundType: r['Round Type'] ?? '',
        question: r['Question'] ?? '',
        competency: r['Competency'] ?? '',
        score: r['Score'] ?? '',
        outcome: r['Outcome'] ?? '',
      }));
    } else if (title.startsWith('Effective Patterns')) {
      effectivePatterns = parseBulletLines(body);
    } else if (title.startsWith('Ineffective Patterns')) {
      ineffectivePatterns = parseBulletLines(body);
    } else if (title === 'Recruiter/Interviewer Feedback') {
      const rows = parseMarkdownTable(body);
      recruiterFeedback = rows.map(r => ({
        date: r['Date'] ?? '',
        company: r['Company'] ?? '',
        source: r['Source'] ?? '',
        feedback: r['Feedback'] ?? '',
        linkedDimension: r['Linked Dimension'] ?? '',
      }));
    } else if (title === 'Company Patterns') {
      // May appear multiple times — collect all #### subsections
      const companies = splitLevel4Sections(body);
      for (const { title: companyName, body: companyBody } of companies) {
        const existing = companyPatterns.find(c => c.company === companyName);
        if (existing) {
          existing.bullets.push(...parseBulletLines(companyBody));
        } else {
          companyPatterns.push({
            company: companyName,
            bullets: parseBulletLines(companyBody),
          });
        }
      }
    } else if (title === 'Historical Intelligence Summary') {
      historicalSummary = body.trim();
    }
  }

  return {
    questionBank,
    effectivePatterns,
    ineffectivePatterns,
    recruiterFeedback,
    companyPatterns,
    historicalSummary,
  };
}

/** Parse `- date: text` or `- text` bullet lines, returning each full bullet value */
function parseBulletLines(text: string): string[] {
  return text
    .split('\n')
    .filter(l => l.trimStart().startsWith('- '))
    .map(l => l.trimStart().slice(2).trimEnd());
}
