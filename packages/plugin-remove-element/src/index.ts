import { Action } from '@inflect/core';

export type RemoveElementOptions = { keepChildren: boolean };
export const removeElement: Action<Element, RemoveElementOptions> = (
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
