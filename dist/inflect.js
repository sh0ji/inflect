/**
 * --------------------------------------------------------------------------
 * Inflect (v1.0.0): inflect.js
 * Cleanup, modify, and save messy HTML
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * --------------------------------------------------------------------------
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Default = {
    includeDefaultTasks: true,
    removeWhitespace: true,
    vocab: 'epub'
};

var DefaultTasks = [{
    'action': 'removeElement',
    'selector': '[id^=_id],[class^=_id]'
}, {
    'action': 'removeAttribute',
    'selector': '[lang]',
    'attribute': 'lang'
}];

var ItemKeys = {
    selector: 'selector',
    tagReplacement: 'tagName',
    epubMicrodata: 'epub',
    dpubMicrodata: 'dpub',
    attributeRemoval: 'attribute'
};

var Inflect = function () {

    // accepts a document, array of items (items.json), and optional config
    function Inflect(doc, items, config) {
        _classCallCheck(this, Inflect);

        this.doc = doc;
        this.config = this._getConfig(config);

        if (items) {
            this.items = this._getItems(items);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    this.inflectItem(item);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }

    // public

    // delete an element, but leave the non-empty children


    _createClass(Inflect, [{
        key: 'removeElement',
        value: function removeElement(el) {
            // save children into document fragment
            var newEl = this._getChildren(el, this.doc.createDocumentFragment());

            // document fragment disappears on replaceChild, leaving just the children
            el.parentNode.replaceChild(newEl, el);
        }

        // delete an attribute from an element

    }, {
        key: 'removeAttr',
        value: function removeAttr(el, item) {
            if (item[ItemKeys.attributeRemoval] === 'all') {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = el.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var attr = _step2.value;

                        el.removeAttribute(attr.name);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            } else if (_typeof(item[ItemKeys.attributeRemoval]) === 'object') {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = item[ItemKeys.attributeRemoval][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _attr = _step3.value;

                        el.removeAttribute(_attr);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            } else {
                el.removeAttribute(item[ItemKeys.attributeRemoval]);
            }
        }

        // fix element based on data in item object

    }, {
        key: 'fixElement',
        value: function fixElement(el, item) {
            // change tagName
            if (item[ItemKeys.tagReplacement] && el.tagName.toLowerCase() !== item[ItemKeys.tagReplacement].toLowerCase()) {
                var emptyEl = this.doc.createElement(item[ItemKeys.tagReplacement].toLowerCase());
                var newEl = this._getChildren(el, emptyEl);
                el.parentNode.replaceChild(newEl, el);
            }
            this.setAttributes(el, item);
        }

        // set attributes on the element based on data in item object

    }, {
        key: 'setAttributes',
        value: function setAttributes(el, item) {
            if (item[ItemKeys.tagReplacement]) {
                el.className = item[ItemKeys.selector].replace('.', '');
            }
            if (item[ItemKeys.epubMicrodata] && this.config.vocab === 'epub') {
                el.setAttribute('epub:type', item[ItemKeys.epubMicrodata]);
            }
            if (item[ItemKeys.dpubMicrodata] && this.config.vocab === 'dpub') {
                el.setAttribute('role', item[ItemKeys.dpubMicrodata]);
            }
        }

        // the starting-point function for semantic inflection

    }, {
        key: 'inflectItem',
        value: function inflectItem(item) {
            var elements = this.doc.querySelectorAll(item[ItemKeys.selector]);

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var el = _step4.value;

                    if (this.config.removeWhitespace) this._removePrecedingWhitespace(el);

                    switch (item.action) {
                        case 'removeElement':
                            this.removeElement(el);
                            break;
                        case 'removeAttribute':
                            this.removeAttr(el, item);
                            break;
                        default:
                            this.fixElement(el, item);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }

        // private

        // overwrite default options with supplied options

    }, {
        key: '_getConfig',
        value: function _getConfig(config) {
            return Object.assign({}, Default, config);
        }

        // add items to the end of default tasks

    }, {
        key: '_getItems',
        value: function _getItems(items) {
            return this.config.includeDefaultTasks ? DefaultTasks.concat(items) : items;
        }

        // returns true if the node is an empty text string

    }, {
        key: '_nodeIsEmpty',
        value: function _nodeIsEmpty(node) {
            // node exists, is a text node, and is empty after trim
            return node && node.nodeType === 3 && node.nodeValue.trim().length === 0;
        }

        // remove the previous node if it's empty

    }, {
        key: '_removePrecedingWhitespace',
        value: function _removePrecedingWhitespace(el) {
            var prev = el.previousSibling;
            if (this._nodeIsEmpty(prev)) prev.remove();
        }

        // copy all non-empty children from one element (el) to another (newEl)

    }, {
        key: '_getChildren',
        value: function _getChildren(el, newEl) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = el.childNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var child = _step5.value;

                    if (!this._nodeIsEmpty(child)) newEl.appendChild(child);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return newEl;
        }
    }]);

    return Inflect;
}();

exports.default = Inflect;