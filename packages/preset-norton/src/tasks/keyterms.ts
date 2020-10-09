import Fuse from 'fuse.js';
import { changeTag } from '@inflect/plugin-change-tag';
// need to add types for web-id
import WebId from 'web-id';

type Term = {
	id: string,
	term?: string,
	description: string,
	compound?: boolean,
	el?: string,
};

type Glossref = {
	glossref: string,
	matchedTo: string,
};

const webidOpts = { prefix: 'npp' };
const fuseOpts = {
	shouldSort: true,
	threshold: 0.3, // may need adjustment
	minMatchCharLength: 1,
	tokenize: true,
	keys: ['term'],
};

const GLOSSARY_CLASS = 'glossary';

const ktArr: Term[] = [];

/**
 * Create a glossary list container
 * .pug example:
 * ul.glossary(epub:type="glossary")
 */
function initGlossary(doc: Document): HTMLUListElement {
	const ul: HTMLUListElement = doc.createElement('ul');
	ul.classList.add(GLOSSARY_CLASS);
	ul.setAttribute('epub:type', 'glossary');
	doc.body.appendChild(ul);
	return ul;
}

/**
 * Create a definition item
 * .pug example:
 * li.glossary__item#term-id
 *    dnf.glossary__term(epub:type="glossterm")
 *        a.backlink(href="#glossref-id",epub:type="backlink")= term
 *    div.glossary__description(epub:type="glossdef")= description
 */
function addTerm(doc: Document, kt: Term, refID: string): void {
	const ul = doc.querySelector(`.${GLOSSARY_CLASS}`) || initGlossary(doc);
	const li = doc.createElement('li');
	li.classList.add(`${GLOSSARY_CLASS}__item`);
	li.setAttribute('id', kt.id);

	const dfn = doc.createElement('dfn');
	dfn.classList.add(`${GLOSSARY_CLASS}__term`);
	dfn.setAttribute('epub:type', 'glossterm');

	const a = doc.createElement('a');
	a.classList.add('backlink');
	a.setAttribute('href', `#${refID}`);
	a.setAttribute('epub:type', 'backlink');
	if (kt.term) {
		a.innerHTML = kt.term;
	}

	const div = doc.createElement('div');
	div.classList.add(`${GLOSSARY_CLASS}__definition`);
	div.setAttribute('epub:type', 'glossdef');
	div.setAttribute('role', 'definition');
	div.innerHTML = kt.description;

	dfn.appendChild(a);
	li.appendChild(dfn);
	li.appendChild(div);
	ul.appendChild(li);
}

function getTerms(el: Element): Term[] {
	const webid = new WebId(webidOpts);
	const nodes: ChildNode[] = Array.from(el.childNodes);
	const terms = [];
	let child: Element | null = el.firstChild as Element;

	/** find elements with KT in the class nearby */
	while (child) {
		/** if the child is an element with KT in the class, add it to terms */
		if (child.nodeType === 1
            && Array.from(child.classList).some((c) => /.*KT.*/.test(c))) {
			terms.push({
				el: child,
				textContent: child.textContent?.trim(),
			});
		}
		/**
         * if the sibling is a text element, but it's not an 'or',
         * we've reached the description
         */
		if (child.nodeType === 3
            && child.textContent?.replace('(', '').trim() !== 'or') {
			break;
		}
		/** otherwise keep checking */
		child = child.nextSibling as Element;
	}

	/** description starts where the last KT ends */
	const descStart = nodes.indexOf(child);

	/** get all nodes from descStart to end, and reduce them to one string */
	const desc: string = nodes.slice(descStart, nodes.length)
		.reduce<string>((a, c) => {
		const elem = c as Element;
		a += elem.outerHTML || elem.textContent;
		return a;
	}, '').trim();

	const compound = terms.length > 1;

	/** return an array of { id, term, description } objects */
	return terms.map((kt) => {
		const term: Term = {
			id: webid.generateUnique(kt.textContent),
			term: kt.textContent,
			description: desc,
		};
		if (compound) {
			term.compound = true;
			term.el = kt.el.outerHTML;
		}
		return term;
	});
}

export const preset = [
	/** collect keyterm values */
	{
		selector: '[class^=MKT]',
		action: function keyterms(el: Element): void {
			const terms = getTerms(el);
			terms.forEach((kt) => {
				ktArr.push(kt);
			});
			el.remove();
		},
	},
	/**
     *  change the element to an anchor and add attributes
     *  <a href="#term-my-keyterm" id="ref-my-keyterm" epub:type="glossref">
     */
	{
		selector: '[class^=TXTKT]',
		action: function glossref(dom: Document, el: Element): Glossref | void {
			const webid = new WebId(webidOpts);
			const fuse = new Fuse(ktArr, fuseOpts);
			if (el.textContent) {
				const kt = fuse.search(el.textContent)[0].item;
				el.setAttribute('epub:type', 'glossref');
				el.id = webid.generateUnique((kt) ? kt.term : 'notFound');
				el.setAttribute('href', (kt) ? `#${kt.id}` : '#');
				changeTag(dom, el, { tag: 'a' });
				if (kt) {
					addTerm(dom, kt, el.id);
					if (kt.term?.toLowerCase().trim() !== el.textContent?.toLowerCase().trim()) {
						return {
							glossref: el.textContent,
							matchedTo: kt.id,
						};
					}
				}
				throw new Error(`No matching keyterm. Element: ${el.outerHTML}`);
			}
			return undefined;
		},
	},
];
