const Inflect = require('../../packages/core/src');

const changeTag1 = {
	selector: '#target',
	action: 'changeTag',
	parameter: 'blockquote',
	expect: 'blockquote',
	name: 'changeTag1',
};
module.exports.changeTag1 = changeTag1;

const function1 = {
	selector: '#innertarget',
	action: (el) => new Promise((resolve, reject) => {
		try {
			el.innerHTML = el.innerHTML.replace('Totam', 'Evan');
			resolve({
				name: 'evan',
				value: 'Totam',
			});
		} catch (err) {
			reject(err);
		}
	}),
	expect: 'Evan',
	name: 'function1',
};
module.exports.function1 = function1;

const setRole1 = {
	selector: '#innertarget',
	action: 'setRole',
	parameter: ['link', 'list', ['presentation', 'not a role']],
	expect: 'link list presentation not a role',
	name: 'setRole1',
};
module.exports.setRole1 = setRole1;

const setEpubType1 = {
	selector: 'li',
	action: 'setEpubType',
	parameter: 'pagebreak',
	expect: 'pagebreak',
	name: 'setEpubType1',
};
module.exports.setEpubType1 = setEpubType1;

const function2 = {
	selector: '#innertarget',
	action: (el) => new Promise((resolve, reject) => {
		el.innerHTML = el.innerHTML.replace('quo placeat', 'is the best!');
		resolve();
	}),
	expect: 'pagebreak',
	name: 'function2',
};
module.exports.function2 = function2;

const function3 = {
	selector: 'pre',
	action: (el) => new Promise((resolve, reject) => {
		Inflect.removeAttributes(el, 'all');
		resolve({ name: 'removeAttributes' });
	}),
	expect: null,
	name: 'function3',
};
module.exports.function3 = function3;

const function4 = {
	selector: '#innertarget',
	action: (el) => new Promise((resolve, reject) => {
		el.innerHTML = el.innerHTML.replace(/(Evan is the best\!)/, '<span class="best">$1</span>');
		resolve({ name: 'evan' });
	}),
	expect: '<span class="best">Evan is the best!</span>',
	name: 'function4',
};
module.exports.function4 = function4;

const function5 = {
	selector: 'li',
	action: (el) => Promise.resolve({
		name: 'listItem',
		value: el.outerHTML,
	}),
	expect: '<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>',
};
module.exports.function5 = function5;

const functionRemove = {
	selector: 'blockquote',
	action: (el) => new Promise((resolve) => {
		this.removeContainer(el);
		resolve();
	}),
};
module.exports.functionRemove = functionRemove;

const sync = {
	selector: '#innertarget',
	action: (el) => {
		el.classList.add('sync');
	},
	expect: 'sync',
	name: 'sync',
};
module.exports.sync = sync;

module.exports.array = [
	changeTag1, setRole1, function1, function2, function3, function4,
];
