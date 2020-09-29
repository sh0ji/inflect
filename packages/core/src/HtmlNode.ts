import { JSDOM } from 'jsdom';

export interface NodeLocation {
	startOffset: number;
	endOffset: number;
}

class HtmlNode {
	public done = false;

	constructor(public element: Element | null, public doc: JSDOM) {
		if (element) this.element = element;
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
