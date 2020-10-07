export interface NodeLocation {
	startOffset: number;
	endOffset: number;
}

export class HtmlNode {
	public done = false;

	constructor(public element: Element | null) {
		if (element) this.element = element;
		this.done = false;
	}

	markDone(): void {
		this.done = true;
	}
}
