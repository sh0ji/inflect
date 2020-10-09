import { changeTag } from '@inflect/plugin-change-tag';

export const preset = [
	{
		selector: '.BL_First',
		action: function lists(dom: Document, el: Element): void {
			const ul = dom.createElement('ul');
			el.parentNode?.insertBefore(ul, el);
			const li = [el];
			let next = el;
			while (next && next.nodeType !== 9) {
				if (next.nodeType === 1) {
					if (next.classList.contains('BL_Last')) {
						li.push(next);
						break;
					}
					li.push(next);
				}
				next = next.nextSibling as Element;
			}
			li.forEach((item) => {
				if (item.textContent) {
					item.textContent = item.textContent.replace('•', '').trim();
				}
				ul.appendChild(item);
				changeTag(dom, item, { tag: 'li' });
			});
		},
	},
];
