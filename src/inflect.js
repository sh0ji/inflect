/**
 * --------------------------------------------------------------------------
 * Inflect (v1.0.1): inflect.js
 * Cleanup, modify, and save messy HTML
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict'

// CONSTANTS

const Default = {
    includeInDesignTasks: true,
    removeWhitespace: true,
    vocab: 'epub'
}

// tasks for common InDesign HTML export issues
// these are run first if included via the includeInDesignTasks option
const InDesignTasks = [{
    'action': 'removeElement',
    'selector': '[id^=_id],[class^=_id]'
},
{
    'action': 'removeAttribute',
    'selector': '[lang]:not(html)',
    'attribute': 'lang'
}]

const ItemKeys = {
    selector: 'selector',
    tagReplacement: 'tag',
    attributeRemoval: 'attribute'
}

const VocabAttrName = {
    dpub: 'role',
    epub: 'epub:type'
}


// CLASS DEFINITION

class Inflect {

    // accepts a document, array of items (items.json), and optional config
    constructor(doc, items, config) {
        this.doc = doc
        this.config = this._getConfig(config)

        if (items) {
            this.items = this._getItems(items)

            for (let item of this.items) {
                this.inflectItem(item)
            }
        }
    }


    // PUBLIC

    // delete an element, but leave the non-empty children
    removeElement(el) {
        // save children into document fragment
        let newEl = this._getChildren(el, this.doc.createDocumentFragment())

        // document fragment disappears on replaceChild, leaving just the children
        el.parentNode.replaceChild(newEl, el)
    }

    // delete an attribute from an element
    removeAttr(el, item) {
        if (item[ItemKeys.attributeRemoval] === 'all') {
            for (let attr of el.attributes) {
                el.removeAttribute(attr.name)
            }
        } else if (typeof item[ItemKeys.attributeRemoval] === 'object') {
            for (let attr of item[ItemKeys.attributeRemoval]) {
                el.removeAttribute(attr)
            }
        } else {
            el.removeAttribute(item[ItemKeys.attributeRemoval])
        }
    }

    // fix element based on data in item object
    fixElement(el, item) {
        let currentTag = el.tagName.toLowerCase()
        let newTag = (item[ItemKeys.tagReplacement]) ? item[ItemKeys.tagReplacement].toLowerCase() : null

        // change tag by regexp replacing the opening and closing strings
        if (newTag && currentTag !== newTag) {
            let openTag = new RegExp(`<${currentTag} `, 'g')
            let closeTag = new RegExp(`/${currentTag}>`, 'g')
            el.outerHTML = el.outerHTML.replace(openTag, `<${newTag} `).replace(closeTag, `/${newTag}>`)
        }
        this.setAttributes(el, item)
    }

    // set attributes on the element based on data in item object
    setAttributes(el, item) {
        if (item[this.config.vocab]) {
            el.setAttribute(VocabAttrName[this.config.vocab], item[this.config.vocab])
        }
    }

    // the starting-point function for semantic inflection
    inflectItem(item) {
        let elements = this.doc.querySelectorAll(item[ItemKeys.selector])

        for (let el of elements) {
            if (this.config.removeWhitespace) this._removePrecedingWhitespace(el)

            switch (item.action) {
                case 'removeElement':
                    this.removeElement(el)
                    break;
                case 'removeAttribute':
                    this.removeAttr(el, item)
                    break;
                default:
                    this.fixElement(el, item)
            }
        }
    }


    // PRIVATE

    // overwrite default options with supplied options
    _getConfig(config) {
        return Object.assign({}, Default, config)
    }

    // add items to the end of default tasks
    _getItems(items) {
        return (this.config.includeInDesignTasks) ? InDesignTasks.concat(items) : items
    }

    // returns true if the node is an empty text string
    _nodeIsEmpty(node) {
        // node exists, is a text node, and is empty after trim
        return node && node.nodeType === 3 && node.nodeValue.trim().length === 0
    }

    // remove the previous node if it's empty
    _removePrecedingWhitespace(el) {
        let prev = el.previousSibling
        if (this._nodeIsEmpty(prev)) prev.remove()
    }

    // copy all non-empty children from one element (el) to another (newEl)
    _getChildren(el, newEl) {
        for (let child of el.childNodes) {
            if (!this._nodeIsEmpty(child)) newEl.appendChild(child)
        }
        return newEl
    }
}

export default Inflect
