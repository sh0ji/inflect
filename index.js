/**
 * --------------------------------------------------------------------------
 * html-inflect
 * Cleanup, modify, and save messy HTML
 * @author Evan Yamanishi
 * @license GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict';

const assert = require('assert');
const changeTag = require('./action/changeTag');
const removeAttributes = require('./action/removeAttributes');
const removeElement = require('./action/removeElement');
const setSemantics = require('./action/setSemantics');

class Inflect {
    constructor(doc) {
        try {
            if (document instanceof HTMLDocument) this.doc = document;
        } catch (err) {
            assert(typeof doc === 'object', 'A document object is required');
            this.doc = doc;
        }
        this.count = {};
    }
    }

    runTask(task) {
        assert(task.constructor === Object, 'Task must be an object');
        assert(task.selector, 'A selector is required');
        assert(typeof task.action === 'function' ||
            typeof Inflect[task.action] === 'function',
            `${task.action} is not a valid function`);

        return new Promise((resolve, reject) => {
            Array.from(this.doc.querySelectorAll(task.selector)).forEach((el) => {
                let fn = (typeof Inflect[task.action] === 'function') ?
                    Inflect[task.action] :
                    task.action;
                fn(el, task.parameter)
                    .then((result) => {
                        result = result || fn.name;
                        this._processResults(result).then((res) => resolve(res));
                    });
            });
        }).then((result) => this._processResults(result));
    }

    runTasks(tasks) {
        return new Promise((resolve, reject) => {
            this._async(tasks, 0).then(() => resolve());
        });
    }

    _async(taskArr, index) {
        return new Promise((resolve, reject) => {
            this.runTask(taskArr[index]).then(() => {
                index++;
                if (index < taskArr.length) {
                    this._async(taskArr, index).then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    }

    _processResults(result) {
        return new Promise((resolve, reject) => {
            if (!result) resolve();
            switch (result.constructor) {
                case Array:
                    if (typeof result[1] === 'string') {
                        this._incrementCount(result[1]);
                        resolve(result[0]);
                    } else {
                        this.runTasks(result).then(() => resolve());
                    }
                    break;
                case Object:
                    this.runTask(result).then(() => resolve());
                    break;
                case String:
                    this._incrementCount(result);
                    resolve();
                    break;
                default:
                    resolve();
            }
        });
    }

    _incrementCount(key) {
        this.count[key] = (this.count[key] === undefined) ?
            1 :
            this.count[key] + 1;
    }

    static changeTag(el, newTag) {
        return changeTag(el, newTag);
    }

    static removeAttributes(el, ...attributes) {
        return removeAttributes(el, ...attributes);
    }

    static removeContainer(el) {
        return removeElement(el, true);
    }

    static removeElement(el, keepChildren) {
        return removeElement(el, keepChildren);
    }

    static removeParent(el) {
        return removeElement(el.parentNode, true);
    }

    static setEpubType(el, ...types) {
        return setSemantics(el, 'epub\:type', ...types);
    }

    static setRole(el, ...roles) {
        return setSemantics(el, 'role', ...roles);
    }
}

module.exports = Inflect;
