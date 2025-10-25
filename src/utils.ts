import * as vscode from 'vscode';

export function getWordOrSelection(editor: vscode.TextEditor): vscode.Selection {
  const { selection, document } = editor;
  if (!selection.isEmpty) return selection;

  const wordRange = document.getWordRangeAtPosition(selection.active);
  return wordRange
    ? new vscode.Selection(wordRange.start, wordRange.end)
    : selection;
}

export const getSelectionRange = (editor: vscode.TextEditor, charOne: string, charTwo: string): vscode.Range | null => {
    const sel = getWordOrSelection(editor);

    console.log(`Selected Text: "${editor.document.getText(sel)}", Selection Start: ${sel.start.character}, Selection End: ${sel.end.character}`);

    // i need to find text to the left and right of the selection to find the surrounding characters. I can use the document.getText() method to get the text of the entire line and then slice it based on the selection start and end positions.
    const lineText = editor.document.lineAt(sel.start.line).text;

    console.log(`Line Text: "${lineText}"`);

    const leftText = lineText.slice(0, sel.start.character);
    const rightText = lineText.slice(sel.end.character);

    const leftIndex = leftText.lastIndexOf(charOne);
    const rightIndex = rightText.indexOf(charTwo);

    console.log(`Left Text: "${leftText}", Right Text: "${rightText}"`);

    if (leftIndex === -1 || rightIndex === -1) {
      return null;
    }
    
    const start = new vscode.Position(sel.start.line, leftIndex);
    const end = new vscode.Position(sel.end.line, sel.end.character + rightIndex + charTwo.length);
    const range = new vscode.Range(start, end);

    return range;
}