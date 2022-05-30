// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Json2Ts, IJson2TsConfig } from './json2dts';
import { toCSS } from './json2css';

const replaceSelectionText = (val: string) => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    editor.edit((editBuilder) => {
      editBuilder.replace(
        new vscode.Range(selection.start, selection.end),
        val
      );
    });
  }
};

const replaceAllText = (val: string, start: number) => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    editor.edit((editBuilder) => {
      // 从开始到结束，全量替换
      const end = new vscode.Position(start, 0);
      editBuilder.replace(
        new vscode.Range(new vscode.Position(0, 0), end),
        val
      );
    });
  }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const cssobj2css = vscode.commands.registerCommand('cssobj2css', () => {
    // The code you place here will be executed every time your command is executed

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let text = editor.document.getText(selection);
      replaceSelectionText(toCSS(text));
    }
  });

  const obj2dts = vscode.commands.registerCommand('json2dts', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;

      let jsonInput = editor.document.getText(selection);
      const json2tsConfig = vscode.workspace
        .getConfiguration()
        .get('json2any.json2ts') as IJson2TsConfig;

      try {
        // TODO 配置项
        const json2ts = new Json2Ts(json2tsConfig);
        if (jsonInput) {
          const json = JSON.parse(jsonInput);
          const resultOutput = json2ts.convert(json);
          replaceSelectionText(resultOutput);
        } else {
          // 获取全量
          jsonInput = editor.document.getText();
          const json = JSON.parse(jsonInput);
          const resultOutput = json2ts.convert(json);
          replaceAllText(resultOutput, editor.document.lineCount + 1);
        }
      } catch (e) {
        vscode.window.showErrorMessage('不是json对象');
      }
    }
  });

  context.subscriptions.push(cssobj2css);
  context.subscriptions.push(obj2dts);
}

// this method is called when your extension is deactivated
export function deactivate() {}
