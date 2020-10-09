/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/**
 * --------------------------------------------------------------------------
 * Segment (v1.1.0): segment.js
 * Wrap headings and their contents in semantic section containers
 * by Evan Yamanishi
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */

interface Config {
	debug?: boolean;
	headingAnchor?: boolean;
	autoWrap?: boolean;
	startLevel?: number;
	excludeClass?: string;
	sectionClass?: string;
	anchorClass?: string;
}

type Callback = (error: Err, result?: Element | boolean) => void;

type Err = {
	title: string,
	description: string,
	element?: Element,
} | null;

type Item = {
	contents: string | null,
	excluded: boolean,
	id: string,
	level: number | null,
}

const HEADINGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const DATA_LEVEL = 'data-level';

const Default: Config = {
	debug: false,
	headingAnchor: true,
	autoWrap: true,
	startLevel: 1,
	excludeClass: 'segment-exclude',
	sectionClass: 'document-section',
	anchorClass: 'heading-link',
};

// errors borrowed from Khan Academy's tota11y library
// https://github.com/Khan/tota11y
const Errors = {
	FIRST_NOT_H1(el: Element, currentLvl: number): Err {
		return {
			title: 'First heading is not an <h1>.',
			description: `To give your document a proper structure for assistive technologies, it is important to lay out your headings beginning with an <h1>. The first heading was an <h${currentLvl}>.`,
			element: el,
		};
	},
	NONCONSECUTIVE_HEADER(el: Element, currentLvl: number, prevLvl: number): Err {
		let description = `This document contains an <h${currentLvl}> tag directly following an <h${prevLvl}>. In order to maintain a consistent outline of the page for assistive technologies, reduce the gap in the heading level by upgrading this tag to an <h${prevLvl + 1}>`;

		// Suggest upgrading the tag to the same level as `prevLvl` iff
		// `prevLvl` is not 1
		if (prevLvl !== 1) {
			description += ` or <h${prevLvl}>.`;
		} else {
			description += '.';
		}

		return {
			title: `Nonconsecutive heading level used (h${prevLvl} → h${currentLvl}).`,
			description,
			element: el,
		};
	},

	// additional errors not in tota11y
	NO_HEADINGS_FOUND(): Err {
		return {
			title: 'No headings found.',
			description: 'Please ensure that all headings are properly tagged.',
		};
	},
	PRE_EXISTING_SECTION(el: Element, currentLvl: number): Err {
		return {
			title: 'Pre-existing <section> tag',
			description: `The current <h${currentLvl}> is already the direct child of a <section> tag.`,
			element: el,
		};
	},
	INVALID_DOCUMENT(debug = false): Err {
		let description = 'One or more headings did not pass validation.';

		// suggest turning on debugging
		if (!debug) {
			description += ' Try again with debugging on: {debug: true}.';
		}

		return {
			title: 'The heading structure is invalid.',
			description,
		};
	},
};

export class Segment {
	public headings: Element[];

	public validHeadings: boolean;

	public docIDs: (string | null)[];

	public sections: Element[] = [];

	constructor(private doc: Document, private config: Config) {
		// doc must be a DOCUMENT_NODE (nodeType 9)
		if (doc.nodeType !== 9) {
			console.error('Valid document required.');
		} else {
			this.doc = doc;
		}

		// build the configuration from defaults
		this.config = this.getConfig(config);

		// collect all the headings in the document
		this.headings = Array.from(this.doc.querySelectorAll(HEADINGS.join(',')));
		// post an error if none are found
		if (this.config.debug && this.headings.length === 0) {
			this.postError(Errors.NO_HEADINGS_FOUND());
		}

		// validate the document
		this.validHeadings = this.validateDocument();
		// post an error if the document isn't valid
		if (!this.validHeadings) {
			this.postError(Errors.INVALID_DOCUMENT(this.config.debug));
		}

		// collect all the ids in the document
		this.docIDs = this.getDocIDs();

		// automatically create section containers
		if (this.config.autoWrap && this.validHeadings) {
			this.headings.forEach((heading) => {
				this.createSection(heading, (err, section) => {
					if (err) {
						this.postError(err);
					} else if (section instanceof Element) {
						this.sections.push(section);
					}
				});
			});
		}
	}

	// public

	// asynchronously validate a heading element
	// callback returns (error object, boolean valid)
	validateHeading(currentHead: Element, prevHead: Element, callback: Callback): void {
		const currentLvl = this.getHeadingLevel(currentHead);
		const prevLvl = this.getHeadingLevel(prevHead);

		// first heading not h1
		if (!prevLvl && currentLvl && currentLvl !== 1) {
			if (this.config.debug) {
				callback(Errors.FIRST_NOT_H1(currentHead, currentLvl));
			}

			// non-consecutive headings
		} else if (prevLvl && currentLvl && (currentLvl - prevLvl > 1)) {
			if (this.config.debug) {
				callback(Errors.NONCONSECUTIVE_HEADER(currentHead, currentLvl, prevLvl));
			}
		}

		// everything checks out
		callback(null, true);
	}

