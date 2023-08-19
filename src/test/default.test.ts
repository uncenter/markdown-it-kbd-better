import { expect, test } from 'vitest';

import markdownIt from 'markdown-it';
import markdownItKbd from '../.';

const md = markdownIt().use(markdownItKbd);

test('renders [[x]]', () => {
	expect(md.renderInline(`[[x]] + [[y]].`)).toContain(
		`<kbd>x</kbd> + <kbd>y</kbd>.`,
	);
});

test('supports nesting', () => {
	expect(md.renderInline(`[[[[Shift]]+[[F3]]]]`)).toContain(
		`<kbd><kbd>Shift</kbd>+<kbd>F3</kbd></kbd>`,
	);
});

test.each([
	['[[\\[]]', '<kbd>[</kbd>'],
	['[[\\]]]', '<kbd>]</kbd>'],
	['[[\\[\\[]]', '<kbd>[[</kbd>'],
	['[[\\]\\]]]', '<kbd>]]</kbd>'],
])('supports escaped brackets: %s', (input, expected) => {
	expect(md.renderInline(input)).toContain(`${expected}`);
});

test('supports deep nesting and markup in nested tags', () => {
	expect(
		md.renderInline(`[[[[[[Shift]]\`+\`[[_long[[x]]_]]]]-Ctrl]]+[[F4]]`),
	).toContain(
		`<kbd><kbd><kbd>Shift</kbd><code>+</code><kbd><em>long<kbd>x</kbd></em></kbd></kbd>-Ctrl</kbd>+<kbd>F4</kbd>`,
	);
});

test('does not harm link rendering', () => {
	expect(
		md.renderInline(
			`This combination is cool: [[alt]]+[[f4]]. This link still works: [Google](http://google.com).`,
		),
	).toContain(
		`This combination is cool: <kbd>alt</kbd>+<kbd>f4</kbd>. This link still works: <a href="http://google.com">Google</a>.`,
	);
});

test('can be included in links', () => {
	expect(
		md.renderInline(
			`[[[[[Ctrl]]+[[V]]]]](https://devnull-as-a-service.com/dev/null)`,
		),
	).toContain(
		`<a href="https://devnull-as-a-service.com/dev/null"><kbd><kbd>Ctrl</kbd>+<kbd>V</kbd></kbd></a>`,
	);
});

test('allows markup within [[ and ]]', () => {
	expect(md.renderInline(`[[*i*]] [[\`foo\`]]`)).toContain(
		`<kbd><em>i</em></kbd> <kbd><code>foo</code></kbd>`,
	);
});

test.each([
	['[[foo]] [[', '<kbd>foo</kbd> [['],
	['[[bar]] ]] hey', '<kbd>bar</kbd> ]] hey'],
	['[[this]] [[ [[and that]]', '<kbd>this</kbd> [[ <kbd>and that</kbd>'],
	['[[that]] ]] [[and this]]', '<kbd>that</kbd> ]] <kbd>and this</kbd>'],
	[
		'[[ *some markup* [[ `more markup` [[valid]] **even more**',
		'[[ <em>some markup</em> [[ <code>more markup</code> <kbd>valid</kbd> <strong>even more</strong>',
	],
	['[[', '[['],
	['[[[x]]', '[<kbd>x</kbd>'],
	['[[[x]]]', '[<kbd>x</kbd>]'],
	['[[*test*', '[[<em>test</em>'],
	['[[[[Shift]]+[[F3]]]', '[[<kbd>Shift</kbd>+<kbd>F3</kbd>]'],
	['[[\\\\]]', '<kbd>\\</kbd>'],
])('renders arbitrary content correctly: %s', (input, expected) => {
	expect(md.renderInline(input)).toContain(`${expected}`);
});
