const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const Task = require('./lib/Task');
const EventEmitter = require('events').EventEmitter;
const actions = require('./lib/actions');

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
            file: this.file,
            tasks: this.count,
            data: this.data
        };
        if (this.errors.length) report.errors = this.errors;
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

        this.done = false;
        this.count = {};
        this.data = {};
        this.errors = [];

        /** add actions to this instance */
        Object.keys(actions).forEach((action) => {
            this[action] = actions[action];
        });

        /** setup listeners */
        this.on('actionEnd', (err, task) => {
            if (err) this.handleError(err, task);
            if (task.elements.every(el => el.done)) {
                task.markDone();
                this.emit('taskEnd', task);
            }
        });

        this.on('taskEnd', () => {
            if (this.tasks.every(t => t.done === true) ||
                this.tasks.length === 0) {
                this.done = true;
                this.emit('done', this.report);
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
        this.emit('start');
        for (let i = 0; i < this.tasks.length; i += 1) {
            this.runTask(this.tasks[i]);
        }

        return this;
    }

    runTask(task) {
        this.emit('taskStart', task);
        try {
            task.elements.forEach((el) => {
                this.emit('actionStart', task);

                if (!el.element) {
                    el.markDone();
                    this.emit('actionEnd', null, task);
                    return;
                }

                const results = task.action.call(
                    this, el.element, task.parameter
                );

                /** handle results */
                if (results) {
                    /** .then signals that a promise was returned */
                    if (results.then) {
                        results.then((result) => {
                            const res = result || { name: task.action.name } || {};
                            this.processResults(res, el.nodeLocation);
                            el.markDone();
                            this.emit('actionEnd', null, task);
                        }).catch((err) => {
                            el.markDone();
                            this.emit('actionEnd', err, task);
                        });
                    /** function returned something other than a promise */
                    } else {
                        this.processResults(results, el.nodeLocation);
                        el.markDone();
                        this.emit('actionEnd', null, task);
                    }
                } else {
                    el.markDone();
                    this.emit('actionEnd', null, task);
                }
            });
        } catch (err) {
            this.handleError(err);
        }

        return this;
    }

    handleError(err, task) {
        if (err.constructor === Array) {
            err.forEach(e => this.handleError(e, task));
            return this;
        }
        // this.emit('error', err, task);
        this.errors.push(err);

        return this;
    }

    processResults(result, nodeLocation) {
        let name;
        let value = {};
        if (typeof result === 'string') {
            name = result;
        } else {
            try {
                name = result.name;
                value = result.value;
                if (this.debug) {
                    if (value.constructor !== Object) value = { val: value };
                    value.nodeLocation = nodeLocation;
                }
            } catch (err) {
                throw new Error(err);
            }
        }

        if (name) {
            this.count[name] = this.count[name] || 0;
            this.count[name] += 1;
            if (value) {
                if (value.constructor === Array) {
                    this.data[name] = value;
                    return this;
                }
                this.data[name] = this.data[name] || [];
                this.data[name].push(value);
            }
        }

        return this;
    }
}

module.exports = Inflect;
