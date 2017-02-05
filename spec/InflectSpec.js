describe('Inflect', function() {
    const Inflect = require('../index')
    const fs = require('fs')
    const jsdom = require('jsdom')
    let inflect

    beforeEach(function() {
        let html = fs.readFileSync('./spec/helpers/html.html', 'utf8')
        window = jsdom.jsdom(html).defaultView
        global.window = window
        global.document = window.document
        inflect = new Inflect(document)
    })

    it('should create a new inflect instance', function() {
        expect(new Inflect(document)).toEqual(jasmine.any(Inflect))
    })

    describe('get functions', function() {
        let pkg = require('../package.json')

        it('version should be equal to the current npm version', function() {
            expect(inflect.version).toEqual(pkg.version)
        })
        it('name should be equal to the current npm name', function() {
            expect(inflect.name).toEqual(pkg.name)
        })
    })

    describe('Task runner', function() {
        let tasks = require('./helpers/tasks.js')

        it('should change the tagName of the target', function() {
            let task = tasks.changeTag1
            inflect.runTask(task)
            let target = document.querySelector(task.selector)
            expect(target.tagName.toLowerCase()).toEqual(task.expect)
        })

        it('should set the role on the target', function() {
            let task = tasks.setRole1
            inflect.runTask(task)
            let target = document.querySelector(task.selector)
            expect(target.getAttribute('role')).toEqual(task.expect)
        })
    })
})
