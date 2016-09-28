/**
 * --------------------------------------------------------------------------
 * Inflect (v1.0.0): inflect.js
 * Cleanup, modify, and save messy HTML
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict'

const Default = {
    includeDefaultTasks: true,
    removeWhitespace: true,
    vocab: 'epub'
}

const DefaultTasks = [{
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
    tagReplacement: 'tagName',
    epubMicrodata: 'epub',
    dpubMicrodata: 'dpub',
    attributeRemoval: 'attribute'
}

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


    // public

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
        // change tagName
        if (item[ItemKeys.tagReplacement] &&
            el.tagName.toLowerCase() !== item[ItemKeys.tagReplacement].toLowerCase()) {
            let emptyEl = this.doc.createElement(item[ItemKeys.tagReplacement].toLowerCase())
            let newEl = this._getChildren(el, emptyEl)
            el.parentNode.replaceChild(newEl, el)
        }
        this.setAttributes(el, item)
    }

    // set attributes on the element based on data in item object
    setAttributes(el, item) {
        if (item[ItemKeys.tagReplacement]) {
            el.className = item[ItemKeys.selector].replace('.', '')
        }
        if (item[ItemKeys.epubMicrodata] && this.config.vocab === 'epub') {
            el.setAttribute('epub:type', item[ItemKeys.epubMicrodata])
        }
        if (item[ItemKeys.dpubMicrodata] && this.config.vocab === 'dpub') {
            el.setAttribute('role', item[ItemKeys.dpubMicrodata])
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


    // private

    // overwrite default options with supplied options
    _getConfig(config) {
        return Object.assign({}, Default, config)
    }

    // add items to the end of default tasks
    _getItems(items) {
        return (this.config.includeDefaultTasks) ? DefaultTasks.concat(items) : items
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
