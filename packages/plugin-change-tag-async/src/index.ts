import { AsyncAction } from '@inflect/core';
import { changeTag, ChangeTagOptions } from '@inflect/plugin-change-tag';

export const changeTagAsync: AsyncAction<Element, ChangeTagOptions, Document> = (
	el,
	parameter,
	dom,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		if (dom) {
			changeTag(el, parameter, dom);
		}
		resolve();
	} catch (err) {
		reject(err);
	}
});

export { ChangeTagOptions } from '@inflect/plugin-change-tag';
