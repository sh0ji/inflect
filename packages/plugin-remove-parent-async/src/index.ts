import { AsyncAction } from '@inflect/core';
import { removeElementAsync } from '@inflect/plugin-remove-element-async';

export const removeParentAsync: AsyncAction<Element> = (
	el,
) => removeElementAsync(el.parentNode as Element);
