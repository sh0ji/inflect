import { JSDOM } from 'jsdom';
import HtmlNode from './HtmlNode';
import Actions, { ActionNames } from './Actions';

export interface TaskInterface {
	action: ActionNames | ((el: Element) => void | Element);
	selector: string;
	parameter?: string;
}

class Task {
	private taskObj: TaskInterface;

	private dom: JSDOM;

	private defaultActions: Actions;

	public elements: HtmlNode[];

	public done: boolean;

	constructor(taskObj: TaskInterface, dom: JSDOM) {
		this.taskObj = taskObj;
		this.elements = [];
		this.done = false;
		this.dom = dom;
		this.defaultActions = new Actions(dom);
	}

	get selector(): string {
		return this.taskObj.selector;
	}

	/**
     * Turn string actions into one of the preset actions
     * @return {Function}
     */
	get action(): Actions[ActionNames] | ((el: Element) => void | Element) {
		if (typeof this.taskObj.action === 'string') {
			if (this.taskObj.action in this.defaultActions) {
				return this.defaultActions[this.taskObj.action];
			}
			throw new Error(`${this.taskObj.action} is not a valid action.`);
		}
		return this.taskObj.action;
	}

	get parameter(): string | undefined {
		return this.taskObj.parameter;
	}

	get name(): string {
		if (typeof this.action === 'function' && this.action.name !== 'action') {
			return this.action.name;
		}
		return this.selector;
	}

	loadElements(): Task {
		const { document } = this.dom.window;
		const els = Array.from(document.querySelectorAll(this.selector));
		this.elements = (els.length > 0)
			? els.map((el) => new HtmlNode(el, this.dom))
			: [new HtmlNode(null, this.dom)];
		return this;
	}

	markDone(): void {
		this.done = true;
	}
}

export default Task;
