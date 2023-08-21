import { expect, test } from 'vitest';

import markdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItKbd from '../src';

const md = markdownIt().use(markdownItAttrs).use(markdownItKbd);

test('can apply custom attributes', () => {
	expect(
		md.renderInline(`[[alt]]{data-custom=foo}+[[f4]]{data-custom=bar}`),
	).toContain(
		`<kbd data-custom="foo">alt</kbd>+<kbd data-custom="bar">f4</kbd>`,
	);
});

test('can apply CSS classes', () => {
	expect(md.renderInline(`[[ctrl]]{.important}+[[v]]{.important}`)).toContain(
		`<kbd class="important">ctrl</kbd>+<kbd class="important">v</kbd>`,
	);
});
