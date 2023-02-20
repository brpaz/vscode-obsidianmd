import { removeFrontmatter } from './frontmatter';

describe('removeFrontmatter', () => {
  it('removes frontmatter from Markdown file', () => {
    const markdown = `---
title: My Markdown File
date: 2023-02-20
---

# My Markdown File

This is some example content.
`;
    const expectedMarkdown = `
# My Markdown File

This is some example content.
`;
    const result = removeFrontmatter(markdown);
    expect(result).toEqual(expectedMarkdown);
  });

  it('does not remove anything if no frontmatter is present', () => {
    const markdown = `
        # My Markdown File

        This is some example content.
    `;
    const result = removeFrontmatter(markdown);
    expect(result).toEqual(markdown);
  });
});
