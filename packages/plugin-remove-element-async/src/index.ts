import { AsyncAction } from '@inflect/core';
import { removeElement, RemoveElementOptions } from '@inflect/plugin-remove-element';

export const removeElementAsync: AsyncAction<Element, RemoveElementOptions> = (
	el,
	parameter,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		removeElement(el, parameter);
		resolve();
	} catch (err) {
		reject(err);
	}
});

export { RemoveElementOptions } from '@inflect/plugin-remove-element';
