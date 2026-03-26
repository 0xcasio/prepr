import { StorybankEntry, StoryDetail } from '../types';
import { parseMarkdownTable, splitLevel4Sections, parseBulletList } from '../utils';

export function parseStorybankTable(text: string): StorybankEntry[] {
  const rows = parseMarkdownTable(text);
  return rows.map(r => ({
    id: r['ID'] ?? '',
    title: r['Title'] ?? '',
    primarySkill: r['Primary Skill'] ?? '',
    earnedSecret: r['Earned Secret'] ?? '',
    strength: r['Strength'] ?? '',
    lastUsed: r['Last Used'] ?? '',
  }));
}

export function parseStoryDetails(text: string): StoryDetail[] {
  // Find the "### Story Details" subsection body
  const detailsMatch = text.match(/^### Story Details\n([\s\S]*)/m);
  if (!detailsMatch) return [];

  const detailsBody = detailsMatch[1];
  const sections = splitLevel4Sections(detailsBody);

  return sections.map(({ title, body }) => {
    // title is like "S001 — Bold SEO/Web Conversion Lift + Career Community Launch"
    const idMatch = title.match(/^(S\d+)\s+[—–-]\s+(.+)/);
    const id = idMatch ? idMatch[1] : title;
    const storyTitle = idMatch ? idMatch[2] : title;

    const bullets = parseBulletList(body);
    const find = (key: string) => bullets.find(b => b.key === key)?.value ?? '';

    return {
      id,
      title: storyTitle,
      situation: find('Situation'),
      task: find('Task'),
      action: find('Action'),
      result: find('Result'),
      earnedSecret: find('Earned Secret'),
      deployFor: find('Deploy for'),
      versionHistory: find('Version history'),
    };
  });
}
