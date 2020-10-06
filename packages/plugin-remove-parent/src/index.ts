import { Action } from '@inflect/core';
import removeElement from '@inflect/plugin-remove-element';

const removeParent: Action<Document, Element> = (
	dom,
	el,
): void => {
	removeElement(dom, el.parentNode as Element, { keepChildren: true });
};

export default removeParent;
