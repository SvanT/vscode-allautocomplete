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
import { Utils } from 'vscode-uri'
import { Settings } from './Settings';
import { shouldExcludeFile } from './Utils';

export const wordLists = new Map<vscode.TextDocument, string[]>

/**
 * Class to manage addition and removal of documents from the index
 *
 * @class DocumentManagerClass
 */
class DocumentManagerClass {
    /**
     * Method to initialize the document manager.
     *
     * @memberof DocumentManagerClass
     */
    init() {
        Settings.wordListFiles.forEach((file) => {
            vscode.workspace.openTextDocument(file).then((document) => {
                this.parseDocument(document);
            }, () => { });
        })

    }
    /**
     * Parses a document to create a wordlist for the document.
     *
     * @param {TextDocument} document
     * @memberof DocumentManagerClass
     */
    parseDocument(document: vscode.TextDocument) {
        if (shouldExcludeFile(document.uri)) {
            return;
        }
        // We don't parse non contributing languages.
        if (Settings.nonContributingLanguages.includes(document.languageId)) {
            return;
        }
        // Don't parse a document already present. The existing document
        // case takes place when
        if (wordLists.has(document)) {
            return;
        }
        const wordList = document.getText().split(Settings.whitespaceSplitter(document.languageId));
        wordLists.set(document, wordList);
        let basename = Utils.basename(document.uri);

        // Add the current document name to the wordlist.
        wordList.push(basename);
    }

    /**
     * Utility method to re-parse a new document.
     *
     * @param {vscode.TextDocument} document
     * @memberof DocumentManagerClass
     */
    resetDocument(document: vscode.TextDocument) {
        this.clearDocumentInternal(document);
        this.parseDocument(document);
    }

    /**
     * Removes the document from the list of indexed documents.
     *
     * @param {TextDocument} document
     *@memberof DocumentManagerClass
     */
    clearDocument(document: vscode.TextDocument) {
        if (Settings.wordListFiles.indexOf(document.uri) !== -1) {
            // Cannot clear this special document.
            return;
        }
        this.clearDocumentInternal(document);
    }

    /**
     * Internal function that clears a document
     *
     * @private
     * @param {vscode.TextDocument} document The document to clear
     * @memberof DocumentManagerClass
     */
    private clearDocumentInternal(document: vscode.TextDocument) {
        wordLists.delete(document);
    }

}

export const DocumentManager = new DocumentManagerClass();
