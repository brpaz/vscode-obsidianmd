export function removeFrontmatter(markdown: string): string {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  return markdown.replace(frontmatterRegex, '');
}
