import { Indexer } from './indexer';
import * as path from 'path';
import { Document } from './models';

const TEST_VAULT_PATH = path.join(__dirname, '..', '..', 'test', 'fixtures', 'test-vault');

describe('Indexer', () => {
  describe('Default Indexer', () => {
    let indexer: Indexer;
    const expectedDocuments: Document[] = [
      {
        title: 'File 1',
        filePath: path.join(TEST_VAULT_PATH, 'folder1', 'File 1.md'),
        location: 'folder1',
        data: {},
      },
      {
        title: 'File 2',
        filePath: path.join(TEST_VAULT_PATH, 'folder1', 'File 2.md'),
        location: 'folder1',
        data: {},
      },
      {
        title: 'File with metadata',
        filePath: path.join(TEST_VAULT_PATH, 'folder2', 'nested-folder', 'File with metadata.md'),
        location: 'folder2/nested-folder',
        data: {
          'brpaz.vscode-obsidianmd/include': true,
          tags: ['tag1', 'tag2'],
        },
      },
    ];
    beforeEach(() => {
      indexer = new Indexer(TEST_VAULT_PATH);
    });
    it('indexes an Obsidian vault', () => {
      indexer.index();

      const documents = indexer.getDocuments();
      expect(documents.length).toBe(3);

      expect(documents).toEqual(expectedDocuments);
    });
  });

  describe('With Excluded directories', () => {
    let indexer: Indexer;
    const expectedDocuments: Document[] = [
      {
        title: 'File with metadata',
        filePath: path.join(TEST_VAULT_PATH, 'folder2', 'nested-folder', 'File with metadata.md'),
        location: 'folder2/nested-folder',
        data: {
          'brpaz.vscode-obsidianmd/include': true,
          tags: ['tag1', 'tag2'],
        },
      },
    ];
    it('excludes folders configured in the excludedDirectories option', () => {
      indexer = new Indexer(TEST_VAULT_PATH, {
        excludeDirectories: ['folder1'],
      });
      indexer.index();

      const documents = indexer.getDocuments();
      expect(documents.length).toBe(1);

      expect(documents).toEqual(expectedDocuments);
    });
  });

  describe('With onlyWithFrontMatterKey option', () => {
    let indexer: Indexer;

    it('includes files only with frontmatter key if option is set', () => {
      indexer = new Indexer(TEST_VAULT_PATH, {
        onlyWithFrontMatterKey: true,
      });
      indexer.index();

      const documents = indexer.getDocuments();
      expect(documents.length).toBe(1);
      expect(documents[0].title).toBe('File with metadata');
    });
  });
});
