/**
 * --------------------------------------------------------------------------
 * html-inflect
 * Cleanup, modify, and save messy HTML
 * @author Evan Yamanishi
 * @license GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict'

const assert = require('assert')
const changeTag = require('./fp/changeTag')
const removeAttributes = require('./fp/removeAttributes')
const removeElement = require('./fp/removeElement')
const setSemantics = require('./fp/setSemantics')

const NAME = 'inflect'
const VERSION = '2.0.0'

class Inflect {
    constructor(doc) {
        try {
            if (document instanceof HTMLDocument) this.doc = document
        } catch (err) {
            assert(typeof doc === 'object', 'A document object is required')
            this.doc = doc
        }
    }

    get name() {
        return NAME
    }

    get version() {
        return VERSION
    }

    get count() {
        return this._count
    }

    runTask(task) {
        assert(task.selector, 'A selector is required')
        assert(typeof task.function === 'function' ||
            typeof Inflect[task.function] === 'function',
            `${task.function} is not a valid function`)

        Array.from(this.doc.querySelectorAll(task.selector)).forEach((el) => {
            let fn = (typeof Inflect[task.function] === 'function') ?
                Inflect[task.function] :
                task.function
            fn(el, task.parameter).then((result) => {
                result = result || fn.name
                this._processResults
            })
        })
    }

    runTasks(tasks) {
        for (let task of tasks) {
            this.runTask(task)
        }
    }

    _processResults(result) {
        switch (result.constructor) {
            case Array:
                if typeof result[1] === 'string') {
                    this._processResults(result[0])
                    this._incrementCount(result[1])
                } else {
                    this.runTasks(result)
                }
                break;
            case Object:
                this.runTask(result)
            case String:
                this._incrementCount(result)
        }
    }

    _incrementCount(key) {
        this._count[key] = (this._count[key] === undefined) ?
            0 :
            this._count[key] + 1
    }

    static changeTag(el, newTag) {
        return changeTag(el, newTag)
    }

    static removeAttributes(el, ...attributes) {
        return removeAttributes(el, ...attributes)
    }

    static removeContainer(el) {
        return removeElement(el, true)
    }

    static removeElement(el, keepChildren) {
        return removeElement(el, keepChildren)
    }

    static removeParent(el) {
        return removeElement(el.parentNode, true)
    }

    static setEpubType(el, ...types) {
        return setSemantics(el, 'epub\:type', ...types)
    }

    static setRole(el, ...roles) {
        return setSemantics(el, 'role', ...roles)
    }
}

module.exports = Inflect
