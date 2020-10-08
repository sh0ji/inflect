import { removeContainer } from '@inflect/plugin-remove-container';
import { removeAttributes } from '@inflect/plugin-remove-attributes';
// import { TaskInterface } from '@inflect/core';

// Need to include TaskInterface[] type here, but TypeScript throws an error
// for the options parameter, saying Record<string, undefined> is not assignable
// to RemoveAttributesOptions.
export const preset = [
	{
		action: removeContainer,
		selector: '[id^=_id]:not(img),[class^=_id]:not(img)',
	},
	{
		action: removeAttributes,
		parameter: { attributes: ['lang'] },
		selector: '[lang]:not(html)',
	},
];
