import * as vscode from "vscode";

import { SUPPORTED_PAIRS } from "./const";
import { getSelectionRange, getWordOrSelection } from "./utils";

async function promptChar(prompt: string): Promise<string | null> {
  const input = await vscode.window.showInputBox({ prompt });
  if (!input) return null;
  return input.trim()[0];
}

export function activate(context: vscode.ExtensionContext) {
  const add = vscode.commands.registerCommand("surround.add", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const surround = await promptChar("Enter surround character (e.g. ', \", (, {, [ ):");
    if (!surround) return;

    const close = SUPPORTED_PAIRS[surround] ?? surround;
    const sel = getWordOrSelection(editor);
    const text = editor.document.getText(sel);

    await editor.edit((edit) => {
      edit.replace(sel, `${surround}${text}${close}`);
    });
  });

  const remove = vscode.commands.registerCommand("surround.remove", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const removeChar = await promptChar("Enter surround character to remove (e.g. ', \", (, {, [ ):");
    if (!removeChar) {
        vscode.window.showInformationMessage("No character entered. Operation cancelled.");
        return;
    }

    const expectedClose = SUPPORTED_PAIRS[removeChar] ?? removeChar;

    const range = getSelectionRange(editor, removeChar, expectedClose);
    if (!range) {
      vscode.window.showInformationMessage("No matching surround found to remove.");
      return;
    }

    const surroundText = editor.document.getText(range);
    if (surroundText.startsWith(removeChar) && surroundText.endsWith(expectedClose)) {
      const inner = surroundText.slice(1, -1);
      await editor.edit((edit) => {
        edit.replace(range, inner);
      });
    } else {
      vscode.window.showInformationMessage("No matching surround found to remove.");
    }
  });

  const change = vscode.commands.registerCommand("surround.change", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const oldChar = await promptChar("Enter current surround character:");
    if (!oldChar) return;
    const newChar = await promptChar("Enter new surround character:");
    if (!newChar) return;

    const oldClose = SUPPORTED_PAIRS[oldChar] ?? oldChar;
    const newClose = SUPPORTED_PAIRS[newChar] ?? newChar;

    const range = getSelectionRange(editor, oldChar, oldClose);
    if (!range) {
        vscode.window.showInformationMessage("No matching surround found to change.");
        return;
    }
    
    const surroundText = editor.document.getText(range);
    if (surroundText.startsWith(oldChar) && surroundText.endsWith(oldClose)) {
        const inner = surroundText.slice(1, -1);
        await editor.edit((edit) => {
            edit.replace(range, `${newChar}${inner}${newClose}`);
        }
        );
    } else {
        vscode.window.showInformationMessage("No matching surround found to change.");
    }
  });

  context.subscriptions.push(add, remove, change);
}

export function deactivate() {}
