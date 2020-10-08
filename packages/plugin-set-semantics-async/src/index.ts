import { AsyncAction } from '@inflect/core';
import { setSemantics, SetSemanticsOptions } from '@inflect/plugin-set-semantics';

export const setSemanticsAsync: AsyncAction<Element, SetSemanticsOptions> = (
	el,
	parameter,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		setSemantics(el, parameter);
		resolve();
	} catch (err) {
		reject(err);
	}
});

export { SetSemanticsOptions } from '@inflect/plugin-set-semantics';
