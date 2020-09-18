import { JSDOM } from 'jsdom';

export interface NodeLocation {
	startOffset: number;
	endOffset: number;
}

class HtmlNode {
	public element?: Element;

	public done: boolean;

	private doc: JSDOM;

	constructor(el: Element | null, doc: JSDOM) {
		if (el) this.element = el;
		this.doc = doc;
		this.done = false;
	}

	get nodeLocation(): NodeLocation | null {
		return this.element
			? this.doc.nodeLocation(this.element)
			: null;
	}

	markDone(): void {
		this.done = true;
	}
}

export default HtmlNode;
