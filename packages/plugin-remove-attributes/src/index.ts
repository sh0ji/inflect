import { Action } from '@inflect/core';
import flattenDeep from 'lodash.flattendeep';

export type RemoveAttributesOptions = { attributes: string[] } | undefined;
export const removeAttributes: Action<Element, RemoveAttributesOptions> = (
	el,
	parameter,
): void => {
	if (parameter) {
		const { attributes } = parameter;
		let attrs = flattenDeep(attributes.map((attr) => attr.split(/,\s*/)));
		attrs = (attrs.includes('all'))
			? Array.from(el.attributes).map((attr) => attr.name)
			: attrs;
		attrs.forEach((attr) => el.removeAttribute(attr));
	}
};
