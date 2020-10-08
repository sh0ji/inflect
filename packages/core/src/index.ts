import { EventEmitter } from 'events';
import { HtmlNode } from './HtmlNode';
import { Task, TaskInterface } from './Task';

export class Inflect extends EventEmitter {
	public data: Record<string, (Element|undefined)[]> = {};

	#tasks: Task[] = [];

	#errors: Record<string, string[]> = {};

	#taskCount: Record<string, number> = {};

	constructor(public dom: Document) {
		super();
		this.dom = dom;
		this.init();
	}

	init(): this {
		this.on('actionEnd', (res, task: Task, el: HtmlNode) => {
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
				this.emit('done', new XMLSerializer().serializeToString(this.dom));
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
				const results = task.action(this.dom, el.element, task.parameter);
				if (results && 'then' in results) {
					(results as Promise<unknown>)
						.then((res) => this.emit('actionEnd', res, task, el))
						.catch((err) => this.emit('actionEnd', err, task, el));
				} else {
					this.emit('actionEnd', results, task, el);
				}
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

	processResults(results: Element | undefined, task: Task, el: HtmlNode): void {
		if (Array.isArray(results)) {
			results.forEach((result) => this.processResults(result, task, el));
		} else if (results instanceof Error) {
			this.handleError(results, task.name);
		} else {
			if (!this.data[task.name]) {
				this.data[task.name] = [];
			}
			this.data[task.name].push(results);
		}
	}

	iterateCount(taskName: string): void {
		if (!this.#taskCount[taskName]) {
			this.#taskCount[taskName] = 0;
		}
		this.#taskCount[taskName] += 1;
	}
}

export { TaskInterface };
export { Action, AsyncAction } from './Task';
