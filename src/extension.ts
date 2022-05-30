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

      const conf = vscode.workspace.getConfiguration();
      const json2tsConfig = conf.get(
        'json2any.json2ts'
      ) as Required<IJson2TsConfig>;
      const showJson2tsConfig = conf.get(
        'json2any.showJson2tsConfig'
      ) as boolean;
      let pro = Promise.resolve(json2tsConfig);
      if (showJson2tsConfig) {
        pro = vscode.window
          .showQuickPick(
            [
              {
                label: 'namespace',
                description: '是否添加 namespace',
                picked: json2tsConfig.namespace,
              },
              {
                label: 'prependWithI',
                description: '是否给每个类型添加前缀 I',
                picked: json2tsConfig.prependWithI,
              },
              {
                label: 'optionalFields',
                description: '是否将所有属性都置为可选',
                picked: json2tsConfig.optionalFields,
              },
              {
                label: 'addExport',
                description: '是否给每个类型添加 export',
                picked: json2tsConfig.addExport,
              },
              {
                label: 'useArrayGeneric',
                description: '是否使用 Array<T> 声明数组类型',
                picked: json2tsConfig.useArrayGeneric,
              },
              {
                label: 'sortAlphabetically',
                description: '是否按字母顺序排序属性',
                picked: json2tsConfig.sortAlphabetically,
              },
            ],
            {
              canPickMany: true,
            }
          )
          .then((res) => {
            if (Array.isArray(res)) {
              if (res.length === 0) {
                return {
                  ...json2tsConfig,
                  namespace: false,
                  prependWithI: false,
                  optionalFields: false,
                  addExport: false,
                  useArrayGeneric: false,
                  sortAlphabetically: false,
                };
              } else {
                const picked = res.map((item) => item.label);
                for (let key in json2tsConfig) {
                  // @ts-ignore
                  if (typeof json2tsConfig[key] === 'boolean') {
                    // @ts-ignore
                    json2tsConfig[key] =
                      picked.indexOf(key) > -1 ? true : false;
                  }
                }
                return json2tsConfig;
              }
            }

            return res;
          }) as any;
      }
      pro.then((config) => {
        // 失焦取消
        if (!config) {
          return;
        }
        try {
          const json2ts = new Json2Ts(config);
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
      });
    }
  });

  context.subscriptions.push(cssobj2css);
  context.subscriptions.push(obj2dts);
}

// this method is called when your extension is deactivated
export function deactivate() {}
