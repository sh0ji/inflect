import { Action } from '@inflect/core';
import setSemantics, { SetSemanticsOptions } from '@inflect/plugin-set-semantics';

const setRole: Action<Document, Element, SetSemanticsOptions> = (
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

export default setRole;
