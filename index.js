const changeTag = require('./action/changeTag');
const removeAttributes = require('./action/removeAttributes');
const removeElement = require('./action/removeElement');
const setSemantics = require('./action/setSemantics');

const Doc = Symbol('doc');

class Inflect {
    constructor(doc) {
        if (doc) this.doc = doc || document; // eslint-disable-line no-undef
        /** attach static methods for use inside anonymous action functions */
        this.changeTag = Inflect.changeTag;
        this.removeAttributes = Inflect.removeAttributes;
        this.removeContainer = Inflect.removeContainer;
        this.setEpubType = Inflect.setEpubType;
        this.setRole = Inflect.setRole;
    }

    get doc() {
        return this[Doc];
    }

    set doc(value) {
        if (typeof value === 'object') {
            this[Doc] = value;
        } else {
            console.log('doc must be a document object');   // eslint-disable-line
        }
    }

    runTask(task) {
        return new Promise((resolve, reject) => {
            try {
                const results = [];
                Array.from(this.doc.querySelectorAll(task.selector)).forEach((el) => {
                    const action = (typeof Inflect[task.action] === 'function') ?
                        Inflect[task.action] :
                        task.action;
                    const func = action.call(this, el, task.parameter);
                    if (func) {
                        if (func.then) {
                            func.then((result) => {
                                const res = result || { name: action.name };
                                results.push(res);
                            })
                            .catch(err => reject(err));
                        } else {
                            results.push(func);
                        }
                    }
                });
                resolve(results);
            } catch (err) {
                reject(err);
            }
        })
        .then(res => this.processResults(res))
        .catch(err => console.log(err));    // eslint-disable-line no-console
    }

    runTasks(tasks) {
        return new Promise((resolve, reject) => {
            this.asyncTasks(tasks, 0)
                .then(() => resolve())
                .catch(err => reject(err));
        })
        .catch(err => console.log(err));    // eslint-disable-line no-console
    }

    asyncTasks(taskArr, index) {
        return new Promise((resolve, reject) => {
            this.runTask(taskArr[index]).then(() => {
                const i = index + 1;
                if (i < taskArr.length) {
                    this.asyncTasks(taskArr, i)
                        .then(() => resolve())
                        .catch(err => reject(err));
                } else {
                    resolve();
                }
            });
        });
    }

    processResults(results) {
        results.forEach((result) => {
            const res = {};
            if (typeof result === 'string') {
                res.name = result;
            } else {
                try {
                    res.name = result.name;
                    res.value = result.value;
                } catch (err) {
                    console.log(err);  // eslint-disable-line no-console
                }
            }

            if (res.name) {
                this.data = this.data || {};
                this.data[res.name] = this.data[res.name] || [];
                this.data[res.name].push(res.value);
            }
        });

        return this;
    }

    static changeTag(el, newTag) {
        return changeTag(el, newTag);
    }

    static removeAttributes(el, ...attributes) {
        return removeAttributes(el, ...attributes);
    }

    static removeContainer(el) {
        return removeElement(el, true);
    }

    static removeElement(el, keepChildren) {
        return removeElement(el, keepChildren);
    }

    static removeParent(el) {
        return removeElement(el.parentNode, true);
    }

    static setEpubType(el, ...types) {
        return setSemantics(el, 'epub:type', ...types);
    }

    static setRole(el, ...roles) {
        return setSemantics(el, 'role', ...roles);
    }
}

module.exports = Inflect;
