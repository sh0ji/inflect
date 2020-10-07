import { AsyncAction } from '@inflect/core';
import { setSemanticsAsync } from '@inflect/plugin-set-semantics-async';
import { SetRoleOptions } from '@inflect/plugin-set-role';

export const setRoleAsync: AsyncAction<Document, Element, SetRoleOptions> = (
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

export { SetRoleOptions } from '@inflect/plugin-set-role';
