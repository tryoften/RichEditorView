/**
 * Copyright (C) 2015 Wasabeef
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

var RE = {};

window.onload = function() {
    RE.callback("ready");
};

RE.editor = document.getElementById('editor');

// Not universally supported, but seems to work in iOS 7 and 8
document.addEventListener("selectionchange", function() {
                          RE.backuprange();
                          });

//looks specifically for a Range selection and not a Caret selection
RE.rangeSelectionExists = function() {
    //!! coerces a null to bool
    var sel = document.getSelection();
    if (sel && sel.type == "Range") {
        return true;
    }
    return false;
};

RE.rangeOrCaretSelectionExists = function() {
    //!! coerces a null to bool
    var sel = document.getSelection();
    if (sel && (sel.type == "Range" || sel.type == "Caret")) {
        return true;
    }
    return false;
};

RE.editor.addEventListener("input", function() {
                           RE.updatePlaceholder();
                           RE.backuprange();
                           RE.wrapTextNodes();
                           RE.callback("input");
                           });

RE.editor.addEventListener("focus", function() {
                           RE.backuprange();
                           RE.callback("focus");
                           });

RE.editor.addEventListener("blur", function() {
                           RE.callback("blur");
                           });

RE.customAction = function(action) {
    RE.callback("action/" + action);
};

RE.updateHeight = function() {
    RE.callback("updateHeight");
}

RE.callbackQueue = [];
RE.runCallbackQueue = function() {
    if (RE.callbackQueue.length === 0) {
        return;
    }
    
    setTimeout(function() {
               window.location.href = "re-callback://";
               }, 0);
};

RE.getCommandQueue = function() {
    var commands = JSON.stringify(RE.callbackQueue);
    RE.callbackQueue = [];
    return commands;
};

RE.callback = function(method) {
    RE.callbackQueue.push(method);
    RE.runCallbackQueue();
};

RE.setHtml = function(contents) {
    var tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = contents;
    var images = tempWrapper.querySelectorAll("img");
    
    for (var i = 0; i < images.length; i++) {
        images[i].onload = RE.updateHeight;
    }
    
    RE.editor.innerHTML = tempWrapper.innerHTML;
    RE.updatePlaceholder();
};

RE.getHtml = function() {
    return RE.editor.innerHTML;
};

RE.getText = function() {
    return RE.editor.innerText;
};

RE.setPlaceholderText = function(text) {
    RE.editor.setAttribute("placeholder", text);
};

RE.updatePlaceholder = function() {
    if (RE.editor.textContent.length > 0) {
        RE.editor.classList.remove("placeholder");
    } else {
        RE.editor.classList.add("placeholder");
    }
};

RE.removeFormat = function() {
    document.execCommand('removeFormat', false, null);
};

RE.setRegularFontSize = function(size) {
    document.execCommand("fontSize", false, "3");
};

RE.setLargerFontSize = function() {
    document.execCommand("fontSize", false, "4.5");
};

RE.setItalicsFontSize = function() {
    document.execCommand("fontSize", false, "5");
};

RE.setBackgroundColor = function(color) {
    RE.editor.style.backgroundColor = color;
};

RE.setMainFont = function() {
    document.execCommand("fontName", false, "Courier");
}

RE.insertNewLine = function() {
    RE.insertHTML("<br>");
}

RE.setHeight = function(size) {
    RE.editor.style.height = size;
};

RE.undo = function() {
    document.execCommand('undo', false, null);
};

RE.redo = function() {
    document.execCommand('redo', false, null);
};

RE.setBold = function() {
    document.execCommand('bold', false, null);
};

RE.setItalic = function() {
    document.execCommand('italic', false, null);
};

RE.setSubscript = function() {
    document.execCommand('subscript', false, null);
};

RE.setSuperscript = function() {
    document.execCommand('superscript', false, null);
};

RE.setStrikeThrough = function() {
    document.execCommand('strikeThrough', false, null);
};

RE.setUnderline = function() {
    document.execCommand('underline', false, null);
};

RE.setTextColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
};

RE.setTextBackgroundColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('hiliteColor', false, color);
    document.execCommand("styleWithCSS", null, false);
};

RE.setHeading = function(heading) {
    document.execCommand('formatBlock', false, '<h' + heading + '>');
};

RE.setIndent = function() {
    document.execCommand('indent', false, null);
};

RE.setOutdent = function() {
    document.execCommand('outdent', false, null);
};

RE.setOrderedList = function() {
    document.execCommand('insertOrderedList', false, null);
};

RE.setUnorderedList = function() {
    document.execCommand('insertUnorderedList', false, null);
};

RE.setJustifyLeft = function() {
    document.execCommand('justifyLeft', false, null);
};

RE.setJustifyCenter = function() {
    document.execCommand('justifyCenter', false, null);
};

RE.setJustifyRight = function() {
    document.execCommand('justifyRight', false, null);
};

RE.insertImage = function(url, alt) {
    var img = document.createElement('img');
    img.setAttribute("src", url);
    img.setAttribute("alt", alt);
    img.onload = RE.updateHeight;
    
    RE.insertHTML(img.outerHTML);
    RE.callback("input");
};

RE.setBlockquote = function() {
    document.execCommand('formatBlock', false, '<blockquote>');
};

RE.insertHTML = function(html) {
    RE.restorerange();
    document.execCommand('insertHTML', false, html);
};

RE.insertLink = function(url, title) {
    RE.restorerange();
    var sel = document.getSelection();
    if (sel.toString().length !== 0) {
        if (sel.rangeCount) {
            
            var el = document.createElement("a");
            el.setAttribute("href", url);
            el.setAttribute("title", title);
            
            var range = sel.getRangeAt(0).cloneRange();
            range.surroundContents(el);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    RE.callback("input");
};

RE.prepareInsert = function() {
    RE.backuprange();
};

RE.backuprange = function() {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        RE.currentSelection = {
            "startContainer": range.startContainer,
            "startOffset": range.startOffset,
            "endContainer": range.endContainer,
            "endOffset": range.endOffset
        };
    }
};

RE.addRangeToSelection = function(selection, range) {
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

// Programatically select a DOM element
RE.selectElementContents = function(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    // this.createSelectionFromRange sel, range
    RE.addRangeToSelection(sel, range);
};

RE.restorerange = function() {
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(RE.currentSelection.startContainer, RE.currentSelection.startOffset);
    range.setEnd(RE.currentSelection.endContainer, RE.currentSelection.endOffset);
    selection.addRange(range);
};

RE.focus = function() {
    var range = document.createRange();
    range.selectNodeContents(RE.editor);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.focus();
};

RE.blurFocus = function() {
    RE.editor.blur();
};

RE.getCursorPosition = function() {
    var caretOffset = 0;
    var element = document.getElementById("editor");
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

RE.getBoldState = function() {
    return document.queryCommandState("Bold");
}

RE.getItalicState = function() {
    return document.queryCommandState("Italic");
}

RE.getElementFontSize = function() {
    var sel = document.getSelection();
    var size = sel.anchorNode.parentNode.size;
    if (size !== undefined) {
        return size;
    } else {
        return sel.anchorNode.parentNode.parentNode.size;
    }
}

/**
 Recursively search element ancestors to find a element nodeName e.g. A
 **/
