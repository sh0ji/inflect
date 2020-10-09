import { Segment } from '@inflect/plugin-segment';

export const preset = [
	{
		selector: 'body',
		action: function segment(dom: Document): Segment {
			return new Segment(dom, {
				headingAnchor: false,
			});
		},
	},
];
