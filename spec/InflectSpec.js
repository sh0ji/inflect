/* eslint-disable */
const Inflect = require('../index');
const fileHtml = './spec/helpers/test.html';
const tasks = require('./helpers/tasks.js');
let task;

describe('Inflect', function() {
    let inflect = null;

    beforeEach(function() {
        inflect = new Inflect(fileHtml);
    });

    it('should create a new html-inflect instance', function() {
        expect(inflect).toEqual(jasmine.any(Inflect));
    });

    it('should contain a document object', function() {
        expect(inflect.doc).not.toEqual(null);
        expect(inflect.doc).not.toBeUndefined();
        expect(inflect.doc).toEqual(jasmine.any(Object));
        expect(inflect.doc.body).not.toBeUndefined();
    });

    describe('task runner', function() {

        it('should set the role on the target', function() {
            let task = tasks.setRole1;
            inflect.addTask(task);
            inflect.inflect(task);
            let target = inflect.doc.querySelector(task.selector);
            expect(target.getAttribute('role')).toEqual(task.expect);
        });

        describe('changeTag action', function() {
            let task = tasks.changeTag1;

            beforeEach(function() {
                inflect.addTask(task);
                inflect.inflect(task);
            });

            it('should change the tagName of the target', function() {
                let target = inflect.doc.querySelector(task.selector);
                expect(target.tagName.toLowerCase()).toEqual(task.expect);
            });
        });

        describe('use constructor this inside function action', function() {
            let task = tasks.functionRemove;

            beforeEach(function() {
                inflect.addTask(task);
                inflect.inflect(task);
            });

            it('should remove the blockquote', function() {
                expect(inflect.doc.body.children[3].nodeName).toEqual('P');
            });
        });

        describe('run a synchronous task', function() {
            let task = tasks.sync;

            beforeEach(function() {
                inflect.addTask(task);
                inflect.inflect(task);
            });

            it('should have the `sync` class', function() {
                let target = inflect.doc.querySelector(task.selector);
                expect(target.classList.contains(task.expect)).toEqual(true);
            });
        });

        // describe('add to data object', function() {
        //     let task = tasks.function5;
        //
        //     beforeEach(function() {
        //         inflect.addTask(task);
        //         inflect.inflect(task);
        //     });
        //
        //     it('should should be the first li in the document', function() {
        //         expect(inflect.data.listItem[0]).toEqual(task.expect);
        //     });
        //
        //     it('should add all the li', function() {
        //         expect(inflect.data.listItem.length).toEqual(5);
        //     });
        // });

        // describe('run an array of tasks', function() {
        //     let task = tasks.array;
        //
        //     beforeEach(function() {
        //         inflect.addTask(task);
        //         inflect.inflect(task);
        //     });
        //
        //     it('should change content in steps', function() {
        //         let target = inflect.doc.querySelector('#innertarget');
        //         let pre = inflect.doc.querySelector('pre');
        //         expect(/Evan is the best!/.test(target.textContent)).toEqual(true);
        //         expect(Boolean(target.querySelector('.best'))).toEqual(true);
        //         expect(pre.attributes.length).toEqual(0);
        //     });
        //
        //     it('should iterate the counts', function() {
        //         expect(inflect.data.changeTag.length).toEqual(1);
        //         expect(inflect.data.evan.length).toEqual(2);
        //         expect(inflect.data.removeAttributes.length).toEqual(1);
        //         expect(inflect.data.setRole.length).toEqual(1);
        //     })
        // });
    });
});
