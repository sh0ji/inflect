const flattenDeep = require('lodash/fp/flattenDeep');

const setSemantics = (el, attr, ...values) => {
    return new Promise((resolve, reject) => {
        const vals = flattenDeep(values.map((val) => {
            return (typeof val === 'string') ? val.split(/,\s*/) : val;
        })).join(' ');
        el.setAttribute(attr, vals);
        resolve();
    });
};

module.exports = setSemantics;
