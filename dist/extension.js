/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {


// https://github.com/beshanoe/json2ts
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Json2Ts = void 0;
class Json2Ts {
    constructor(config = {}) {
        this.interfaces = {};
        this.config = {
            // 每个属性都加I
            prependWithI: true,
            // 字母顺序排序
            sortAlphabetically: false,
            // 添加export
            addExport: false,
            // 使用Array<T>
            useArrayGeneric: false,
            // 全部可选
            optionalFields: false,
            // 类型前缀 类似于namespace功能
            prefix: '',
            // 根节点名称
            rootObjectName: 'RootObject',
            ...config,
        };
    }
    convert(json) {
        this.interfaces = {};
        this.unknownToTS(json);
        return this.interfacesToString();
    }
    unknownToTS(value, key = void 0) {
        let type = typeof value;
        if (type === 'object') {
            if (Array.isArray(value)) {
                type = this.arrayToTS(value, key);
            }
            else {
                type = this.objectToTS(value, key && this.capitalizeFirst(key));
            }
        }
        return type;
    }
    arrayToTS(array, key = void 0) {
        let type = array.length ? void 0 : 'any';
        for (let item of array) {
            const itemType = this.unknownToTS(item, this.keyToTypeName(key));
            if (type && itemType !== type) {
                type = 'any';
                break;
            }
            else {
                type = itemType;
            }
        }
        return this.config.useArrayGeneric ? `Array<${type}>` : `${type}[]`;
    }
    keyToTypeName(key = void 0) {
        if (!key || key.length < 2) {
            return key;
        }
        const [first, ...rest] = Array.prototype.slice.apply(key);
        const last = rest.pop();
        return [first.toUpperCase(), ...rest, last === 's' ? '' : last].join('');
    }
    capitalizeFirst(str) {
        const [first, ...rest] = Array.prototype.slice.apply(str);
        return [first.toUpperCase(), ...rest].join('');
    }
    objectToTS(obj, type = this.config.rootObjectName) {
        if (obj === null) {
            return 'any';
        }
        const { prependWithI, prefix } = this.config;
        if (prependWithI) {
            type = `I${prefix || ''}${type}`;
        }
        if (!this.interfaces[type]) {
            this.interfaces[type] = {};
        }
        const interfaceName = this.interfaces[type];
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const fieldType = this.unknownToTS(value, key);
            if (!interfaceName[key] || interfaceName[key].indexOf('any') === 0) {
                interfaceName[key] = fieldType;
            }
        });
        return type;
    }
    interfacesToString() {
        const { sortAlphabetically, addExport, optionalFields } = this.config;
        return Object.keys(this.interfaces)
            .map((name) => {
            const interfaceStr = [
                `${addExport ? 'export ' : ''}interface ${name} {`,
            ];
            const fields = Object.keys(this.interfaces[name]);
            if (sortAlphabetically) {
                fields.sort();
            }
            fields.forEach((field) => {
                const type = this.interfaces[name][field];
                interfaceStr.push(`  ${field}${optionalFields ? '?' : ''}: ${type};`);
            });
            interfaceStr.push('}\n');
            return interfaceStr.join('\n');
        })
            .join('\n');
    }
}
exports.Json2Ts = Json2Ts;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCSS = void 0;
function toCSS(str) {
    const cssArray = str.split(',');
    const newCssArray = cssArray.map((item) => {
        if (item) {
            let [name, value] = item.split(':');
            name = name.replace(/[A-Z]/g, function (match) {
                return '-' + match.toLowerCase();
            });
            value = value.replace(/'/g, '');
            return `${name}:${value}`;
        }
        return item;
    });
    return newCssArray.join(';');
}
exports.toCSS = toCSS;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const json2dts_1 = __webpack_require__(2);
const json2css_1 = __webpack_require__(3);
const replaceSelectionText = (val) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        editor.edit((editBuilder) => {
            editBuilder.replace(new vscode.Range(selection.start, selection.end), val);
        });
    }
};
const replaceAllText = (val, start) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.edit((editBuilder) => {
            // 从开始到结束，全量替换
            const end = new vscode.Position(start, 0);
            editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), val);
        });
    }
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
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
            replaceSelectionText((0, json2css_1.toCSS)(text));
        }
    });
    const obj2dts = vscode.commands.registerCommand('json2dts', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            let jsonInput = editor.document.getText(selection);
            const json2tsConfig = vscode.workspace
                .getConfiguration()
                .get('vscodePluginBtrip.json2ts');
            try {
                // TODO 配置项
                const json2ts = new json2dts_1.Json2Ts(json2tsConfig);
                if (jsonInput) {
                    const json = JSON.parse(jsonInput);
                    const resultOutput = json2ts.convert(json);
                    replaceSelectionText(resultOutput);
                }
                else {
                    // 获取全量
                    jsonInput = editor.document.getText();
                    const json = JSON.parse(jsonInput);
                    const resultOutput = json2ts.convert(json);
                    replaceAllText(resultOutput, editor.document.lineCount + 1);
                }
            }
            catch (e) {
                vscode.window.showErrorMessage('不是json对象');
            }
        }
    });
    context.subscriptions.push(cssobj2css);
    context.subscriptions.push(obj2dts);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map