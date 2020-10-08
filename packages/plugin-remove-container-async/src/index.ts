import { AsyncAction } from '@inflect/core';
import { removeElementAsync } from '@inflect/plugin-remove-element-async';

export const removeContainerAsync: AsyncAction<Element> = (el) => removeElementAsync(el, {
	keepChildren: true,
});
