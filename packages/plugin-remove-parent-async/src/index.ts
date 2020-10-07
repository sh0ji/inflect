import { AsyncAction } from '@inflect/core';
import { removeElementAsync } from '@inflect/plugin-remove-element-async';

export const removeParentAsync: AsyncAction<Document, Element> = (
	dom,
	el,
) => removeElementAsync(dom, el.parentNode as Element);
