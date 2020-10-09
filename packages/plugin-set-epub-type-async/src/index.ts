import { AsyncAction } from '@inflect/core';
import { setSemanticsAsync, SetSemanticsOptions } from '@inflect/plugin-set-semantics-async';

export const setEpubTypeAsync: AsyncAction<Document, Element, SetSemanticsOptions> = (
	dom,
	el,
	parameter,
) => {
	if (parameter?.values) {
		return setSemanticsAsync(dom, el, {
			attribute: 'epub:type',
			values: parameter.values,
		});
	}
	return Promise.resolve();
};
