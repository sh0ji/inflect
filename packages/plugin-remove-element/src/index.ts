import { Action } from '@inflect/core';

export type RemoveElementOptions = { keepChildren: boolean };
const removeElement: Action<Document, Element, RemoveElementOptions> = (
	_dom,
	el,
	parameter,
): void => {
	if (el) {
		if (parameter?.keepChildren) {
			while (el.firstChild) {
				el.parentNode?.insertBefore(el.firstChild, el);
			}
		}
		el.remove();
	}
};

export default removeElement;
