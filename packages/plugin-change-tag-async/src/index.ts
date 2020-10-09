import { AsyncAction } from '@inflect/core';
import { changeTag, ChangeTagOptions } from '@inflect/plugin-change-tag';

export const changeTagAsync: AsyncAction<Document, Element, ChangeTagOptions> = (
	dom,
	el,
	parameter,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		if (dom) {
			changeTag(dom, el, parameter);
		}
		resolve();
	} catch (err) {
		reject(err);
	}
});

export { ChangeTagOptions } from '@inflect/plugin-change-tag';