var _findNodeByNameInContainer = function(element, nodeName, rootElementId) {
    if (element.nodeName == nodeName) {
        return element;
    } else {
        if (element.id === rootElementId) {
            return null;
        }
        _findNodeByNameInContainer(element.parentElement, nodeName, rootElementId);
    }
};

var isAnchorNode = function(node) {
    return ("A" == node.nodeName);
};

RE.getAnchorTagsInNode = function(node) {
    var links = [];
    
    while (node.nextSibling !== null && node.nextSibling !== undefined) {
        node = node.nextSibling;
        if (isAnchorNode(node)) {
            links.push(node.getAttribute('href'));
        }
    }
    return links;
};

RE.countAnchorTagsInNode = function(node) {
    return RE.getAnchorTagsInNode(node).length;
};

RE.getTagForParentNode = function(node) {
    if (node.parentNode != null) {
        return node.parentNode.localName
    }
};

RE.boldCurrentDiv = function() {
    var sel = document.getSelection();
    var parentNodeObject = sel.anchorNode.parentNode;
    if (parentNodeObject.localName == "div" || parentNodeObject.localName == "li" || parentNodeObject.localName == "font" || parentNodeObject.id != "editor") {
        parentNodeObject.className = "TEXT-ONE";
    } else if (parentNodeObject.localName == "span" || parentNodeObject.parentNode.id != "editor") {
        if (parentNodeObject.parentNode.localName == "li") {
            parentNodeObject.parentNodeObject.className = "TEXT-ONE";
        }
        parentNodeObject.parentNodeObject.className = "TEXT-ONE";
    }
};

