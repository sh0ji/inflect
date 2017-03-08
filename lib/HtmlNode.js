const jsdom = require('jsdom');

class HtmlNode {
    constructor(el) {
        if (el) this.element = el;
        this.done = false;
    }

    get nodeLocation() {
        return (this.element) ? jsdom.nodeLocation(this.element) : null;
    }

    markDone() {
        this.done = true;
    }
}

module.exports = HtmlNode;
