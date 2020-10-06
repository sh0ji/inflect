import { AsyncAction } from '@inflect/core';
import setSemanticsAsync, { SetSemanticsOptions } from '@inflect/plugin-set-semantics-async';

const setRoleAsync: AsyncAction<Document, Element, SetSemanticsOptions> = (
	dom,
	el,
	parameter,
) => {
	if (parameter?.values) {
		return setSemanticsAsync(dom, el, {
			attribute: 'role',
			values: parameter.values,
		});
	}
	return Promise.resolve();
};

export default setRoleAsync;
