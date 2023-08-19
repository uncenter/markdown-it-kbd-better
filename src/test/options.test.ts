import { describe, expect, test } from 'vitest';

import markdownIt from 'markdown-it';
import markdownItKbd from '../.';

describe('keyMap', () => {
	test('replace keys with values', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					keyMap: {
						'test:abc': 'ABC',
						'test:def': 'DEF',
					},
				})
				.renderInline(`[[test:abc]] + [[test:def]]`),
		).toContain(`<kbd>ABC</kbd> + <kbd>DEF</kbd>`);
	});
});

describe('preset', () => {
	test('can apply preset', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					presets: [{ name: 'icons' }],
				})
				.render(`[[cmd]] + [[opt]]`),
		).toContain(`<kbd>⌘</kbd> + <kbd>⌥</kbd>`);
	});

	test('matches with presets.prefix', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					presets: [{ name: 'icons', prefix: 'icon:' }],
				})
				.render(`[[cmd]] won't match, but [[icon:cmd]] will`),
		).toContain(`<kbd>cmd</kbd> won't match, but <kbd>⌘</kbd> will`);
	});

	test(`matches with prefix and transform`, () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					presets: [{ name: 'icons', prefix: 'icon:' }],
					transform: (content: string) => {
						return content.toUpperCase();
					},
				})
				.render(`[[icon:cmd]] matches, [[cmd]] is transformed`),
		).toContain(`<kbd>⌘</kbd> matches, <kbd>CMD</kbd> is transformed`);
	});

	test('keyMap overrides preset', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					presets: [{ name: 'icons' }],
					keyMap: {
						cmd: '---',
					},
				})
				.render(`[[cmd]] + [[opt]]`),
		).toContain(`<kbd>---</kbd> + <kbd>⌥</kbd>`);
	});
});

describe('caseSensitive', () => {
	test('can be case-sensitive', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					caseSensitive: true,
					keyMap: {
						ABC: ':)',
					},
				})
				.renderInline(`[[abc]] + [[ABC]]`),
		).toContain(`<kbd>abc</kbd> + <kbd>:)</kbd>`);
	});

	test('without case-sensitive', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					caseSensitive: false,
					keyMap: {
						ABC: ':)',
					},
				})
				.renderInline(`[[abc]] + [[ABC]]`),
		).toContain(`<kbd>:)</kbd> + <kbd>:)</kbd>`);
	});
});

describe('transform', () => {
	test('can transform content (.toUpperCase())', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					transform: (content: string) => {
						return content.toUpperCase();
					},
				})
				.render(`[[test]]`),
		).toContain(`<kbd>TEST</kbd>`);
	});

	test('can transform content (prefix)', () => {
		expect(
			markdownIt()
				.use(markdownItKbd, {
					transform: (content: string) => {
						return 'prefix: ' + content;
					},
				})
				.render(`[[test]]`),
		).toContain(`<kbd>prefix: test</kbd>`);
	});
});
