import { HtmlNode } from './HtmlNode';

export type Action<T = Element, O = Record<string, unknown>, D = Document> =
	(node: T, opts?: O, dom?: D) => void | T;

export type AsyncAction<T = Element, O = Record<string, unknown>, D = Document> =
	(node: T, opts?: O, dom?: D) => Promise<void> | Promise<T>;

export interface TaskInterface {
	action: Action;
	selector: string;
	parameter?: Record<string, unknown>;
}

export class Task {
	#taskObj: TaskInterface;

	public elements: HtmlNode[];

	public isDone = false;

	constructor(taskObj: TaskInterface, public dom: Document) {
		this.#taskObj = taskObj;
		this.elements = [];
		this.dom = dom;
	}

	get selector(): string {
		return this.#taskObj.selector;
	}

	get action(): Action | AsyncAction {
		return this.#taskObj.action;
	}

	get parameter(): Record<string, unknown> | undefined {
		return this.#taskObj.parameter;
	}

	get name(): string {
		if (typeof this.action === 'function' && this.action.name !== 'action') {
			return this.action.name;
		}
		return this.selector;
	}

	loadElements(): Task {
		const els = Array.from(this.dom.querySelectorAll(this.selector));
		this.elements = (els.length > 0)
			? els.map((el) => new HtmlNode(el))
			: [new HtmlNode(null)];
		return this;
	}

	done(): void {
		this.isDone = true;
	}
}
