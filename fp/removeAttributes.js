'use strict';

const flattenDeep = require('lodash/fp/flattenDeep');

const removeAttributes = (el, ...attributes) => {
    return new Promise((resolve, reject) => {
        attributes = flattenDeep(attributes.map(attr => attr.split(/,\s*/)));
        attributes = (attributes.includes('all')) ?
            Array.from(el.attributes).map(attr => attr.name) :
            attributes;
        for (let i = 0; i < attributes.length; i++) {
            el.removeAttribute(attributes[i]);
        }
        resolve();
    })
}

module.exports = removeAttributes;