RE.unboldCurrentDiv = function() {
    var sel = document.getSelection();
    var parentNodeObject = sel.anchorNode.parentNode;
    if (parentNodeObject.localName == "div" || parentNodeObject.localName == "li" || parentNodeObject.localName == "font" || parentNodeObject.id != "editor") {
        parentNodeObject.className = "TEXT-ZERO";
    } else if (parentNodeObject.localName == "span" || parentNodeObject.parentNode.id != "editor") {
        if (parentNodeObject.parentNode.localName == "li") {
            parentNodeObject.parentNode.className = "TEXT-ZERO";
        }
        parentNodeObject.className = "TEXT-ZERO";
    }
};

RE.largeBoldCurrentDiv = function() {
    var sel = document.getSelection();
    var parentNodeObject = sel.anchorNode.parentNode;
    if (parentNodeObject.localName == "div" || parentNodeObject.localName == "li" || parentNodeObject.localName == "font" || parentNodeObject.id != "editor") {
        parentNodeObject.className = "TEXT-TWO";
    } else if (sel.anchorNode.parentNode.localName == "span" || parentNodeObject.parentNode.id != "editor") {
        if (parentNodeObject.parentNode.localName == "li") {
            parentNodeObject.parentNode.className = "TEXT-TWO";
        }
        parentNodeObject.className = "TEXT-TWO";
    }
};

RE.unlargeBoldCurrentDiv = function() {
    var sel = document.getSelection();
    var parentNodeObject = sel.anchorNode.parentNode;
    if (parentNodeObject.localName == "div" || parentNodeObject.localName == "li" || parentNodeObject.localName == "font" || parentNodeObject.id != "editor") {
        parentNodeObject.className = "TEXT-ZERO";
    } else if (sel.anchorNode.parentNode.localName == "span" || parentNodeObject.parentNode.id != "editor") {
        if (parentNodeObject.parentNode.localName == "li") {
            parentNodeObject.className = "TEXT-ZERO";
        }
        parentNodeObject.className = "TEXT-ZERO";
    }
};

RE.italicCurrentDiv = function() {
    var sel = document.getSelection();
    var parentNodeObject = sel.anchorNode.parentNode;
    if (parentNodeObject.localName == "div" || parentNodeObject.localName == "li" || parentNodeObject.localName == "font" || parentNodeObject.id != "editor") {
        parentNodeObject.className = "QUOTES-ONE";
        parentNodeObject.style.fontStyle = "italic";
    } else if (parentNodeObject.localName == "span" || parentNodeObject.parentNode.id != "editor") {
        if (parentNodeObject.parentNode.localName == "li") {
            parentNodeObject.className = "QUOTES-ONE";
        }
        parentNodeObject.className = "QUOTES-ONE";
    }
};

