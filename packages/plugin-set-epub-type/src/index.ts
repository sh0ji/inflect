import { Action } from '@inflect/core';
import { setSemantics, SetSemanticsOptions } from '@inflect/plugin-set-semantics';

export const setEpubType: Action<Element, SetSemanticsOptions> = (
	el,
	parameter,
): void => {
	if (parameter?.values) {
		setSemantics(el, {
			attribute: 'epub:type',
			values: parameter.values,
		});
	}
};
