import { AsyncAction } from '@inflect/core';
import removeElementAsync from '@inflect/plugin-remove-element-async';

const removeContainerAsync: AsyncAction<Document, Element> = (
	dom,
	el,
) => removeElementAsync(dom, el, { keepChildren: true });

export default removeContainerAsync;