RE.unitalicCurrentDiv = function() {
    var sel = document.getSelection();
    var parentNodeObject = sel.anchorNode.parentNode;
    if (parentNodeObject.localName == "div" || parentNodeObject.localName == "li" || parentNodeObject.localName == "font" || parentNodeObject.id != "editor") {
        parentNodeObject.className = "QUOTES-ZERO";
    } else if (parentNodeObject.localName == "span" || parentNodeObject.parentNode.id != "editor") {
        if (parentNodeObject.parentNode.localName == "li") {
            parentNodeObject.parentNode.className = "QUOTES-ZERO";
        }
        parentNodeObject.className = "QUOTES-ZERO";
    }
};

RE.getFontSizeForCursor = function() {
    var node = window.getSelection().anchorNode;
    
    if (node.parentNode.style.fontSize != null) {
        return node.parentNode.style.fontSize;
    } else {
        return node.parentNode.parentNode.style.fontSize;
    }
};

RE.getFontStyleForCursor = function() {
    var node = window.getSelection().anchorNode;
    
    if (node.parentNode.style.fontSize != null) {
        return node.parentNode.style.fontStyle;
    } else {
        return node.parentNode.parentNode.style.fontStyle;
    }
};

RE.getFontWeightForCursor = function() {
    var node = window.getSelection().anchorNode;
    
    if (node.parentNode.style.fontWeight != null) {
        return node.parentNode.style.fontWeight;
    } else {
        return node.parentNode.parentNode.style.fontWeight;
    }
};

RE.getStateForTextCursor = function() {
    var fontSize = RE.getFontSizeForCursor();
    var fontStyle = RE.getFontStyleForCursor();
    var fontWeight = RE.getFontWeightForCursor();
    
    if (fontSize == "large") {
        return "largeBold";
    } else if (fontSize == "x-large") {
        return "italicLarge";
    } else if (fontWeight == "700") {
        return "bold";
    } else {
        return "normal";
    }
};

/**
 * If the current selection's parent is an anchor tag, get the href.
 * @returns {string}
 */
RE.getSelectedHref = function() {
    var href, sel;
    href = '';
    sel = window.getSelection();
    
    var tag = RE.getTagForParentNode(sel.anchorNode);
    
    try {
        if (window.getSelection) {
            sel = window.getSelection().anchorNode.parentNode.localName;
            return sel
        } else {
            sel = document.getSelection().anchorNode.parentNode.localName;
            return sel
        }
    } catch (err) {
        // nothing
    }
    
    //if more than one link is there, return null
    if (tags.length > 1) {
        return null;
    } else if (tags.length == 1) {
        href = tags[0];
    } else {
        var node = _findNodeByNameInContainer(sel.anchorNode.parentElement, 'A', 'editor');
        href = node.href;
    }
    
    return href ? href : null;
};

/* Make sure all text nodes are wrapped in divs! */

RE.wrapTextNodes = function() {
    var contents = RE.editor.childNodes;
    for (var i = 0; i < contents.length; i++) {
        if (contents[i].nodeType === Node.TEXT_NODE) {
            var newNode = document.createElement('div');
            RE.createWrapper(contents[i], newNode);
            RE.focus();
        }
    }
}


RE.createWrapper = function(elms, node) {
    var child = node.cloneNode(true);
    var el    = elms;
    
    var parent  = el.parentNode;
    var sibling = el.nextSibling;
    
    child.appendChild(el);
    
    if (sibling) {
        parent.insertBefore(child, sibling);
    } else {
        parent.appendChild(child);
    }
    
};

// Returns the cursor position relative to its current position onscreen.
// Can be negative if it is above what is visible
RE.getRelativeCaretYPosition = function() {
    var y = 0;
    var sel = window.getSelection();
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        var needsWorkAround = (range.startOffset == 0)
        /* Removing fixes bug when node name other than 'div' */
        // && range.startContainer.nodeName.toLowerCase() == 'div');
        if (needsWorkAround) {
            y = range.startContainer.offsetTop - window.pageYOffset;
        } else {
            if (range.getClientRects) {
                var rects=range.getClientRects();
                if (rects.length > 0) {
                    y = rects[0].top;
                }
            }
        }
    }
    
    return y;
};

