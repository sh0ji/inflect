import { Action } from '@inflect/core';
import removeElement from '@inflect/plugin-remove-element';

const removeContainer: Action<Document, Element> = (
	dom,
	el,
): void => {
	removeElement(dom, el, { keepChildren: true });
};

export default removeContainer;
