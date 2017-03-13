const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const Task = require('./lib/Task');
const actions = require('./lib/actions');
const EventEmitter = require('events').EventEmitter;

const jsdomConfig = {
    /**
     * @type {Object}
     * @see https://github.com/tmpvar/jsdom#flexibility
     */
    features: {
        FetchExternalResources: false,
        ProcessExternalResources: false,
        SkipExternalResources: true
    }
};

const Tasks = Symbol('tasks');

class Inflect extends EventEmitter {
    constructor(file) {
        super();
        if (file) this.init(file);
    }

    get basename() {
        return path.basename(this.file);
    }

    get total() {
        return this.tasks.reduce((acc, task) => acc + task.elements.length, 0);
    }

    get report() {
        const report = {
            file: this.basename,
            tasks: this.count
        };
        if (Object.keys(this.data).length) report.data = this.data;
        if (Object.keys(this.errors).length) report.errors = this.errors;
        return report;
    }

    get tasks() {
        return this[Tasks];
    }

    set tasks(value) {
        if (typeof value !== 'object') {
            throw new Error(`${value} is not a valid task.`);
        }

        let arr = value;
        if (value.constructor !== Array) {
            arr = [value];
        }
        this.addTask(arr);

        return this;
    }

    init(file) {
        this.file = file;

        /** setup jsdom */
        const data = fs.readFileSync(this.file);
        this.doc = jsdom.jsdom(data, jsdomConfig);

        this[Tasks] = [];

        this.count = {};
        this.data = {};
        this.errors = {};

        /** add actions to this instance */
        Object.keys(actions).forEach((action) => {
            this[action] = actions[action];
        });

        /** setup action listener */
        this.on('actionEnd', (err, task, el) => {
            if (err) this.handleError(err, task.name);
            el.markDone();
            this.iterateCount(task.name);
            if (task.elements.every(e => e.done)) {
                task.markDone();
                this.emit('taskEnd', task);
            }
        });

        return this;
    }

    addTask(task) {
        if (task.constructor === Array) {
            task.forEach(t => this.addTask(t));
        }
        this[Tasks].push(new Task(task, this.doc));
        return this;
    }

    inflect() {
        return new Promise((resolve, reject) => {
            try {
                this.emit('start');
                this.tasks.forEach(task => this.runTask(task));

                this.on('taskEnd', () => {
                    if (this.tasks.every(t => t.done === true) ||
                        this.tasks.length === 0) {
                        this.emit('done', this.report);
                        resolve(this.report);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    runTask(task) {
        this.emit('taskStart', task);
        try {
            task.elements.forEach((el) => {
                this.emit('actionStart', task);

                if (!el.element) {
                    this.emit('actionEnd', null, task, el);
                    return;
                }

                const results = task.action.call(
                    this, el.element, task.parameter
                );

                /** handle results */
                if (results) {
                    /** .then signals that a promise was returned */
                    if (results.then) {
                        results.then((res) => {
                            if (res) {
                                this.processResults(res, task.name, el.nodeLocation);
                            }
                            this.emit('actionEnd', null, task, el);
                        }).catch((err) => {
                            this.emit('actionEnd', err, task, el);
                        });
                    /** function returned something other than a promise */
                    } else {
                        this.processResults(results, task.name, el.nodeLocation);
                        this.emit('actionEnd', null, task, el);
                    }
                } else {
                    this.emit('actionEnd', null, task, el);
                }
            });
        } catch (err) {
            this.handleError(err, task.name);
        }

        return this;
    }

    handleError(err, taskName) {
        if (err.constructor === Array) {
            err.forEach(e => this.handleError(e, taskName));
            return this;
        }
        this.errors[taskName] = this.errors[taskName] || [];
        this.errors[taskName].push(err.message);
        this.emit('error', err.stack, taskName);

        return this;
    }

    processResults(result, taskName, nodeLocation) {
        if (result.constructor === Array) {
            result.forEach(r => this.processResults(r, taskName, nodeLocation));
            return this;
        }
        let res = result;
        if (this.debug && nodeLocation) {
            res = {
                val: result,
                loc: nodeLocation
            };
        }
        this.data[taskName] = this.data[taskName] || [];
        this.data[taskName].push(res);

        return this;
    }

    iterateCount(taskName) {
        this.count[taskName] = this.count[taskName] || 0;
        this.count[taskName] += 1;
    }
}

module.exports = Inflect;
