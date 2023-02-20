import { window, env, QuickInputButton, QuickPickItem, ThemeIcon, ViewColumn, QuickPickItemButtonEvent } from 'vscode';
import { Indexer } from '../obsidian/indexer';
import { marked } from 'marked';
import admonition from 'marked-admonition-extension';
import * as fs from 'fs';
import { Document } from '../obsidian/models';
import { removeFrontmatter } from '../utils/frontmatter';

marked.use(admonition);

class DocumentQuickPickItem implements QuickPickItem {
  document: Document;
  label: string;
  detail: string;
  buttons?: QuickInputButton[];

  constructor(doc: Document) {
    this.document = doc;
    this.label = doc.title;
    this.detail = doc.location;
    this.buttons = [
      {
        iconPath: new ThemeIcon('link-external'),
        tooltip: 'Open in Obsidian',
      },
    ];
  }
}

export default class SearchCommand {
  constructor(private readonly indexer: Indexer) {}

  public async run() {
    const documents = this.indexer.getDocuments();
    const items = documents.map((doc) => new DocumentQuickPickItem(doc));

    const quickPick = window.createQuickPick();
    quickPick.items = items;
    quickPick.placeholder = 'Search in Vault';
    quickPick.matchOnDetail = true;
    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0] as DocumentQuickPickItem;
      if (selected) {
        const document = selected.document;
        const panel = window.createWebviewPanel('Obsidian Preview', document.title, ViewColumn.Beside, {
          enableFindWidget: true,
        });

        panel.webview.html = this.getHtmlForWebview(document.filePath);
        panel.reveal();
      }
    });

    quickPick.onDidTriggerItemButton((e: QuickPickItemButtonEvent<QuickPickItem>) => {
      const selected = e.item as DocumentQuickPickItem;

      if (selected) {
        const document = selected.document;

        const obsidianUri = `obsidian://open?path=${encodeURIComponent(document.filePath)}`;

        // Uglu hack to get around wrong url encoding by vscode URI#parse.
        // See: https://github.com/microsoft/vscode/issues/85930
        // See: https://github.com/microsoft/vscode/issues/83645
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        env.openExternal(obsidianUri);
        quickPick.dispose();
      }
    });

    quickPick.show();
  }

  private getHtmlForWebview(filePath: string): string {
    let contents = fs.readFileSync(filePath, 'utf8');
    contents = removeFrontmatter(contents);
    return marked(contents);
  }
}
