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

import * as vscode from 'vscode';
import { wordLists } from './DocumentManager';
import { Settings } from './Settings';

/**
 * Class that provides completion items for this extension.
 *
 * @class CompletionItemProviderClass
 */
class CompletionItemProviderClass {
    /**
     * Provides the completion items for the supplied words.
     *
     * @param {TextDocument} document
     * @param {Position} position
     * @param {CancellationToken} token
     * @returns
     */
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        let word = document.getText(document.getWordRangeAtPosition(position));
        let specialCharacters = word.match(Settings.specialCharacters(document.languageId))
        const whitespaceSplitter = Settings.whitespaceSplitter(document.languageId);

        if (document.languageId === 'elm' || document.languageId === 'php') {
            // The language server for elm does not give the right word range.
            // So we ignore its recommendation and use something else
            // See https://github.com/atishay/vscode-allautocomplete/issues/16
            let words = word.split(whitespaceSplitter);
            word = words[words.length - 1];
        }

        word = word.replace(whitespaceSplitter, '');
        let results = [];
        const nonContributingToSelf = Settings.dontContributeToSelf || Settings.nonContributingToSelfLanguages.includes(document.languageId);
        wordLists.forEach((wordList, doc) => {
            if (!Settings.showCurrentDocument) {
                if (doc === document) {
                    return;
                }
            }
            if (nonContributingToSelf && doc.languageId === document.languageId) {
                return;
            }
            if (!Settings.showOpenDocuments) {
                if (doc !== document) {
                    return;
                }
            }
            results.push(...wordList)
        });
        // Deduplicate results now.
        const set = new Set(results);
        set.delete(word);
        results = Array.from(set);
        if (Array.isArray(specialCharacters) && specialCharacters?.[0]) {
            results.push(...results.map(result => specialCharacters[0] + result));
        }
        const completions = results.map(result => new vscode.CompletionItem(result, vscode.CompletionItemKind.Text));

        return completions;
    }
}

export const CompletionItemProvider = new CompletionItemProviderClass()
