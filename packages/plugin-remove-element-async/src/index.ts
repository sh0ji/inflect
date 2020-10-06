import { AsyncAction } from '@inflect/core';
import removeElement, { RemoveElementOptions } from '@inflect/plugin-remove-element';

const removeElementAsync: AsyncAction<Document, Element, RemoveElementOptions> = (
	dom,
	el,
	parameter,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		removeElement(dom, el, parameter);
		resolve();
	} catch (err) {
		reject(err);
	}
});

export default removeElementAsync;
