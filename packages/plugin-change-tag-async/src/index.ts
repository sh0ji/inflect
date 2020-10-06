import { AsyncAction } from '@inflect/core';
import changeTag, { ChangeTagOptions } from '@inflect/plugin-change-tag';

const changeTagAsync: AsyncAction<Document, Element, ChangeTagOptions> = (
	dom,
	el,
	parameter,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		changeTag(dom, el, parameter);
		resolve();
	} catch (err) {
		reject(err);
	}
});

export default changeTagAsync;
