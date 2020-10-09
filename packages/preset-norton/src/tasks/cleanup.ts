import { removeContainer } from '@inflect/plugin-remove-container';
import { replaceEntities } from '@inflect/plugin-replace-entities';

export const preset = [
	{
		selector: 'body',
		action: replaceEntities,
	},
	{
		selector: 'span,div',
		action: function emptyContainer(dom: Document, el: Element): void {
			if (el.attributes.length === 0) {
				if (el.childNodes.length === 0) {
					/** no attributes + no children = pointless element. remove it! */
					el.remove();
				} else {
					/** no attributes + children = pointless container. */
					removeContainer(dom, el);
				}
			}
		},
	},
];
