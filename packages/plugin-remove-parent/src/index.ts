import { Action } from '@inflect/core';
import { removeElement } from '@inflect/plugin-remove-element';

export const removeParent: Action<Element> = (el): void => {
	removeElement(el.parentNode as Element, { keepChildren: true });
};