// Jakub Content Methods

var MAX_WIDTH = 135;
var MAX_HEIGHT = 130;

RE.resizeImage = function(img) {
    var { width, height, src } = img;
    var newImg = {};
    
    if (width > height) {
        var newHeight = RE.getSmallUknown(MAX_WIDTH, img.width, img.height);
        newImg.height = newHeight;
        newImg.width = MAX_WIDTH;
        
    } else if (width < height) {
        var newWidth = RE.getSmallUknown(MAX_HEIGHT, img.height, img.width);
        newImg.height = MAX_HEIGHT;
        newImg.width = newWidth;
    } else {
        newImg.height = MAX_HEIGHT;
        newImg.width = MAX_HEIGHT;
    }
    return newImg;
    
};

RE.getSmallUknown = function(xs, xl, yl) {
    return Math.ceil( ( xs / xl ) * yl );
};


RE.appendListItem = function (root, entry, type) {
    var lastItem = root.lastChild;
    var oppositeType = (type == 'UL') ? 'OL': 'UL';
    if(!lastItem || (lastItem.nodeName == 'DIV' || lastItem.nodeName == oppositeType)) {
        //if unstyled, create new list
        var newList = document.createElement(type);
        
        var li = document.createElement('li');
        li.appendChild(RE.convertEntryToHTML(entry));
        newList.appendChild(li);
        root.appendChild(newList);
    } else {
        //unordered list item
        var newItem = document.createElement('li');
        newItem.appendChild(RE.convertEntryToHTML(entry));
        lastItem.appendChild(newItem);
    }
};

RE.convertEntryToHTML = function(entry) {
    var element = document.createElement('div');
    var id = document.createAttribute('id');
    id.value = entry.key;
    element.setAttributeNode(id);
    
    if(entry.meta && entry.meta.format === 'divider') {
        var inlineStyle = document.createAttribute('class');
        inlineStyle.value = "DIVIDER";
        element.setAttributeNode(inlineStyle);
        
        var innerImg = document.createElement('img');
        var src = document.createAttribute('src');
        src.value = "https://firebasestorage.googleapis.com/v0/b/firebase-often-dev.appspot.com/o/images%2Fusers%2Fkomran%2Flinebreak%403x.png?alt=media&amp;token=f7bda5c0-6cd2-4d35-825f-2c5f8e132044";
        var alt = document.createAttribute('alt');
        alt.value = 'linebreak';
        innerImg.setAttributeNode(src);
        innerImg.setAttributeNode(alt);
        
        element.appendChild(innerImg);
        
    } else if(entry.meta && entry.meta.format === 'image') {
        var orientation = entry.meta.orientation || 'left';
        var inlineStyle = document.createAttribute('class');
        inlineStyle.value = 'IMAGE align-'+ orientation;
        element.setAttributeNode(inlineStyle);
        
        var innerImg = document.createElement('img');
        var src = document.createAttribute('src');
        src.value = entry.meta.href || "";
        innerImg.setAttributeNode(src);
        
        var style = document.createAttribute('style');
        var image = {
        height: entry.meta.height || MAX_HEIGHT,
        width: entry.meta.width || MAX_WIDTH
        };
        var resizedImage = RE.resizeImage(image);
        style.value = "font-size: 12pt; -webkit-text-size-adjust: 100%;";
        innerImg.setAttributeNode(style);
        
        //Set original height and width
        var originalWidth = document.createAttribute('data-originalWidth');
        originalWidth.value = image.width;
        innerImg.setAttributeNode(originalWidth);
        
        var originalHeight = document.createAttribute('data-originalHeight');
        originalHeight.value = image.height;
        innerImg.setAttributeNode(originalHeight);
        
        var orientationAtt = document.createAttribute('data-orientation');
        orientationAtt.value = orientation;
        innerImg.setAttributeNode(orientationAtt);
        
        var width = document.createAttribute('width');
        width.value = resizedImage.width;
        innerImg.setAttributeNode(width);
        
        var height = document.createAttribute('height');
        height.value = resizedImage.height;
        innerImg.setAttributeNode(height);
        
        element.appendChild(innerImg);
        
    } else {
        var inlineStyle = document.createAttribute('class');
        inlineStyle.value = entry.inlineStyle;
        element.setAttributeNode(inlineStyle);
        
        element.innerHTML = entry.text;
        
    }
    return element
};


