/**
 * COPYRIGHT 2017 Atishay Jain<contact@atishay.me>
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';
import * as vscode from 'vscode';
import { CompletionItemProvider } from './CompletionItemProvider';
import { Settings } from './Settings';
import { shouldExcludeFile } from './Utils';
import { DocumentManager, wordLists } from './DocumentManager';
import { TextDocument, workspace, TextDocumentChangeEvent, window } from "vscode";

let content: string[] = [];
/**
 * Utility class to manage the active document
 *
 * @class ActiveDocManager
 */
class ActiveDocManager {
    static updateContent() {
        if (!window.activeTextEditor || !window.activeTextEditor.document) {
            return;
        }
        content = [];
        let doc = window.activeTextEditor.document;
        if (shouldExcludeFile(doc.uri)) {
            return;
        }
        for (let i = 0; i < doc.lineCount; ++i) {
            content.push(doc.lineAt(i).text);
        }
    }
    /**
     * Handle content changes to active document
     *
     * @static
     * @param {TextDocumentChangeEvent} e
     * @returns
     *
     * @memberof ActiveDocManager
     */
    static handleContentChange(e: TextDocumentChangeEvent) {
        const wordList = wordLists.get(e.document);
        if (!wordList) {
            console.log("No index found");
            return;
        }
        if (!window.activeTextEditor || !window.activeTextEditor.document && e.document !== window.activeTextEditor.document) {
            console.log("Unexpected Active Doc. Parsing broken");
            return;
        }

        if (e.contentChanges.length === 1 && e.contentChanges[0].range.isSingleLine) {
            const lineNum = e.contentChanges[0].range.start.line;
            const newLineText = window.activeTextEditor.document.lineAt(lineNum).text;
            content[lineNum]?.split(Settings.whitespaceSplitter(window.activeTextEditor.document.languageId)).forEach((string) => {
                wordList.splice(wordList.indexOf(string), 1);
            })
            newLineText.split(Settings.whitespaceSplitter(window.activeTextEditor.document.languageId)).forEach((string) => {
                wordList.push(string);
            });
            content[lineNum] = newLineText;
        } else {
          DocumentManager.resetDocument(e.document);
          ActiveDocManager.updateContent();
        }
    }
}
let olderActiveDocument:TextDocument;
/**
 * Handle setting of the new active document
 */
function handleNewActiveEditor() {
    if (Settings.showCurrentDocument) {
        ActiveDocManager.updateContent();
    } else {
        if (olderActiveDocument) {
            DocumentManager.resetDocument(olderActiveDocument);
        }
        olderActiveDocument = window.activeTextEditor ? window.activeTextEditor.document: null;
    }
}

/**
 * On extension activation register the autocomplete handler.
 *
 * @export
 * @param {vscode.ExtensionContext} context
 */
export async function activate(context: vscode.ExtensionContext) {
    Settings.init();
    DocumentManager.init();

    /**
     * Mark all words when the active document changes.
     */
    function attachActiveDocListener() {
        if (!Settings.updateOnlyOnSave) {
            context.subscriptions.push(window.onDidChangeActiveTextEditor((newDoc: vscode.TextEditor) => {
                handleNewActiveEditor();
            }));
            handleNewActiveEditor();
        }
    }

    vscode.languages.getLanguages().then((languages) => {
        languages.push('*');
        languages = languages.filter((x) => x.toLowerCase() !== "php");
        let schemed = [];
        let schemes = ['file', 'untitled', 'http', 'https', 'ftp' ];
        languages.forEach(x => {
            schemes.forEach(s => {
                schemed.push({ language: x, scheme: s });
            });
        });
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(schemed, CompletionItemProvider));
        schemes.forEach(s => {
            context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: "php", scheme: s }, CompletionItemProvider, ..."$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"));
        });
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language:"php", scheme:"file"}, CompletionItemProvider, ..."$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"));
    })
    context.subscriptions.push(vscode.commands.registerCommand("AllAutocomplete.toggleCurrentFile", () => {
        const config = vscode.workspace.getConfiguration('AllAutocomplete');
        if (Settings.showCurrentDocument) {
            config.update("showCurrentDocument", false);
            Settings.showCurrentDocument = false;
        } else {
            config.update("showCurrentDocument", true);
            Settings.showCurrentDocument = true;
            let currentDocument = window.activeTextEditor ? window.activeTextEditor.document : null;
            if (currentDocument) {
                DocumentManager.resetDocument(currentDocument);
                ActiveDocManager.updateContent();
            }
        }
    }));

    context.subscriptions.push(workspace.onDidOpenTextDocument((document: TextDocument) => {
        DocumentManager.parseDocument(document);
    }));

    context.subscriptions.push(workspace.onDidCloseTextDocument((document: TextDocument) => {
        if (olderActiveDocument === document) {
            olderActiveDocument = null;
        }
        DocumentManager.clearDocument(document);
    }));

    context.subscriptions.push(workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        if (shouldExcludeFile(e.document.uri)) {
            return;
        }
        if (!Settings.updateOnlyOnSave && Settings.showCurrentDocument && e.contentChanges.length > 0) {
            ActiveDocManager.handleContentChange(e);
        }
    }));
    if (Settings.updateOnlyOnSave) {
        context.subscriptions.push(workspace.onDidSaveTextDocument((document: TextDocument) => {
            DocumentManager.resetDocument(document);
        }));
    }

    for (let i = 0; i < workspace.textDocuments.length; ++i) {
        // Parse all words in this document
        DocumentManager.parseDocument(workspace.textDocuments[i]);
    }

    try {
        for (let tabGroup of window.tabGroups.all) {
            for (let tab of tabGroup.tabs) {
                if ((tab.input as unknown as vscode.TabInputText).uri) {
                    let tabi: vscode.TabInputText = tab.input as vscode.TabInputText;
                    let document = await workspace.openTextDocument(tabi.uri);
                    DocumentManager.parseDocument(document);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    
    attachActiveDocListener();
}

/**
 * Free up everything on deactivation
 *
 * @export
 */
export function deactivate() {
    wordLists.clear();
    content = [];
}
