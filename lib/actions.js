/* eslint-disable arrow-body-style */
const flattenDeep = require('lodash/fp/flattenDeep');

function changeTag(el, tag) {
    return new Promise((resolve, reject) => {
        try {
            const currentTag = el.tagName.toLowerCase();
            const newTag = tag.toLowerCase();

            if (newTag && currentTag !== newTag) {
                const parent = el.parentNode;
                const newEl = this.doc.createElement(newTag);
                Array.from(el.attributes).forEach((attr) => {
                    newEl.setAttribute(attr.name, attr.value);
                });
                newEl.innerHTML = el.innerHTML;
                parent.replaceChild(newEl, el);
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function removeAttributes(el, ...attributes) {
    return new Promise((resolve, reject) => {
        try {
            let atts = flattenDeep(attributes.map(attr => attr.split(/,\s*/)));
            atts = (atts.includes('all')) ?
                Array.from(el.attributes).map(attr => attr.name) :
                atts;
            atts.forEach(att => el.removeAttribute(att));
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function removeElement(el, keepChildren) {
    return new Promise((resolve, reject) => {
        try {
            if (keepChildren) {
                while (el.firstChild) {
                    el.parentNode.insertBefore(el.firstChild, el);
                }
            }
            el.remove();
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function setSemantics(el, attr, ...values) {
    return new Promise((resolve, reject) => {
        try {
            const vals = flattenDeep(values.map((val) => {
                return (typeof val === 'string') ? val.split(/,\s*/) : val;
            })).join(' ');
            el.setAttribute(attr, vals);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

/** aliases for special actions */
const removeContainer = el => removeElement(el, true);
const removeParent = el => removeElement(el.parentNode, true);
const setEpubType = (el, ...types) => setSemantics(el, 'epub:type', ...types);
const setRole = (el, ...roles) => setSemantics(el, 'role', ...roles);

module.exports.changeTag = changeTag;
module.exports.setSemantics = setSemantics;
module.exports.removeElement = removeElement;
module.exports.removeAttributes = removeAttributes;
module.exports.removeContainer = removeContainer;
module.exports.removeParent = removeParent;
module.exports.setEpubType = setEpubType;
module.exports.setRole = setRole;
