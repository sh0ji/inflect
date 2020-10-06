import { Action } from '@inflect/core';
import flattenDeep from 'lodash.flattendeep';

export type SetSemanticsOptions = { attribute: string, values: string[] };
const setSemantics: Action<Document, Element, SetSemanticsOptions> = (
	_dom,
	el,
	parameter,
): void => {
	if (parameter) {
		const { values, attribute } = parameter;
		const vals = flattenDeep(values.map((val) => {
			if (typeof val === 'string') {
				return val.split(/,\s*/);
			}
			return val;
		})).join(' ');
		el.setAttribute(attribute, vals);
	}
};

export default setSemantics;
