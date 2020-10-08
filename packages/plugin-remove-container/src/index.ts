import { Action } from '@inflect/core';
import { removeElement } from '@inflect/plugin-remove-element';

export const removeContainer: Action<Element> = (el): void => {
	removeElement(el, { keepChildren: true });
};
