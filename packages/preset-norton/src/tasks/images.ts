import path from 'path';
import { removeAttributes } from '@inflect/plugin-remove-attributes';
// need to add types for web-id
import WebId from 'web-id';

const idPrefix = { prefix: 'npp' };

export const preset = [
	{
		selector: 'img:not([src^=data])',
		action: function images(dom: Document, el: HTMLImageElement): void {
			const webid = new WebId(webidOpts);
			const basename = path.basename(el.src);
			const filename = path.basename(el.src, path.extname(el.src));
			const image = {
				id: webid.generateUnique(filename),
				src: basename,
				alt: el.getAttribute('alt') || '',
				caption: '',
			};
			/** find the caption */
			const parent = el.parentNode as Element;
			const sibling = el.nextElementSibling as Element;
			let cap = sibling || parent?.nextElementSibling;
			let capText = '';
			if (cap) {
				while (!cap.classList.contains('PC')) {
					if (!cap.firstElementChild) break;
					cap = cap.firstElementChild;
				}
				if (cap.classList.contains('PC')) {
					capText = cap.innerHTML;
					cap.remove();
				}
			}
			image.caption = capText;
			removeAttributes(dom, el, { attributes: ['all'] });
		},
	},
];
