import { changeTag } from '@inflect/plugin-change-tag';

/** heading classes typically end with H{lvl}, but shouldn't start with TX */
const heading = (lvl: number | string) => `[class$=H${lvl}]:not([class^=TX]):not([class^=CRED])`;

export const preset = [
	/** fix inline headings */
	{
		/** @example p>[class$=H1]:not([class^=TX]) */
		selector: [1, 2, 3, 4, 5, 6].map((lvl) => `p>${heading(lvl)}`).join(','),
		action: function inlineHeadings(_dom: Document, el: Element): void {
			const para = el.parentElement;
			para?.parentElement?.insertBefore(el, para);
		},
	},
	{
		selector: heading(1),
		action: changeTag,
		parameter: { tag: 'h1' },
	},
	{
		selector: heading(2),
		action: changeTag,
		parameter: { tag: 'h2' },
	},
	{
		selector: heading(3),
		action: changeTag,
		parameter: { tag: 'h3' },
	},
	{
		selector: heading(4),
		action: changeTag,
		parameter: { tag: 'h4' },
	},
	{
		selector: heading(5),
		action: changeTag,
		parameter: { tag: 'h5' },
	},
	{
		selector: heading(6),
		action: changeTag,
		parameter: { tag: 'h6' },
	},
	/** odd h2's override the H1 selector above */
	{
		selector: '.H2_H1, .H2_Before_H1',
		action: function consecutiveHeading(dom: Document, el: Element): void {
			changeTag(dom, el, { tag: 'h2' });
		},
	},
];
