/**
 * Shared parser utilities.
 */

/**
 * Split a markdown document on `## ` section headings.
 * Returns a map of section title → section body (text after the heading line,
 * up to (but not including) the next `## ` heading).
 */
export function splitTopSections(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  // Split on lines that start with "## "
  const parts = markdown.split(/^## /m);
  for (const part of parts.slice(1)) {
    const newlineIdx = part.indexOf('\n');
    const title = newlineIdx === -1 ? part.trim() : part.slice(0, newlineIdx).trim();
    const body = newlineIdx === -1 ? '' : part.slice(newlineIdx + 1);
    // If duplicate title (e.g. two "### Company Patterns"), append body
    if (map.has(title)) {
      map.set(title, map.get(title)! + body);
    } else {
      map.set(title, body);
    }
  }
  return map;
}

/**
 * Split a section body on `### ` sub-headings.
 * Returns array of { title, body } in order.
 */
export function splitSubsections(text: string): { title: string; body: string }[] {
  const results: { title: string; body: string }[] = [];
  const parts = text.split(/^### /m);
  for (const part of parts.slice(1)) {
    const newlineIdx = part.indexOf('\n');
    const title = newlineIdx === -1 ? part.trim() : part.slice(0, newlineIdx).trim();
    const body = newlineIdx === -1 ? '' : part.slice(newlineIdx + 1);
    results.push({ title, body });
  }
  return results;
}

/**
 * Split on `#### ` sub-sub-headings.
 */
export function splitLevel4Sections(text: string): { title: string; body: string }[] {
  const results: { title: string; body: string }[] = [];
  const parts = text.split(/^#### /m);
  for (const part of parts.slice(1)) {
    const newlineIdx = part.indexOf('\n');
    const title = newlineIdx === -1 ? part.trim() : part.slice(0, newlineIdx).trim();
    const body = newlineIdx === -1 ? '' : part.slice(newlineIdx + 1);
    results.push({ title, body });
  }
  return results;
}

/**
 * Parse a markdown pipe table into an array of row objects.
 * Handles tables with or without the separator row (|---|---|...|).
 * Column names come from the first `|...|` line found.
 */
export function parseMarkdownTable(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length === 0) return [];

  const headerLine = lines[0];
  const headers = splitTableRow(headerLine);

  // Detect separator row (contains only dashes, colons, pipes, spaces)
  let dataStart = 1;
  if (lines.length > 1 && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[1])) {
    dataStart = 2;
  }

  return lines.slice(dataStart).map(line => {
    const cells = splitTableRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}

/**
 * Split a table row string `| a | b | c |` into trimmed cell values.
 */
function splitTableRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map(c => c.trim());
}

/**
 * Parse a `- Key: value` bullet list.
 * Handles multi-line values (indented continuation lines).
 * Returns ordered array of { key, value }.
 */
export function parseBulletList(text: string): { key: string; value: string }[] {
  const lines = text.split('\n');
  const result: { key: string; value: string }[] = [];
  let current: { key: string; value: string } | null = null;

  for (const line of lines) {
    // Top-level bullet: "- Key: value" or "- Key:"
    const topMatch = line.match(/^- (.+?):\s*(.*)/);
    if (topMatch) {
      if (current) result.push(current);
      current = { key: topMatch[1], value: topMatch[2] };
      continue;
    }
    // Indented continuation (sub-items or wrapped value)
    if (current && /^  +/.test(line) && line.trim() !== '') {
      current.value = current.value
        ? current.value + '\n' + line.trimEnd()
        : line.trimEnd();
      continue;
    }
    // Blank line — push current and reset
    if (line.trim() === '') {
      if (current) {
        result.push(current);
        current = null;
      }
    }
  }
  if (current) result.push(current);
  return result;
}

/**
 * Parse numbered or bulleted sub-items under a top-level `- Key:` bullet.
 * Given the value string (which may contain `\n  1. item` lines), returns the items.
 */
export function parseNumberedSubItems(value: string): string[] {
  if (!value.trim()) return [];
  const lines = value.split('\n');
  const items: string[] = [];
  for (const line of lines) {
    const match = line.trim().match(/^\d+\.\s+(.+)/);
    if (match) items.push(match[1]);
    else if (line.trim().startsWith('- ') || line.trim().match(/^[A-Z*]/)) {
      // fallback: treat as raw value
      items.push(line.trim());
    }
  }
  return items;
}

/**
 * Parse sub-bullets (lines starting with `  - `) under a top-level bullet.
 */
export function parseSubBullets(value: string): string[] {
  if (!value.trim()) return [];
  const lines = value.split('\n');
  const items: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s+-\s+(.+)/);
    if (m) items.push(m[1]);
    else if (line.trim()) items.push(line.trim());
  }
  return items;
}
