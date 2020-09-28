import { JSDOM } from 'jsdom';
import { EventEmitter } from 'events';
import HTMLNode, { NodeLocation } from './HtmlNode';
import Task, { TaskInterface } from './Task';

interface OptionsInterface {
	debug?: boolean;
}

interface DebugResults {
	val: Element | undefined;
	loc: NodeLocation;
}

export default class Inflect extends EventEmitter {
	public dom: JSDOM;

	public data: Record<string, (DebugResults|Element|undefined)[]>;

	#tasks: Task[];

	#errors: Record<string, string[]>;

	#taskCount: Record<string, number>;

	#debug: boolean;

	constructor(file: Buffer, options: OptionsInterface) {
		super();
		this.dom = new JSDOM(file.toString(), {
			includeNodeLocations: true,
		});
		this.#debug = options.debug || false;
		this.#tasks = [];
		this.#errors = {};
		this.#taskCount = {};
		this.data = {};
		this.init();
	}

	init(): this {
		this.on('actionEnd', (res, task: Task, el: HTMLNode) => {
			this.processResults(res, task, el);
			el.markDone();
			this.iterateCount(task.name);
			if (task.elements.every((e) => e.done)) {
				task.done();
				this.emit('taskEnd', task);
			}
		});

		this.on('taskEnd', () => {
			if (this.#tasks.every((t) => t.isDone === true)
				|| this.#tasks.length === 0) {
				this.emit('done', this.dom.serialize());
			}
		});

		return this;
	}

	addTask(task: TaskInterface | TaskInterface[]): this {
		if (Array.isArray(task)) {
			task.forEach((t) => this.addTask(t));
		} else {
			this.#tasks.push(new Task(task, this.dom));
		}
		return this;
	}

	inflect(): void {
		this.#tasks.forEach((task) => this.runTask(task));
	}

	runTask(task: Task): this {
		task.loadElements();
		this.emit('elementsLoaded', task.elements.length);
		task.elements.forEach((el) => {
			this.emit('actionStart', task);

			if (!el.element) {
				this.emit('actionEnd', null, task, el);
			} else {
				const results = task.action(el.element, task.parameter as string);
				if (results && 'then' in results) {
					results
						.then((res) => this.emit('actionEnd', res, task, el))
						.catch((err) => this.emit('actionEnd', err, task, el));
				}
				this.emit('actionEnd', results, task, el);
			}
		});
		return this;
	}

	handleError(err: Error | Error[], taskName: string): this {
		if (Array.isArray(err)) {
			err.forEach((e) => this.handleError(e, taskName));
			return this;
		}
		if (!this.#errors[taskName]) {
			this.#errors[taskName] = [];
		}
		this.#errors[taskName].push(err.message);
		this.emit('error', err.stack, taskName);

		return this;
	}

	processResults(results: Element | undefined, task: Task, el: HTMLNode): void {
		if (Array.isArray(results)) {
			results.forEach((result) => this.processResults(result, task, el));
		} else if (results instanceof Error) {
			this.handleError(results, task.name);
		} else {
			let res: Element | DebugResults | undefined = results;
			if (this.#debug && el.nodeLocation) {
				res = {
					val: results,
					loc: el.nodeLocation,
				};
			}
			if (!this.data[task.name]) {
				this.data[task.name] = [];
			}
			this.data[task.name].push(res);
		}
	}

	iterateCount(taskName: string): void {
		if (!this.#taskCount[taskName]) {
			this.#taskCount[taskName] = 0;
		}
		this.#taskCount[taskName] += 1;
	}
}
