'use stric';

const changeTag = (el, newTag) => {
    return new Promise((resolve, reject) => {
        let currentTag = el.tagName.toLowerCase();
        newTag = newTag.toLowerCase();

        if (newTag && currentTag !== newTag) {
            let openTag = new RegExp(`<${currentTag}(\\s*)`);
            let closeTag = new RegExp(`\\/${currentTag}>`);
            el.outerHTML = el.outerHTML
                .replace(openTag, `<${newTag}$1`)
                .replace(closeTag, `/${newTag}>`);
        }
        resolve();
    })
}

module.exports = changeTag;
