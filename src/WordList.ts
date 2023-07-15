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
import { TrieMap } from 'mnemonist';
import { Settings } from './Settings';
import { CompletionItem } from './CompletionItem'

class WordListClass extends Map<vscode.TextDocument, TrieMap<string, CompletionItem>> {
    activeWord: string;
    /**
     * Add word to the autocomplete list
     *
     * @param {string} word
     * @param {TrieMap} trie
     * @param {vscode.TextDocument} document
     */
    addWord(word: string, trie: TrieMap<string, CompletionItem>, document: vscode.TextDocument) {
        word = word.replace(Settings.whitespaceSplitter(document.languageId), '');
        // Active word is used to hide the given word from the autocomplete.
        this.activeWord = word;
        if (Settings.ignoredWords.indexOf(word) !== -1) return;
        if (word.length >= Settings.minWordLength) {
            let item = trie.get(word);
            if (item) {
                item.count++;
                item.updateDetails();
            } else {
                item = new CompletionItem(word, document.uri);
                trie.set(word, item);
            }
        }
    }
    /**
     * Remove word from the search index.
     *
     * @param {string} word
     * @param {TrieMap} trie
     */
    removeWord(word: string, trie: TrieMap<string, CompletionItem>, document: vscode.TextDocument) {
        word = word.replace(Settings.whitespaceSplitter(document.languageId), '');
        if (word.length >= Settings.minWordLength) {
            let item = trie.get(word);
            if (item) {
                item.count--;
                if (item.count <= 0) {
                    trie.delete(word);
                }
            }
        }
    }
}

export const WordList = new WordListClass();
