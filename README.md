# VSCode All Autocomplete
[![](https://vsmarketplacebadge.apphb.com/version/Atishay-Jain.All-Autocomplete.svg)](https://marketplace.visualstudio.com/items?itemName=Atishay-Jain.All-Autocomplete)

Provides autocompletion in [Visual Studio Code](https://github.com/Microsoft/vscode) items based on all open editors.

## Features

![](https://cdn.rawgit.com/atishay/vscode-allautocomplete/1ea2b07b/images/All-Autocomplete.gif)

## Items in the Cmd+P Menu
* `Toggle Suggestions From The Current File`
* `Cycle Open Editors`

## Extension Settings

This extension has the following settings:

* `AllAutocomplete.minWordLength`: Minimum word length to keep in autocomplete list.
* `AllAutocomplete.maxLines`: Maximum number of lines to read from a file.
* `AllAutocomplete.whitespace`: Regex to use for splitting whitespace.
* `AllAutocomplete.cycleOpenDocumentsOnLaunch`: Cycles through open documents on launch to enable autocomplete to include those documents on restore.
* `AllAutocomplete.showCurrentDocument`: Show results from the current document in the autocomplete results.
* `AllAutocomplete.ignoredWords`: Words to ignore(separated by AllAutocomplete.whitespace) from autocomplete.
* `AllAutocomplete.updateOnlyOnSave`: Do not update the autocomplete list unless the document is saved.
* `AllAutocomplete.excludeFiles`: Glob pattern for files to exclude from autocomplete search.
* `AllAutocomplete.languageWhitespace`: Regex for splitting whitespace (Language specific). Specify as a map with a language ID and regex.
* `AllAutocomplete.languageSpecialCharacters`: Regex for finding special characters that languages treat differently in autocomplete. For example, `.` in CSS.
* `AllAutocomplete.wordListFiles`: Array of strings that represent path to files that behave as if they are always open. These can be used as stores for headers, word lists etc. for autocomplete. Absolute paths can be used here or if the workspace consists of a single folder, relative paths to the folder can also be used.

## Needs Suggestions
If you feel that the whitespace splitter is wrong in some language, please report a github issue or better a pull request with the correct regex in package.json.

## Known Issues

### Documents do not show up in autocomplete on restore.

Upon restoring Visual Studio, the documents that have never been opened do not appear in autocomplete. ([VSCode Issue#15178](https://github.com/Microsoft/vscode/issues/15178))

Click on open tabs to enable them in the document. Alternatively, you can use the Cmd+P menu and select `Cycle Open Editors`. You can enable this to be done on launch with `AllAutocomplete.cycleOpenDocumentsOnLaunch`.

### Emmet collision

The emmet plugin takes over the special character `#` in CSS and therefore that cannot be auto-completed.

## Performance Impact
* When using real-time mode by setting `AllAutocomplete.showCurrentDocument` = `true`, the plugin tries to update the index on each addition/deletion.
* When `AllAutocomplete.showCurrentDocument` = `false`, the index updates itself on each change to focussed editor.
* When `AllAutocomplete.updateOnlyOnSave` = `true`, the index is updated only on save and open/close of documents.

## TODO
* Support completion of the license header.

**Enjoy!**
