import { preset as cleanup } from './tasks/cleanup';
import { preset as headings } from './tasks/headings';
import { preset as images } from './tasks/images';
import { preset as keyterms } from './tasks/keyterms';
import { preset as lists } from './tasks/lists';
import { preset as segment } from './tasks/segment';

const all = [
	cleanup,
	images,
	headings,
	lists,
	segment,
	keyterms,
].reduce((acc: unknown[], cur) => acc.concat(cur), []);

export const preset = {
	all,
	cleanup,
	headings,
	images,
	keyterms,
	lists,
	segment,
};
