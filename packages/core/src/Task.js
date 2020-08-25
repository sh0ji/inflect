const HtmlNode = require('./HtmlNode');
const actions = require('./actions');

class Task {
	constructor(taskObj) {
		this.taskObj = taskObj;

		this.data = [];
		this.done = false;
	}

	get selector() {
		return this.taskObj.selector;
	}

	/**
     * Turn string actions into one of the preset actions
     * @return {Function}
     */
	get action() {
		return (typeof actions[this.taskObj.action] === 'function')
			? actions[this.taskObj.action]
			: this.taskObj.action;
	}

	get parameter() {
		return this.taskObj.parameter;
	}

	get name() {
		return (this.action && this.action.name !== 'action')
			? this.action.name
			: this.selector;
	}

	loadElements(doc) {
		const els = Array.from(doc.querySelectorAll(this.selector));
		this.elements = (els.length > 0)
			? els.map((el) => new HtmlNode(el))
			: [new HtmlNode()];
		return this;
	}

	markDone() {
		this.done = true;
	}
}

module.exports = Task;
