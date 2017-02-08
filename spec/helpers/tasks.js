'use strict'

const changeTag1 = {
    selector: '#target',
    action: 'changeTag',
    parameter: 'blockquote',
    expect: 'blockquote',
    name: 'changeTag1'
}
module.exports.changeTag1 = changeTag1

const function1 = {
    selector: '#innertarget',
    action: (el) => {
        return new Promise((resolve, reject) => {
            el.innerHTML = el.innerHTML.replace('Totam', 'Evan')
            resolve([tasks1, 'evan'])
        })
    },
    expect: 'Evan',
    name: 'function1'
}
module.exports.function1 = function1

const setRole1 = {
    selector: '#innertarget',
    action: 'setRole',
    parameter: ['link', 'list', ['presentation', 'not a role']],
    expect: 'link list presentation not a role',
    name: 'setRole1'
}
module.exports.setRole1 = setRole1

const setEpubType1 = {
    selector: 'li',
    action: 'setEpubType',
    parameter: 'pagebreak',
    expect: 'pagebreak',
    name: 'setEpubType1'
}
module.exports.setEpubType1 = setEpubType1

const function2 = {
    selector: '#innertarget',
    action: (el) => {
        return new Promise((resolve, reject) => {
            el.innerHTML = el.innerHTML.replace('quo placeat', 'is the best!')
            resolve([function3, 'evan'])
        })
    },
    expect: 'pagebreak',
    name: 'function2'
}
module.exports.function2 = function2

const function3 = {
    selector: 'pre',
    action: (el) => {
        return new Promise((resolve, reject) => {
            Inflect.removeAttributes(el, 'all')
            resolve([function4, 'removeAttributes'])
        })
    },
    expect: null,
    name: 'function3'
}
module.exports.function3 = function3

const function4 = {
    selector: '#innertarget',
    action: (el) => {
        return new Promise((resolve, reject) => {
            el.innerHTML = el.innerHTML.replace(/(Evan is the best\!)/, '<span class="best">$1</span>')
            resolve('evan')
        })
    },
    expect: '<span class="best">Evan is the best!</span>',
    name: 'function4'
}
module.exports.function4 = function4

const array1 = [changeTag1, function1, setRole1]
const array2 = [setEpubType1, function2]
module.exports.array1 = array1
module.exports.array2 = array2
