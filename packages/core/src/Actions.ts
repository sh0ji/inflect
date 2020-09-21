/* eslint-disable class-methods-use-this */
import flattenDeep from 'lodash.flattendeep';
import { JSDOM } from 'jsdom';

export type ActionNames =
	| 'changeTag'
	| 'changeTagAsync'
	| 'removeAttributes'
	| 'removeAttributesAsync'
	| 'removeElement'
	| 'removeElementAsync'
	| 'setSemantics'
	| 'setSemanticsAsync'
	| 'removeContainer'
	| 'removeParent'
	| 'setEpubType'
	| 'setRole';

export default class Actions {
	private dom: JSDOM;

	constructor(dom: JSDOM) {
		this.dom = dom;
	}

	changeTag(el: Element, tag: string): void {
		const currentTag = el.tagName.toLowerCase();
		const newTag = tag.toLowerCase();

		if (newTag && currentTag !== newTag) {
			const parent = el.parentNode;
			const newEl = this.dom.window.document.createElement(newTag);
			Array.from(el.attributes).forEach((attr) => {
				newEl.setAttribute(attr.name, attr.value);
			});
			newEl.innerHTML = el.innerHTML;
			parent?.replaceChild(newEl, el);
		}
	}

	changeTagAsync(el: Element, tag: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.changeTag(el, tag);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	removeAttributes(el: Element, ...attributes: string[]): void {
		let attrs = flattenDeep(attributes.map((attr) => attr.split(/,\s*/)));
		attrs = (attrs.includes('all'))
			? Array.from(el.attributes).map((attr) => attr.name)
			: attrs;
		attrs.forEach((attr) => el.removeAttribute(attr));
	}

	removeAttributesAsync(el: Element, ...attributes: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.removeAttributes(el, ...attributes);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	removeElement(el: Element | null, keepChildren: string): void {
		if (el) {
			if (keepChildren) {
				while (el.firstChild) {
					el.parentNode?.insertBefore(el.firstChild, el);
				}
			}
			el.remove();
		}
	}

	removeElementAsync(el: Element | null, keepChildren: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.removeElement(el, keepChildren);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	setSemantics(el: Element, attr: string, ...values: string[]): void {
		const vals = flattenDeep(values.map((val) => {
			if (typeof val === 'string') {
				return val.split(/,\s*/);
			}
			return val;
		})).join(' ');
		el.setAttribute(attr, vals);
	}

	setSemanticsAsync(el: Element, attr: string, ...values: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.setSemantics(el, attr, ...values);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	/** aliases for special actions */
	removeContainer(el: Element): void {
		this.removeElement(el, 'true');
	}

	removeContainerAsync(el: Element): Promise<void> {
		return this.removeElementAsync(el, 'true');
	}

	removeParent(el: Element): void {
		if (el.parentNode) {
			const { parentNode } = el;
			this.removeElement(parentNode as Element, 'true');
		}
	}

	removeParentAsync(el: Element): Promise<void> {
		if (el.parentNode) {
			const { parentNode } = el;
			return this.removeElementAsync(parentNode as Element, 'true');
		}
		return Promise.resolve();
	}

	setEpubType(el: Element, ...types: string[]): void {
		this.setSemantics(el, 'epub:type', ...types);
	}

	setEpubTypeAsync(el: Element, ...types: string[]): Promise<void> {
		return this.setSemanticsAsync(el, 'epub:type', ...types);
	}

	setRole(el: Element, ...roles: string[]): void {
		this.setSemantics(el, 'role', ...roles);
	}
}
