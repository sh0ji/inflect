import { Action } from '@inflect/core';
import { setSemantics } from '@inflect/plugin-set-semantics';

export type SetRoleOptions = { values: string[] };
export const setRole: Action<Element, SetRoleOptions> = (
	el,
	parameter,
): void => {
	if (parameter?.values) {
		setSemantics(el, {
			attribute: 'role',
			values: parameter.values,
		});
	}
};
