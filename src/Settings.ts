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
import { Utils } from 'vscode-uri';

/**
 * Utility class to hold all settings.
 *
 * @class SettingsClass
 */
class SettingsClass {
    buildInFilesToExclude: string[];
    buildInRegexToExclude: RegExp[];
    excludeFiles: string;
    updateOnlyOnSave: boolean;
    ignoredWords: string[];
    showCurrentDocument: boolean;
    showOpenDocuments: boolean;
    defaultWhitespaceSplitter: RegExp;
    maxLines: number;
    wordListFiles: Array<vscode.Uri>
    languageWhitespace: Map<String, RegExp>;
    languageSpecialCharacters: Map<String, RegExp>;
    nonContributingLanguages: Array<string>;
    nonContributingToSelfLanguages: Array<string>;
    dontContributeToSelf: boolean;
    init() {
        const config = vscode.workspace.getConfiguration('AllAutocomplete');
        this.maxLines = Number(config.get("maxLines"));
        this.defaultWhitespaceSplitter = new RegExp(config.get("whitespace").toString(), "g");
        this.showCurrentDocument = !!config.get("showCurrentDocument");
        this.showOpenDocuments = !!config.get("showOpenDocuments");
        this.ignoredWords = config.get("ignoredWords", "").split(this.defaultWhitespaceSplitter);
        this.updateOnlyOnSave = !!config.get("updateOnlyOnSave");
        this.excludeFiles = config.get("excludeFiles").toString();
        this.nonContributingLanguages = config.get("nonContributingLanguages") as Array<string>;
        this.nonContributingToSelfLanguages = config.get("nonContributingToSelfLanguages") as Array<string>;
        this.dontContributeToSelf = config.get("dontContributeToSelf", false);
        this.buildInFilesToExclude = ["settings", "settings/editor", "vscode-extensions", "vs_code_welcome_page", "extHostLog", "configurationDefaults"];
        this.buildInRegexToExclude = [/^extension\-output\-#[0-9]+$/];
        let wordLists = [];
        if (Array.isArray(config.get("wordListFiles"))) {
            wordLists = config.get("wordListFiles") as Array<vscode.Uri>;
        } else {
            this.wordListFiles = [];
        }
        let files: Array<vscode.Uri> = [];
        vscode.workspace.workspaceFolders.forEach(folder => {
            wordLists.forEach((file: string) => {
                if (file.match(/^A-Za-z\:\//)) { // Begins with C: or / for win/unix
                    files.push(vscode.Uri.file(file));
                } else if (file.match(/^(https?)|(ftps?)/)) { 
                    files.push(vscode.Uri.parse(file));
                } else {
                    files.push(Utils.resolvePath(folder.uri, file))
                }
            });
        })
        this.wordListFiles = files;
        let languageWhitespace:any = config.get("languageWhitespace");
        this.languageWhitespace = new Map<string, RegExp>();
        for (let key in languageWhitespace) {
            try {
                this.languageWhitespace[key] = new RegExp(languageWhitespace[key], "g");
            } catch (e) {
                console.log(`Invalid regex for ${key}: ${languageWhitespace[key]}`)
            }
        }
        let languageSpecialCharacters:any = config.get("languageSpecialCharacters");
        this.languageSpecialCharacters = new Map<string, RegExp>();
        for (let key in languageSpecialCharacters) {
            this.languageSpecialCharacters[key] = new RegExp(languageSpecialCharacters[key], "g");
        }
    }
    whitespaceSplitter(languageId: string) : RegExp {
        let whitespaceSplitter = this.defaultWhitespaceSplitter;
        if (this.languageWhitespace[languageId]) {
            whitespaceSplitter = this.languageWhitespace[languageId];
        }
        return whitespaceSplitter;
    }
    specialCharacters(languageId: string): RegExp {
        let specialCharacter = new RegExp("");
        if (this.languageSpecialCharacters[languageId]) {
            specialCharacter = this.languageSpecialCharacters[languageId];
        }
        return specialCharacter;
    }
}

export const Settings = new SettingsClass();
