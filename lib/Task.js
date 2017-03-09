const HtmlNode = require('./HtmlNode');
const actions = require('./actions');

const Action = Symbol('action');

class Task {
    constructor(taskObj, doc) {
        this[Action] = taskObj.action;
        this.selector = taskObj.selector;
        if (taskObj.parameter) this.parameter = taskObj.parameter;

        this.data = [];
        this.done = false;
        this.elements = this.getElements(doc);
    }

    /**
     * Turn string actions into one of the preset actions
     * @return {Function}
     */
    get action() {
        return (typeof actions[this[Action]] === 'function') ?
            actions[this[Action]] :
            this[Action];
    }

    get name() {
        return (this.action.name !== 'action') ?
            this.action.name :
            this.action.selector;
    }

    markDone() {
        this.done = true;
    }

    getElements(doc) {
        const els = Array.from(doc.querySelectorAll(this.selector));
        return (els.length > 0) ?
            els.map(el => new HtmlNode(el)) :
            [new HtmlNode()];
    }
}

module.exports = Task;
