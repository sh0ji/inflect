(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.htmlInflect = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * --------------------------------------------------------------------------
 * Inflect (v1.1.0): inflect.js
 * Cleanup, modify, and save messy HTML
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict';

// CONSTANTS

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NAME = 'inflect';
var VERSION = '1.1.0';

var Default = {
    autoRun: true,
    debug: false,
    removeWhitespace: true,
    vocab: 'epub'
};

var VocabAttrName = {
    dpub: 'role',
    epub: 'epub:type'
};

var Error = {
    ACTION_MISSING_KEY: function ACTION_MISSING_KEY(task, action, missingKey) {
        return {
            title: 'The ' + action + ' action requires an \'' + missingKey + '\' key and value.',
            description: 'The task must be in the format { action: ' + action + ', ' + missingKey + ': value }'
        };
    },
    ACTION_NOT_VALID: function ACTION_NOT_VALID(task, action) {
        return {
            title: action + ' is not a valid action.'
        };
    },
    ATTRIBUTE_NOT_VALID: function ATTRIBUTE_NOT_VALID(task, attribute) {
        return {
            title: attribute + ' is not a valid attribute.',
            description: 'The attribute must be a string, an array of strings, or an object with a name key ({ name: \'href\' }).'
        };
    },
    ATTRIBUTE_MISSING_KEY: function ATTRIBUTE_MISSING_KEY(task, attribute) {
        return {
            title: attribute + ' is missing a key. Both the name and value keys are required.',
            description: 'To set an attribute, format the attribute as an object with both a name key and a value key. e.g. [{ name: \'href\', value: \'#mylink\' }]'
        };
    }
};

// CLASS DEFINITION

var Inflect = function () {

    // accepts a document and optional config
    function Inflect(doc, config) {
        var _this = this;

        _classCallCheck(this, Inflect);

        this.doc = doc;
        this.config = this._getConfig(config);
        this.tasks = this._getTasks(this.config.tasks);
        this.count = {};

        if (this.config.autoRun) {
            this.tasks.map(function (task) {
                _this.runTask(task, function (error, taskName) {
                    if (error) _this._handleError(error);
                    if (taskName) _this._incrementCount(taskName);
                });
            });
        }
    }

    // PUBLIC

    // delete an element, but leave the non-empty children


    _createClass(Inflect, [{
        key: 'removeElement',
        value: function removeElement(el, task, callback) {
            var actionName = 'removeElement';
            while (el.firstChild) {
                el.parentNode.insertBefore(el.firstChild, el);
            }
            el.parentNode.removeChild(el);
            callback(null, actionName);
        }

        // delete an attribute from an element

    }, {
        key: 'removeAttribute',
        value: function removeAttribute(el, task, callback) {
            var actionName = 'removeAttribute';
            switch (_typeof(task.attribute)) {
                case 'string':
                    if (task.attribute === 'all') {
                        Array.from(el.attributes).map(function (attr) {
                            el.removeAttribute(attr.name);
                        });
                    } else {
                        el.removeAttribute(task.attribute);
                    }
                    callback(null, actionName);
                    break;
                case 'object':
                    task.attribute.map(function (attr) {
                        if (typeof attr === 'string') {
                            el.removeAttribute(attr);
                            callback(null, actionName);
                        } else if (attr.name) {
                            el.removeAttribute(attr.name);
                            callback(null, actionName);
                        } else {
                            callback(Error.ATTRIBUTE_NOT_VALID(task, attr));
                        }
                    });
                    break;
                case 'undefined':
                    callback(Error.ACTION_MISSING_KEY(task, actionName, 'attribute'));
                    break;
                default:
                    callback(Error.ATTRIBUTE_NOT_VALID(task.attribute));
            }
        }

        // change tag by regexp replacing the opening and closing strings

    }, {
        key: 'replaceTag',
        value: function replaceTag(el, task, callback) {
            var actionName = 'replaceTag';
            var newTag = task.tag ? task.tag.toLowerCase() : null;
            var currentTag = el.nodeName.toLowerCase();
            if (!newTag) {
                callback(Error.ACTION_MISSING_KEY(task, actionName, 'tag'));
            } else if (currentTag !== newTag) {
                var openTag = new RegExp('<' + currentTag + 's*', 'g');
                var closeTag = new RegExp('/' + currentTag + '>', 'g');
                el.outerHTML = el.outerHTML.replace(openTag, '<' + newTag + ' ').replace(closeTag, '/' + newTag + '>');
                callback(null, actionName);
            }
        }

        // set attributes on the element based on data in task object

    }, {
        key: 'setAttribute',
        value: function setAttribute(el, task, callback) {
            var actionName = 'setAttribute';
            switch (_typeof(task.attribute)) {
                case 'object':
                    // coerce attributes into an array for easier iteration
                    var attrs = task.attribute[0] === undefined ? Array.of(task.attribute) : task.attribute;
                    attrs.map(function (attr) {
                        if (attr.name && attr.value) {
                            el.setAttribute(attr.name, attr.value);
                            callback(null, actionName);
                        } else {
                            callback(Error.ATTRIBUTE_MISSING_KEY(task, attr));
                        }
                    });
                    break;
                case 'undefined':
                    if (task[this.config.vocab]) {
                        el.setAttribute(VocabAttrName[this.config.vocab], task[this.config.vocab]);
                        callback(null, this.config.vocab);
                    } else {
                        callback(Error.ACTION_MISSING_KEY(task, actionName, 'attribute'));
                    }
                    break;
                default:
                    callback(Error.ATTRIBUTE_NOT_VALID(task, task.attribute));
            }
        }

        // the starting-point function for semantic inflection

    }, {
        key: 'runTask',
        value: function runTask(task, callback) {
            var _this2 = this;

            var elements = Array.from(this.doc.querySelectorAll(task.selector));

            elements.map(function (el) {
                if (_this2.config.removeWhitespace) _this2._removeWhitespace(el);

                switch (_typeof(task.action)) {
                    case 'function':
                        task.action.call(el, function (error, taskName) {
                            callback(error, taskName);
                        });
                        break;
                    case 'string':
                        _this2[task.action](el, task, function (error, taskName) {
                            callback(error, taskName);
                        });
                        break;
                    case 'object':
                        task.action.map(function (action) {
                            if (typeof action === 'string') {
                                _this2[action](el, task, function (error, taskName) {
                                    callback(error, taskName);
                                });
                            } else {
                                callback(ACTION_NOT_VALID(action));
                            }
                        });
                    case 'undefined':
                        _this2._fixElement(el, task);
                        break;
                    default:
                        callback(ACTION_NOT_VALID(task.action));
                }
            });
        }

        // PRIVATE

        // overwrite default options with supplied options

    }, {
        key: '_getConfig',
        value: function _getConfig(config) {
            return Object.assign({}, Default, config);
        }

        // combine preset tasks
        // resulting array holds all presets in order followed by user-specified tasks

    }, {
        key: '_getTasks',
        value: function _getTasks(tasks) {
            tasks = typeof tasks === 'undefined' ? [] : tasks;
            var presets = [];
            if (this.config.presets) {
                this.config.presets.map(function (preset) {
                    var p = _dereq_(preset);
                    presets = presets.concat(p);
                });
            }
            tasks = presets.concat(tasks);
            return tasks;
        }

        // attempt to dynamically fix the element when no action is given

    }, {
        key: '_fixElement',
        value: function _fixElement(el, task) {
            var _this3 = this;

            if (task.attribute || task[this.config.vocab]) {
                this.setAttribute(el, task, function (error, taskName) {
                    if (error) _this3._handleError(error);
                    if (taskName) _this3._incrementCount(taskName);
                });
            }
            if (task.tag) {
                this.replaceTag(el, task, function (error, taskName) {
                    if (error) _this3._handleError(error);
                    if (taskName) _this3._incrementCount(taskName);
                });
            }
        }

        // returns true if the node is an empty text string

    }, {
        key: '_nodeIsEmpty',
        value: function _nodeIsEmpty(node) {
            // node exists, is a text node, and is empty after trim
            return node && node.nodeType === 3 && node.nodeValue.trim().length === 0;
        }

        // remove the surrounding whitespace

    }, {
        key: '_removeWhitespace',
        value: function _removeWhitespace(el) {
            var prev = el;
            while ((prev = prev.previousSibling) && this._nodeIsEmpty(prev)) {
                prev.remove();
            }
            if (this._nodeIsEmpty(el.nextSibling)) el.nextSibling.remove();
        }

        // copy all non-empty children from one element (el) to another (newEl)

    }, {
        key: '_getChildren',
        value: function _getChildren(el, newEl) {
            var _this4 = this;

            Array.from(el.children).map(function (child) {
                if (!_this4._nodeIsEmpty(child)) newEl.appendChild(child);
            });
            return newEl;
        }

        // increase the count for a specified count key

    }, {
        key: '_incrementCount',
        value: function _incrementCount(name) {
            if (this.count[name] === undefined) {
                this.count[name] = 0;
            }
            this.count[name]++;
        }

        // needs improvement

    }, {
        key: '_handleError',
        value: function _handleError(error) {
            if (this.config.debug) {
                console.error(error.title);
            }
        }
    }]);

    return Inflect;
}();

exports.default = Inflect;
module.exports = exports['default'];

},{}]},{},[1])(1)
});