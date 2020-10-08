import { AsyncAction } from '@inflect/core';
import { removeAttributes, RemoveAttributesOptions } from '@inflect/plugin-remove-attributes';

export const removeAttributesAsync: AsyncAction<Element, RemoveAttributesOptions> = (
	el,
	parameter,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		removeAttributes(el, parameter);
		resolve();
	} catch (err) {
		reject(err);
	}
});

export { RemoveAttributesOptions } from '@inflect/plugin-remove-attributes';
