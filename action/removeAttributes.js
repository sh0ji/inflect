const flattenDeep = require('lodash/fp/flattenDeep');

const removeAttributes = (el, ...attributes) => {
    return new Promise((resolve, reject) => {
        let atts = flattenDeep(attributes.map(attr => attr.split(/,\s*/)));
        atts = (atts.includes('all')) ?
            Array.from(el.attributes).map(attr => attr.name) :
            atts;
        atts.forEach(att => el.removeAttribute(att));
        resolve();
    });
};

module.exports = removeAttributes;
