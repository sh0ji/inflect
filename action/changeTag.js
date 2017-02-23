const changeTag = (el, tag) => {
    return new Promise((resolve, reject) => {
        const currentTag = el.tagName.toLowerCase();
        const newTag = tag.toLowerCase();

        if (newTag && currentTag !== newTag) {
            const openTag = new RegExp(`<${currentTag}(\\s*)`);
            const closeTag = new RegExp(`\\/${currentTag}>`);
            el.outerHTML = el.outerHTML             // eslint-disable-line
                .replace(openTag, `<${newTag}$1`)
                .replace(closeTag, `/${newTag}>`);
        }
        resolve();
    });
};

module.exports = changeTag;
