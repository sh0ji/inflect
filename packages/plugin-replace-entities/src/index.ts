import { Action } from '@inflect/core';

export const replaceEntities: Action<Document, Element> = (_dom, el): void => {
	const nbsp = /&nbsp;|&#160;|&#xA0;/ig;
	const shy = /&shy;|&#173;|&#xAD;|/ig;
	const fixed = el.outerHTML.replace(nbsp, ' ').replace(shy, '');
	el.outerHTML = fixed;
};
