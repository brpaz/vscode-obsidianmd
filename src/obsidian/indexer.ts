import { Document } from './models';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as fm from 'gray-matter';

const DEFAULT_IGNORE_FOLDERS = ['.obsidian', '.git', 'assets', '.trash'];
const FRONTMATTER_INCLUDE_KEY = 'brpaz.vscode-obsidianmd/include';

export interface IndexerOptions {
  excludeDirectories?: string[];
  onlyWithFrontMatterKey?: boolean;
}

export class Indexer {
  private documents: Document[] = [];

  private foldersToIgnore: string[];

  private onlyWithFrontMatterKey: boolean;

  constructor(private readonly vaultPath: string, private readonly options?: IndexerOptions) {
    this.vaultPath = vaultPath.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
    this.foldersToIgnore = options?.excludeDirectories || [];
    this.foldersToIgnore.push(...DEFAULT_IGNORE_FOLDERS);
    this.onlyWithFrontMatterKey = options?.onlyWithFrontMatterKey || false;
  }

  index() {
    console.log(`ObsidianMD: Indexing vault at: ${this.vaultPath}`);

    if (!fs.existsSync(this.vaultPath)) {
      throw new Error(`ObsidianMD: Vault path does not exist: ${this.vaultPath}`);
    }

    const files = this.readMarkdownFiles(this.vaultPath);

    for (const file of files) {
      const document = this.readFile(file);

      if (this.onlyWithFrontMatterKey) {
        if (!document.data[FRONTMATTER_INCLUDE_KEY]) {
          continue;
        }
      }
      this.documents.push(document);
    }

    this.documents.sort((a, b) => a.title.localeCompare(b.title));

    console.log(`ObsidianMD: Vault indexed with ${this.documents.length} documents`);
  }

  getDocuments(): Document[] {
    return this.documents;
  }

  getVaultName(): string {
    return path.basename(this.vaultPath);
  }

  /**
   * Recursively reads all Markdown files in a directory and its subdirectories.
   * @param dirPath The directory path to search for Markdown files.
   * @returns An array of Markdown file paths.
   */
  private readMarkdownFiles(dirPath: string): string[] {
    const markdownFiles: string[] = [];

    // Get all file names in the directory
    const fileNames = fs.readdirSync(dirPath);

    // Loop through each file name
    for (const fileName of fileNames) {
      // Get the full path of the file
      const filePath = path.join(dirPath, fileName);

      const inVaultPath = dirPath.replaceAll(this.vaultPath, '').replace('/', '');

      // Check if the file is in the ignore list
      const isExcluded = this.foldersToIgnore.some((excludedPath) => inVaultPath.startsWith(excludedPath));

      if (isExcluded) {
        console.log('ObsidianMD: Vault folder excluded:' + inVaultPath);
        continue;
      }

      // Check if the file is a directory
      if (fs.statSync(filePath).isDirectory()) {
        // Recursively call the function to read Markdown files in the subdirectory
        markdownFiles.push(...this.readMarkdownFiles(filePath));
      } else {
        // Check if the file is a Markdown file (.md extension)
        if (path.extname(filePath).toLowerCase() === '.md') {
          markdownFiles.push(filePath);
        }
      }
    }

    return markdownFiles;
  }

  private readFile(filePath: string): Document {
    const title = path.basename(filePath, '.md');
    const contents = fs.readFileSync(filePath, 'utf8');

    const frontMatter = fm(contents);

    return {
      title: title,
      filePath: filePath,
      location: path.dirname(filePath).replaceAll(this.vaultPath, '').replace('/', ''),
      data: frontMatter.data || {},
    };
  }
}