	// synchronously validate the whole document
	validateDocument(): boolean {
		let prevHead: Element;
		const valid: (Element|boolean|undefined)[] = [];
		this.headings.forEach((heading) => {
			this.validateHeading(heading, prevHead, (err, result) => {
				if (err) {
					this.postError(err);
				}
				valid.push(result);
			});
			prevHead = heading;
		});
		return valid.every((v) => v);
	}

	// asynchronously create section containers
	// callback returns (error object, section element)
	createSection(heading: Element, callback: Callback): void {
		const item: Item = this.buildItem(heading);
		const { startLevel, sectionClass, anchorClass } = this.config;
		if (item.level && startLevel && item.level < startLevel) return;

		const parent = heading.parentNode as Element;

		// check for a pre-existing section container
		if (item.level
				&& parent?.nodeName === 'SECTION'
				&& sectionClass
        && !parent?.classList.contains(sectionClass)) {
			callback(Errors.PRE_EXISTING_SECTION(heading, item.level));
		}

		// create the section container
		const section = this.doc.createElement('section');
		section.setAttribute('id', item.id);
		if (item.level) {
			section.setAttribute(DATA_LEVEL, `${item.level}`);
		}
		if (sectionClass) {
			section.className = sectionClass;
		}

		// attach the section to the correct place in the DOM
		if (parent.getAttribute(DATA_LEVEL) === item.level) {
			parent?.parentNode?.insertBefore(section, parent.nextElementSibling);
		} else {
			parent.insertBefore(section, heading);
		}

		// populate the section element
		const matched = this.nextUntilSameTag(heading);
		matched.forEach((elem) => {
			section.appendChild(elem);
		});

		// replace the heading text with a non-tabbable anchor that
		// references the section
		if (this.config.headingAnchor) {
			const anchor = this.doc.createElement('a');
			anchor.setAttribute('href', `#${item.id}`);
			anchor.setAttribute('tabindex', '-1');
			anchor.textContent = item.contents;
			heading.innerHTML = anchor.outerHTML;
			if (anchorClass) {
				heading.className = anchorClass;
			}
		}
		callback(null, section);
	}

	// private

	private getConfig(config: Config): Config {
		return { ...Default, ...config };
	}

	private getDocIDs() {
		const idElements = Array.from(this.doc.querySelectorAll('[id]'));
		return idElements.map((el) => el.getAttribute('id'));
	}

	private getHeadingLevel(el: Element): number | null {
		const isHeading = (el) ? HEADINGS.includes(el.nodeName) : false;
		return (isHeading) ? parseInt(el.nodeName.substr(1), 10) : null;
	}

	private constructID(string: string) {
		let id = string.trim()
		// start with letter. remove apostrophes & quotes
			.replace(/^[^A-Za-z]*/, '').replace(/[‘’'“”"]/g, '')
		// replace all symbols with -. except at the end
			.replace(/[^A-Za-z0-9]+/g, '-')
			.replace(/-$/g, '')
		// make it all lowercase
			.toLowerCase();

		// append a number if the id isn't unique
		if (this.docIDs.includes(id)) {
			const root = id;
			let n = 0;
			do {
				n += 1;
				id = `${root}-${n}`;
			} while (this.docIDs.includes(id));
		}
		return id;
	}

	private buildItem(el: Element): Item {
		const item = {
			contents: el.textContent,
			id: this.constructID(el.textContent || ''),
			excluded: false,
			level: this.getHeadingLevel(el),
		};
		const { excludeClass } = this.config;
		if (excludeClass && el.classList.contains(excludeClass)) {
			item.excluded = true;
		}
		return item;
	}

	// collect all the elements from el to the next same tagName
	// borrowed from jQuery.nextUntil()
	private nextUntilSameTag(el: Element) {
		const original = {
			nodeName: el.nodeName,
			level: this.getHeadingLevel(el),
		};
		const matched = [];
		matched.push(el);
		let next = el;
		while (next && el.nodeType !== 9) {
			if (el.nodeType === 1) {
				const level = this.getHeadingLevel(el);
				// stop on same tag or lower heading level
				if (el.nodeName === original.nodeName
					|| (level && original.level && level < original.level)) break;
				matched.push(el);
			}
			next = next.nextSibling as Element;
		}
		return matched;
	}

	// ^ REFACTORED ^

	private postError(error: Err) {
		console.warn(error?.title);
		console.warn(error?.description);
		if (error?.element) {
			console.warn(error.element);
		}
	}
}
