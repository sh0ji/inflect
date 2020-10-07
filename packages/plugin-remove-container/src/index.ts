import { Action } from '@inflect/core';
import { removeElement } from '@inflect/plugin-remove-element';

export const removeContainer: Action<Document, Element> = (
	dom,
	el,
): void => {
	removeElement(dom, el, { keepChildren: true });
};
