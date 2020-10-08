import { AsyncAction } from '@inflect/core';
import { replaceEntities } from '@inflect/plugin-replace-entities';

export const replaceEntitiesAsync: AsyncAction<Document, Element> = (
	dom,
	el,
): Promise<void> => new Promise((resolve, reject) => {
	try {
		replaceEntities(dom, el);
		resolve();
	} catch (err) {
		reject(err);
	}
});
