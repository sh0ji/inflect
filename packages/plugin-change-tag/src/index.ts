import { Action } from '@inflect/core';

export type ChangeTagOptions = { tag: HTMLElementTagNameMap };
export const changeTag: Action<Document, Element, ChangeTagOptions> = (
	dom,
	el,
	parameter,
): void => {
	if (parameter) {
		const { tag } = parameter;
		const currentTag = el.tagName.toLowerCase();
		const newTag = (tag as unknown as string).toLowerCase();

		if (newTag && currentTag !== newTag) {
			const parent = el.parentNode;
			const newEl = dom.createElement(newTag);
			Array.from(el.attributes).forEach((attr) => {
				newEl.setAttribute(attr.name, attr.value);
			});
			newEl.innerHTML = el.innerHTML;
			parent?.replaceChild(newEl, el);
		}
	}
};
