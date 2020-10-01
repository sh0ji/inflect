import { Action } from '@inflect/core';
import changeTag, { ChangeTagOptions } from '@inflect/plugin-change-tag';

type ChangeTagAsync = Action<Document, Element, ChangeTagOptions>;
const changeTagAsync: ChangeTagAsync = (dom, el, parameter): Promise<void> => new Promise(
	(resolve, reject) => {
		try {
			changeTag(dom, el, parameter);
			resolve();
		} catch (err) {
			reject(err);
		}
	},
);

export default changeTagAsync;
