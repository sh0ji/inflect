import { AsyncAction } from '@inflect/core';
import { setSemanticsAsync } from '@inflect/plugin-set-semantics-async';
import { SetRoleOptions } from '@inflect/plugin-set-role';

export const setRoleAsync: AsyncAction<Element, SetRoleOptions> = (
	el,
	parameter,
) => {
	if (parameter?.values) {
		return setSemanticsAsync(el, {
			attribute: 'role',
			values: parameter.values,
		});
	}
	return Promise.resolve();
};

export { SetRoleOptions } from '@inflect/plugin-set-role';
