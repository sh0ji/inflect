import { Action } from '@inflect/core';
import { setSemantics } from '@inflect/plugin-set-semantics';

export type SetRoleOptions = { values: string[] };
export const setRole: Action<Document, Element, SetRoleOptions> = (
	dom,
	el,
	parameter,
): void => {
	if (parameter?.values) {
		setSemantics(dom, el, {
			attribute: 'role',
			values: parameter.values,
		});
	}
};
