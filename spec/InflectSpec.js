'use strict';

const fs = require('fs');
const jsdom = require('jsdom');
const Inflect = require('../index');
const fileHtml = './spec/helpers/html.html';

describe('Inflect', function() {
    let inflect = null;

    beforeEach(function() {
        let html = fs.readFileSync(fileHtml);
        let doc = jsdom.jsdom(html);
        inflect = new Inflect(doc);
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

    describe('Getters', function() {
        let pkg = require('../package.json');

        it('version should be equal to the current npm version', function() {
            expect(inflect.version).toEqual(pkg.version);
        });

        it('name should be equal to the current npm name', function() {
            expect(inflect.name).toEqual(pkg.name);
        });
    });

    describe('Task runner', function() {
        let tasks = require('./helpers/tasks.js');

        describe('changeTag action', function() {
            let task = tasks.changeTag1;

            beforeEach(function(done) {
                inflect.runTask(task).then(() => done());
            });

            it('should change the tagName of the target', function() {
                let target = inflect.doc.querySelector(task.selector);
                expect(target.tagName.toLowerCase()).toEqual(task.expect);
            });
        });

        it('should set the role on the target', function() {
            let task = tasks.setRole1;
            inflect.runTask(task);
            let target = inflect.doc.querySelector(task.selector);
            expect(target.getAttribute('role')).toEqual(task.expect);
        });

        describe('Run an array of tasks', function() {
            let task = tasks.array1;

            beforeEach(function(done) {
                inflect.runTasks(task).then(() =>done());
            });

            it('should change content in steps', function() {
                let target = inflect.doc.querySelector('#innertarget');
                let pre = inflect.doc.querySelector('pre');
                expect(/Evan is the best!/.test(target.textContent)).toEqual(true);
                expect(Boolean(target.querySelector('.best'))).toEqual(true);
                expect(pre.attributes.length).toEqual(0);
            });

            it('should iterate the counts', function() {
                expect(inflect.count.changeTag).toEqual(1);
                expect(inflect.count.evan).toEqual(2);
                expect(inflect.count.removeAttributes).toEqual(1);
                expect(inflect.count.setRole).toEqual(1);
            })
        });
    });
});
