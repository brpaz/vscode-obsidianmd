// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SearchCommand from './commands/search.command';

const EXTENSION_ID = 'obsidianmd';

import { Indexer } from './obsidian/indexer';

let indexer: Indexer;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(`Init extension: ${EXTENSION_ID}`);

  indexer = initIndexer();
  indexer.index();

  const searchCommand = new SearchCommand(indexer);

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(EXTENSION_ID)) {
      console.log(`Config changed: ${EXTENSION_ID}`);
      initIndexer();
      indexer.index();
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('obsidianmd.index', () => {
      vscode.window.showInformationMessage('Indexing vault');
      indexer.index();
      vscode.window.showInformationMessage('Vault indexed');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('obsidianmd.search', () => {
      searchCommand.run();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('obsidianmd.openNoteInPanel', () => {
      console.log('open note');
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log(`Deactivate extension: ${EXTENSION_ID} `);
}

function initIndexer(): Indexer {
  const config = vscode.workspace.getConfiguration(EXTENSION_ID);
  const vaultPath = config.get<string>('vaultPath') || '';
  const indexer = new Indexer(vaultPath, {
    excludeDirectories: config.get<string[]>('excludedDirectories') || [],
    onlyWithFrontMatterKey: config.get<boolean>('onlyWithFrontMatterKey') || false,
  });

  return indexer;
}
