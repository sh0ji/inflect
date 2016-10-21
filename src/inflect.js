/**
 * --------------------------------------------------------------------------
 * Inflect (v1.1.0): inflect.js
 * Cleanup, modify, and save messy HTML
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict'

// CONSTANTS

const NAME = 'inflect'
const VERSION = '1.1.0'

const Default = {
    autoRun: true,
    debug: false,
    presets: ['html-inflect-preset-indesign'],
    removeWhitespace: true,
    vocab: 'epub'
}

const VocabAttrName = {
    dpub: 'role',
    epub: 'epub:type'
}

const Error = {
    ACTION_MISSING_KEY(task, action, missingKey) {
        return {
            title: `The ${action} action requires an '${missingKey}' key and value.`,
            description: `The task must be in the format { action: ${action}, ${missingKey}: value }`
        }
    },
    ACTION_NOT_VALID(task, action) {
        return {
            title: `${action} is not a valid action.`
        }
    },
    ATTRIBUTE_NOT_VALID(task, attribute) {
        return {
            title: `${attribute} is not a valid attribute.`,
            description: `The attribute must be a string, an array of strings, or an object with a name key ({ name: 'href' }).`
        }
    },
    ATTRIBUTE_MISSING_KEY(task, attribute) {
        return {
            title: `${attribute} is missing a key. Both the name and value keys are required.`,
            description: `To set an attribute, format the attribute as an object with both a name key and a value key. e.g. [{ name: 'href', value: '#mylink' }]`
        }
    }
}


// CLASS DEFINITION

class Inflect {

    // accepts a document and optional config
    constructor(doc, config) {
        this.doc = doc
        this.config = this._getConfig(config)
        this.tasks = this._getTasks(this.config.tasks)
        this.count = {}

        if (this.config.autoRun) {
            this.tasks.map((task) => {
                this.runTask(task, (error, taskName) => {
                    if (error) this._handleError(error)
                    if (taskName) this._incrementCount(taskName)
                })
            })
        }
    }


    // PUBLIC

    // delete an element, but leave the non-empty children
    removeElement(el, task, callback) {
        while (el.firstChild) {
            el.parentNode.insertBefore(el.firstChild, el)
        }
        el.parentNode.removeChild(el)
        callback(null, 'removeElement')
    }

    // delete an attribute from an element
    removeAttribute(el, task, callback) {
        switch (typeof task.attribute) {
            case 'string':
                if (task.attribute === 'all') {
                    Array.from(el.attributes).map((attr) => {
                        el.removeAttribute(attr.name)
                    })
                } else {
                    el.removeAttribute(task.attribute)
                }
                callback(null, 'removeAttribute')
                break;
            case 'object':
                task.attribute.map((attr) => {
                    el.removeAttribute(attr)
                })
                callback(null, 'removeAttribute')
                break;
            case 'undefined':
                callback(Error.ACTION_MISSING_KEY('removeAttribute', 'attribute'))
                break;
            default:
                callback()
        }
    }

    // change tag by regexp replacing the opening and closing strings
    replaceTag(el, task, callback) {
        let newTag = (task.tag) ? task.tag.toLowerCase() : null
        let currentTag = el.nodeName.toLowerCase()
        if (!newTag) {
            callback(Error.ACTION_MISSING_KEY('replaceTag', 'tag'))
        } else if (currentTag !== newTag) {
            let openTag = new RegExp(`<${currentTag}\s*`, 'g')
            let closeTag = new RegExp(`/${currentTag}>`, 'g')
            el.outerHTML = el.outerHTML.replace(openTag, `<${newTag} `).replace(closeTag, `/${newTag}>`)
            callback(null, 'replaceTag')
        }
    }

    // attempt to dynamically fix the element when no action is given
    fixElement(el, task, callback) {
        this.replaceTag(el, task, (error, taskName) => {
            callback(error, taskName)
        })
        this.setAttributes(el, task, (error, taskName) => {
            callback(error, taskName)
        })
    }

    // set attributes on the element based on data in task object
    setAttributes(el, task, callback) {
        if (task[this.config.vocab]) {
            el.setAttribute(VocabAttrName[this.config.vocab], task[this.config.vocab])
            callback(null, 'setAttributes')
        }
    }

    // the starting-point function for semantic inflection
    runTask(task, callback) {
        let elements = Array.from(this.doc.querySelectorAll(task.selector))

        elements.map((el) => {
            if (this.config.removeWhitespace) {
                this._removeWhitespace(el)
            }

            switch (typeof task.action) {
                case 'function':
                    task.action.call(el, (error, taskName) => {
                        callback(error, taskName)
                    })
                    break;
                case 'string':
                    this[task.action](el, task, (error, taskName) => {
                        callback(error, taskName)
                    })
                    break;
                case 'object':
                    task.action.map((action) => {
                        if (typeof action === 'string') {
                            this[action](el, task, (error, taskName) => {
                                callback(error, taskName)
                            })
                        } else {
                            callback(ACTION_NOT_VALID(action))
                        }
                    })
                case 'undefined':
                    this.fixElement(el, task, (error, taskName) => {
                        callback(error, taskName)
                    })
                    break;
                default:
                    callback(ACTION_NOT_VALID(task.action))
            }
        })
    }


    // PRIVATE

    // overwrite default options with supplied options
    _getConfig(config) {
        return Object.assign({}, Default, config)
    }

    // combine preset tasks
    // resulting array holds all presets in order followed by user-specified tasks
    _getTasks(tasks) {
        tasks = (typeof tasks === 'undefined') ? [] : tasks
        let presets = []
        if (this.config.presets) {
            this.config.presets.map((preset) => {
                let p = require(preset)
                presets = presets.concat(p)
            })
        }
        tasks = presets.concat(tasks)
        return tasks
    }

    // returns true if the node is an empty text string
    _nodeIsEmpty(node) {
        // node exists, is a text node, and is empty after trim
        return node && node.nodeType === 3 && node.nodeValue.trim().length === 0
    }

    // remove the surrounding whitespace
    _removeWhitespace(el) {
        let prev = el
        while ((prev = prev.previousSibling) && this._nodeIsEmpty(prev)) {
            prev.remove()
        }
        if (this._nodeIsEmpty(el.nextSibling)) el.nextSibling.remove()
    }

    // copy all non-empty children from one element (el) to another (newEl)
    _getChildren(el, newEl) {
        Array.from(el.children).map((child) => {
            if (!this._nodeIsEmpty(child)) newEl.appendChild(child)
        })
        return newEl
    }

    // needs improvement
    _handleError(error) {
        if (this.config.debug) {
            console.error(error.title)
        }
    }
}

export default Inflect
