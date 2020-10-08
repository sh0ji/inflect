import { AsyncAction } from '@inflect/core';
import { setSemanticsAsync, SetSemanticsOptions } from '@inflect/plugin-set-semantics-async';

export const setEpubTypeAsync: AsyncAction<Element, SetSemanticsOptions> = (
	el,
	parameter,
) => {
	if (parameter?.values) {
		return setSemanticsAsync(el, {
			attribute: 'epub:type',
			values: parameter.values,
		});
	}
	return Promise.resolve();
};
