/**
 * Serialize a typed array into a markdown pipe table.
 * Always includes the separator row.
 */
export function serializeMarkdownTable(
  headers: string[],
  rows: string[][]
): string {
  if (rows.length === 0 && headers.length === 0) return '';

  const headerRow = '| ' + headers.join(' | ') + ' |';
  const sepRow = '|' + headers.map(h => '-'.repeat(h.length + 2)).join('|') + '|';
  const dataRows = rows.map(r => '| ' + r.map(c => c ?? '').join(' | ') + ' |');

  return [headerRow, sepRow, ...dataRows].join('\n');
}