RE.convertEntriesToHTML = function(entryJSON) {
    var entries = JSON.parse(entryJSON);
    var root = document.createElement('div');
    for (var entry of entries) {
        if (entry.listStyle === 'unordered-list-item') {
            RE.appendListItem(root, entry, 'UL');
        } else if (entry.listStyle === 'ordered-list-item') {
            RE.appendListItem(root, entry, 'OL');
        } else {
            //unstyled
            root.appendChild(RE.convertEntryToHTML(entry));
            //root.appendChild(document.createElement('br'));
        }
    }
    return root.innerHTML;
};

RE.convertHTMLToEntries = function() {
    var contents = [];
    var childNodes = document.getElementById("editor").childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        var child = childNodes[i];
        if (child.nodeName == 'BR') {
            continue;
        }
        
        // if (child.nodeName == 'OL' || child.nodeName == 'UL') {
        //     var liElements = child.childNodes;
        //     var listStyle = (child.nodeName == 'OL') ? 'ordered-list-item' : 'unordered-list-item';
        //     for (var j = 0; j < liElements.length; j++) {
        //         var li = liElements[j];
        //         if (li.nodeName == 'BR') {
        //             continue;
        //         }
        //         contents.push(RE.convertDivsToContentEntries(li.lastChild, listStyle));
        //     }
        // }
        
        if (child.nodeName == 'DIV') {
            if (child.lastChild.nodeName == 'OL' || child.lastChild.nodeName == 'UL') {
                var newChild = child.lastChild.childNodes; //New kid on the block bout to get smacked back to the boondocks
                var liElements = newChild.childNodes;
                var listStyle = (newChild.nodeName == 'OL') ? 'ordered-list-item' : 'unordered-list-item';
                for (var j = 0; j < liElements.length; j++) {
                    var li = liElements[j];
                    if (li.nodeName == 'BR') {
                        continue;
                    }
                    contents.push(RE.convertDivsToContentEntries(li.lastChild, listStyle));
                }
            } else {
                contents.push(RE.convertDivsToContentEntries(child, 'unstyled'));
            }

        }
    }
    return JSON.stringify(contents);
};

RE.guidGenerator = function() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4());
};


RE.convertDivsToContentEntries = function(node, listStyle) {
   
    
    var contentEntry = {
        key: node.id || RE.guidGenerator(),
        listStyle: listStyle
    };
    
    if(node.className.startsWith('DIVIDER')){
        // Divider code
        contentEntry.inlineStyle = "";
        contentEntry.meta = {
            format: 'divider'
        };
    } else if(node.className.startsWith('IMAGE')) {
        var imageContents = node.lastChild;
        contentEntry.inlineStyle = "";
        contentEntry.meta = {
            format: 'image',
            orientation: imageContents.getAttribute('data-orientation'),
            href: imageContents.src,
            height: imageContents.getAttribute('data-originalHeight'),
            width: imageContents.getAttribute('data-originalWidth')
        };
    } else {
        // regular text
        contentEntry.inlineStyle = node.className;
        contentEntry.text = node.textContent;
    }
    return contentEntry;
};