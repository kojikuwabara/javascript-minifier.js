////////////////////////////////////////////////////////////////////////////////////////////////////
// JavascriptMinifier.js
////////////////////////////////////////////////////////////////////////////////////////////////////
/*!
 * @classdesc Minify Javascript source code.
 *
 * @author    Koji Kuwabara (https://github.com/kojikuwabara/javascript-minifier.js)
 * @copyright 2024 Koji Kuwabara
 * @version   v1.0.0
 * @licence   Licensed under MIT (https://opensource.org/licenses/MIT)
 */
////////////////////////////////////////////////////////////////////////////////////////////////////
// Overview
////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *  constructor:
 *  Property:
 *    - minificationLogs #Public field
 *    - logEnabled       #Public field
 *    - minificationLog  #getter
 *    - originalTexts    #getter
 *    - originalDataURLs #getter
 *    - minifiedTexts    #getter
 *    - minifiedDataURLs #getter
 *  Method:
 *    - toBlob
 *    - toDataURL
 *    - clearLog
 *    - minifyJsFile
 *    - minifyJsInHtml
 *    - minifyJsCode
 */
class JavascriptMinifier { 
	////////////////////////////////////////////////////////////////////////////////////////////////////
	// constructor
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Constructs a new EasyDropFiles instance.
	 * @constructor
	 */
	constructor(options={}) {
		this.minificationLogs = [];
		this.logEnabled = options.logEnabled ?? false;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// getter / setter
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * getter and setter for the DragAndDrop class.
	 */
	get minificationLog() {
		return this.minificationLogs.at(-1);
	}
	get originalTexts() {
		return this.minificationLogs.map(obj => obj.originalText);
	}
	get originalDataURLs() {
		return this.minificationLogs.map(obj => obj.originalDataURL);
	}
	get minifiedTexts() {
		return this.minificationLogs.map(obj => obj.minifiedText);
	}
	get minifiedDataURLs() {
		return this.minificationLogs.map(obj => obj.minifiedDataURL);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Conversion functions
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Converts an array buffer to a Blob.
	 * @param   {string} text     - The string to convert.
	 * @param   {string} mimeType - The MIME type of the data.
	 * @returns {string}            The converted Blob.
	 */
	toBlob(text, mimeType) {
		return new Blob([text], { type: mimeType });
	}

	/**
	 * Converts an array buffer to a data URL.
	 * @param   {string} text     - The string to convert.
	 * @param   {string} mimeType - The MIME type of the data.
	 * @returns {string}            The converted data URL.
	 */
	toDataURL(text, mimeType) {
		const blob = new Blob([text], { type: mimeType });
		return URL.createObjectURL(blob);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	//  clearLog
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Clears the minification logs by resetting the log array to an empty state.
	 */
	clearLog() {
		this.minificationLogs = [];
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	//  minifyJsFile
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Minifies the given JavaScript code and logs the original and minified code information.
	 *
	 * @param   {string} text - The JavaScript code to be minified.
	 * @returns {string}      - The minified JavaScript code.
	 */
	minifyJsFile(text) {
		try {
			const MIME_TYPE       = "text/javascript";
			const minifiedJsCode  = this.minifyJsCode(text);
			const minificationLog = {
				 "originalText"    : text
				,"originalSize"    : encodeURI(text).replace(/%../g, "*").length
				,"originalDataURL" : this.toDataURL(text, MIME_TYPE)
				,"minifiedText"    : minifiedJsCode
				,"minifiedSize"    : encodeURI(minifiedJsCode).replace(/%../g, "*").length
				,"minifiedDataURL" : this.toDataURL(minifiedJsCode, MIME_TYPE)
			};
			this.minificationLogs.push(minificationLog);
			!this.logEnabled && this.clearLog();
			return minifiedJsCode;
		} catch(error) {
			console.error(error);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	//  minifyJsInHtml
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Minifies JavaScript code embedded within an HTML string and logs the original and minified code information.
	 *
	 * @param   {string} text - The HTML text containing JavaScript code to be minified.
	 * @returns {string}      - The HTML text with minified JavaScript code.
	 */
	minifyJsInHtml(text) {
		try {
			const ESCAPED_SCRIPT_TAG = "\\u003C" + "\/script " + " \\u003E";
			const MIME_TYPE          = "text/html";

			// Extract script tags in html
			const escRegex    = /((?<=\u003Cscript\u003E.*?=+?\s+?[`].*?)(\u003C\/script\u003E)(?=.*?[`]{1}?.*?;))/gmis;
			const escapedText = text.replace(escRegex, ESCAPED_SCRIPT_TAG);
			const regex       = /\u003Cscript\b[^>]*\u003E(.*?)\u003C\/script\u003E/gs;
			const scriptTags  = escapedText.match(regex) || [];

			// Minify for each extracted script tag
			let htmlWithEmbeddedJsCode = text;
			scriptTags.forEach( scriptTag => {
				const originalJsCode   = scriptTag.replace(ESCAPED_SCRIPT_TAG, "\u003C/script\u003E");
				const trimmedScriptTag = scriptTag.replaceAll(/(^\s*\u003C!--\s*$|^\s*--\u003E\s*$)/gm, '');
				// The escaping of '$' is done to treat it as a literal character, not as a special replacement pattern.
				const minifiedJsCode   = this.minifyJsCode(trimmedScriptTag, true).replace(/\$/g, "$$$$");
				htmlWithEmbeddedJsCode = htmlWithEmbeddedJsCode.replace(originalJsCode, minifiedJsCode);
			});

			// Return minified code
			const minificationLog = {
				 "originalText"    : text
				,"originalSize"    : encodeURI(text).replace(/%../g, "*").length
				,"originalDataURL" : this.toDataURL(text, MIME_TYPE)
				,"minifiedText"    : htmlWithEmbeddedJsCode
				,"minifiedSize"    : encodeURI(htmlWithEmbeddedJsCode).replace(/%../g, "*").length
				,"minifiedDataURL" : this.toDataURL(htmlWithEmbeddedJsCode, MIME_TYPE)
			};
			this.minificationLogs.push(minificationLog);
			!this.logEnabled && this.clearLog();
			return htmlWithEmbeddedJsCode;

		} catch(error) {
			console.error(error);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	//  minifyJsCode
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Minifies JavaScript code by removing comments and unnecessary whitespace, and optionally embedding preserved comments.
	 *
	 * @param   {string}  inputJsCode     - The JavaScript code to minify.
	 * @param   {boolean} [isEmbed=false] - Whether to embed preserved comments in the minified code.
	 * @returns {string}                  - The minified JavaScript code.
	 */
	minifyJsCode(inputJsCode, isEmbed=false) {
		try {
			///////////////////////////////
			// Define functions
			///////////////////////////////
			// Remove comment and replace whitespace character to space character
			// \u003C : < 
			// \u003E : > 
			// \u002f : / 
			const removeHTMLComment = arg => arg.replace(/\u003C!--.*?--\u003E/gm, '');
			const removeSLComment   = arg => arg.replace(/(?<!:)(\u002f\u002f).*$/gm, '');
			const tabCrlfToSpace    = arg => arg.replace(/(\t|\r\n|\n)/g, ' ');
			const removeMLComment   = arg => arg.replace(/\u002f\*.*?\*\u002f/gm, '');

			// Escape literals
			// \u0022 : '
			// \u0027 : "
			// \u0060 : `
			// \u000e : SO(Shift Out)         * Characters for escaping. Select any character that the user never types.
			// \u000f : SI(Shift In)          * Characters for escaping. Select any character that the user never types.
			// \u0010 : DLE(Data link Espace) * Characters for escaping. Select any character that the user never types.
			// \u0011 : DC1(Device Control 1) * Characters for escaping. Select any character that the user never types.
			const escapeQuotInRegexPattern     = arg => arg.replace(/(\u002f[^\u002f]*?)\u0022([^\u002f]*?\u002f)/g, "$1\u000e$2");
			const escapeAposInRegexPattern     = arg => arg.replace(/(\u002f[^\u002f]*?)\u0027([^\u002f]*?\u002f)/g, "$1\u000f$2");
			const escapeBacktickInRegexPattern = arg => arg.replace(/(\u002f[^\u002f]*?)\u0060([^\u002f]*?\u002f)/g, "$1\u0010$2");
			const escapeLiterals               = arg => (arg.match(/\u0060[^\u0060]*?\u0060/gm) || []).concat(arg.replace(/\u0060[^\u0060]*?\u0060/gm, "").match(/(\u0022[^\u0022]*?\u0022|\u0027[^\u0027]*?\u0027)/g));
			const setLiteralsToValiable  = (inputText, literals) => {
				let escapedText = inputText;
				for(let i=0; i<literals.length; i++){
					const replacement = "escapeString_____" + String(i).padStart(5, '0');
					escapedText = escapedText.replace(literals[i], replacement);
				}
				return escapedText;
			};

			// Remove space 
			// \u005C : \
			const removeSpace = arg => {
				const symbols = ["\u005C(", "\u005C)", "\u005C{", "\u005C}", "\u005C[", "\u005C]", "\u005C+", "\u005C-", "=", "u003C", "u003E", ":", ";", ","].join("|");
				const pattern = new RegExp(`(${symbols})\\s+|\\s+(${symbols})|\\s+`, 'g');
				return arg.replace(pattern, (match, p1, p2) => p1 || p2 || ' ');
			};

			// Restore literals
			const getLiteralsFromValiable = (inputText, literals) => {
				let restoredText = inputText;
				for(let i=0; i<literals.length; i++){
					const pattern     = "escapeString_____" + String(i).padStart(5, '0');
					const replacement = (literals[i] || "" ).replace(/\$/g, '$$$$');
					restoredText    = restoredText.replace(pattern, replacement);
				}
				return restoredText;
			};
			const restoreBacktickInRegexPattern = arg => arg.replace(/\u0010/g,"\u0060");
			const restoreAposInRegexPattern     = arg => arg.replace(/\u000f/g,"\u0027");
			const restoreQuotInRegexPattern     = arg => arg.replace(/\u000e/g,"\u0022");

			// Preserve comments
			const preserveComment = arg => arg.match(/\u002f\*![\s\S]*?\*\u002f/gm);
			const concatComments  = (text, comments) => comments ? comments.join("\n") + "\n" + text : text;
			const spliceComennts  = (text, comments) => comments ? text.replace(/(^\s*\<\s*script\s*\>)/g, "$1\n" + comments.join("\n") + "\n") : text ;

			///////////////////////////////
			// Main proc
			///////////////////////////////
			let modifiedJsCode = inputJsCode;

			// Remove comments
			modifiedJsCode = removeHTMLComment(modifiedJsCode);
			modifiedJsCode = removeSLComment(modifiedJsCode);
			modifiedJsCode = tabCrlfToSpace(modifiedJsCode);
			modifiedJsCode = removeMLComment(modifiedJsCode);

			// Escape litarals
			const escapedLiterals = escapeLiterals(modifiedJsCode) || [];
			modifiedJsCode = setLiteralsToValiable(modifiedJsCode, escapedLiterals);

			// Escape symbols in Regex pattern
			modifiedJsCode = escapeQuotInRegexPattern(modifiedJsCode);
			modifiedJsCode = escapeAposInRegexPattern(modifiedJsCode);
			modifiedJsCode = escapeBacktickInRegexPattern(modifiedJsCode);

			// Remove spaces
            modifiedJsCode = removeSpace(modifiedJsCode);

			// Restore literals
			modifiedJsCode = getLiteralsFromValiable(modifiedJsCode, escapedLiterals);
			modifiedJsCode = restoreBacktickInRegexPattern(modifiedJsCode);
			modifiedJsCode = restoreAposInRegexPattern(modifiedJsCode);
			modifiedJsCode = restoreQuotInRegexPattern(modifiedJsCode);

			// Add Preserved Comments
			const preservedComments = preserveComment(inputJsCode);
			modifiedJsCode = modifiedJsCode.replace(/(^\s*\<\s*script\s*\>\s+)/, "\u003Cscript\u003E");
			modifiedJsCode = isEmbed ? spliceComennts(modifiedJsCode, preservedComments) : concatComments(modifiedJsCode, preservedComments);

			//Set result
			return modifiedJsCode;
		} catch(error) {
			console.error(error);
		}
	}

};

