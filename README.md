# JavascriptMinifier.js
JavascriptMinifier is a JavaScript class that minifies JavaScript source code by removing comments, whitespace, and unnecessary characters without altering its functionality.

## Features
- Minifies JavaScript code
- Minifies JavaScript embedded within HTML
- Provides pre- and post-minification code and DataURL (Optional if logEnabled=true)

## Installation
To use JavascriptMinifier, simply include the `javascriptminifier.js` file in your project:

```html
<script src="path/to/javascriptminifier.js"></script>
```

## Usage
Create an instance of JavascriptMinifier and use its methods to minify JavaScript code.

```javascript
// Create a new instance of JavascriptMinifier
const jsmin = new JavascriptMinifier();

// Minify a JavaScript file
const jsCode = `
function helloWorld() {
    console.log("Hello, world!");
}
`;
const minifiedJs = jsmin.minifyJsFile(jsCode);
console.log(minifiedJs);

// Minify JavaScript embedded in HTML
const htmlCode = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script>
        function helloWorld() {
            console.log("Hello, world!");
        }
    </script>
</body>
</html>
`;
const minifiedHtml = jsmin.minifyJsInHtml(htmlCode);
console.log(minifiedHtml);
```

## Constructor
- constructor(): Initializes a new JavascriptMinifier instance.

## Properties
### Public fields
- minificationLogs : The array of objects includes both pre- and post-minification code and DataURL.
- logEnabled : Boolean indicating whether logging is enabled.

### Getters
- minificationLog (getter): The last minification log.
- originalTexts (getter): Array of original JavaScript texts.
- originalDataURLs (getter): Array of original JavaScript Data URLs.
- minifiedTexts (getter): Array of minified JavaScript texts.
- minifiedDataURLs (getter): Array of minified JavaScript Data URLs.

## Methods

### Main Methods
- minifyJsFile(text):
  - Minifies JavaScript code.
  - Parameters:
    - text (string): The JavaScript code to minify.
  - Returns: The minified JavaScript code.

- minifyJsInHtml(text):
  - Minifies JavaScript code embedded within an HTML string.
  - Parameters:
    - text (string): The HTML text containing JavaScript code to minify.
  - Returns: The HTML text with minified JavaScript code.

- minifyJsCode(inputJsCode, isEmbed = false):
  - Minifies JavaScript code by removing comments and unnecessary whitespace.
  - Parameters:
    - inputJsCode (string): The JavaScript code to minify.
    - isEmbed (boolean, optional): Whether to embed preserved comments in the minified code. Defaults to false.
  - Returns: The minified JavaScript code.

### Sub Methods
- toBlob(text, mimeType):
  - Converts a string to a Blob.
  - Parameters:
    - text (string): The string to convert.
    - mimeType (string): The MIME type of the data.
  - Returns: A Blob representing the input string.

- toDataURL(text, mimeType):
  - Converts a string to a Data URL.
  - Parameters:
    - text (string): The string to convert.
    - mimeType (string): The MIME type of the data.
  - Returns: A Data URL representing the input string.

- clearLog():
  - Clears the minification logs.

## License
This project is licensed under the [MIT License](https://github.com/kojikuwabara/easy-drop-files.js/blob/main/LICENSE). See the LICENSE file for details.

## Author
Koji Kuwabara - [GitHub](https://github.com/kojikuwabara)
