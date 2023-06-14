import markdownIt from 'markdown-it';
// @ts-ignore no types
import markdownItAttrs from 'markdown-it-attrs';
import markdownItKbd from '../src';

const trimmed = (text: string) =>
	text.replace(/\n\s*/g, '\n').replace(/^\n/, '');

describe('markdown-it-kbd', () => {
	const defaultMd = markdownIt().use(markdownItKbd);
	const attrsMd = markdownIt().use(markdownItAttrs).use(markdownItKbd);
	const presetMd = markdownIt().use(markdownItKbd, {
		presets: [{ name: 'icons' }],
	});
	const presetWithPrefixMd = markdownIt().use(markdownItKbd, {
		presets: [{ name: 'icons', prefix: 'icon:' }],
	});
	const presetWithPrefixAndTransformMd = markdownIt().use(markdownItKbd, {
		presets: [{ name: 'icons', prefix: 'icon:' }],
		transform: (content: string) => {
			return content[0].toUpperCase() + content.slice(1);
		},
	});
	const caseSensitiveMd = markdownIt().use(markdownItKbd, {
		caseSensitive: true,
		keyMap: {
			tHiSwIlLnOtWoRk:
				'Unless the content matches exactly with the keyMap key, it will not be replaced because caseSensitive is true.',
			THISWILLWORK: ':)',
		},
	});
	const transformMdUpperCase = markdownIt().use(markdownItKbd, {
		transform: (content: string) => {
			return content.toUpperCase();
		},
	});
	const transformMdPrefix = markdownIt().use(markdownItKbd, {
		transform: (content: string) => {
			return 'prefix: ' + content;
		},
	});
	const keyMapMd = markdownIt().use(markdownItKbd, {
		keyMap: {
			'test:abc': 'ABC',
			'test:def': 'DEF',
		},
	});
	const keyMapPresetMd = markdownIt().use(markdownItKbd, {
		presets: [{ name: 'icons' }],
		keyMap: {
			cmd: '---', // should override preset
		},
	});

	describe('[default]', () => {
		it('renders [[x]] as <kbd>x</kbd>', () => {
			expect(
				defaultMd.render(
					trimmed(`
            # Test

            This combination is cool: [[x]] + [[y]].
        `),
				),
			).toEqual(
				trimmed(`
            <h1>Test</h1>
            <p>This combination is cool: <kbd>x</kbd> + <kbd>y</kbd>.</p>
        `),
			);
		});

		it('supports nested <kbd> tags', () => {
			expect(
				defaultMd.render(
					trimmed(`
			[[[[Shift]]+[[F3]]]]
		`),
				),
			).toEqual(
				trimmed(`
			<p><kbd><kbd>Shift</kbd>+<kbd>F3</kbd></kbd></p>
		`),
			);
		});

		it.each([
			['[[\\[]]', '<kbd>[</kbd>'],
			['[[\\]]]', '<kbd>]</kbd>'],
			['[[\\[\\[]]', '<kbd>[[</kbd>'],
			['[[\\]\\]]]', '<kbd>]]</kbd>'],
		])('supports escaped delimiters: %s', (input, expected) => {
			expect(defaultMd.render(input)).toBe(`<p>${expected}</p>\n`);
		});

		it('supports deep nesting and markup in nested tags', () => {
			expect(
				defaultMd.render(
					trimmed(`
			[[[[[[Shift]]\`+\`[[_long[[x]]_]]]]-Ctrl]]+[[F4]]	
		`),
				),
			).toEqual(
				trimmed(`
			<p><kbd><kbd><kbd>Shift</kbd><code>+</code><kbd><em>long<kbd>x</kbd></em></kbd></kbd>-Ctrl</kbd>+<kbd>F4</kbd></p>
		`),
			);
		});

		it('does not harm link rendering', () => {
			expect(
				defaultMd.render(
					trimmed(`
			# Test

			This combination is cool: [[alt]]+[[f4]]. This link still works: [Google](http://google.com).
		`),
				),
			).toEqual(
				trimmed(`
			<h1>Test</h1>
			<p>This combination is cool: <kbd>alt</kbd>+<kbd>f4</kbd>. This link still works: <a href="http://google.com">Google</a>.</p>
		`),
			);
		});

		it('can be included in links', () => {
			expect(
				defaultMd.render(
					trimmed(`
			[[[[[Ctrl]]+[[V]]]]](https://devnull-as-a-service.com/dev/null)
		`),
				),
			).toEqual(
				trimmed(`
			<p><a href="https://devnull-as-a-service.com/dev/null"><kbd><kbd>Ctrl</kbd>+<kbd>V</kbd></kbd></a></p>
		`),
			);
		});

		it('allows markup within [[ and ]]', () => {
			expect(
				defaultMd.render(
					trimmed(`
			[[*i*]] [[\`foo\`]]
		`),
				),
			).toBe(
				trimmed(`
			<p><kbd><em>i</em></kbd> <kbd><code>foo</code></kbd></p>
		`),
			);
		});

		it.each([
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
			expect(defaultMd.render(input)).toBe(`<p>${expected}</p>\n`);
		});
	});

	describe('[attrs]', () => {
		it('can apply custom attributes', () => {
			expect(
				attrsMd.render(
					trimmed(`
				[[alt]]{data-custom=foo}+[[f4]]{data-custom=bar}
			`),
				),
			).toEqual(
				trimmed(`
				<p><kbd data-custom="foo">alt</kbd>+<kbd data-custom="bar">f4</kbd></p>
			`),
			);
		});

		it('can apply CSS classes', () => {
			expect(
				attrsMd.render(
					trimmed(`
				[[ctrl]]{.important}+[[v]]{.important}
			`),
				),
			).toEqual(
				trimmed(`
				<p><kbd class="important">ctrl</kbd>+<kbd class="important">v</kbd></p>
			`),
			);
		});
	});

	describe('[keyMap]', () => {
		it('replace keys with values', () => {
			expect(
				keyMapMd.render(
					trimmed(`
                # Test

                This combination is cool: [[test:abc]] + [[test:def]].
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This combination is cool: <kbd>ABC</kbd> + <kbd>DEF</kbd>.</p>
            `),
			);
		});
	});

	describe('[preset]', () => {
		it('can apply preset', () => {
			expect(
				presetMd.render(
					trimmed(`
                # Test

                This combination is cool: [[cmd]] + [[opt]].
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This combination is cool: <kbd>⌘</kbd> + <kbd>⌥</kbd>.</p>
            `),
			);
		});

		it('matches with presets.prefix', () => {
			expect(
				presetWithPrefixMd.render(
					trimmed(`
                # Test

                This: [[cmd]] won't match, but this: [[icon:cmd]] will.
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This: <kbd>cmd</kbd> won't match, but this: <kbd>⌘</kbd> will.</p>
            `),
			);
		});

		it(`matches with prefix and transform`, () => {
			expect(
				presetWithPrefixAndTransformMd.render(
					trimmed(`
                # Test

                This: [[cmd]] won't match, but this: [[icon:cmd]] will.
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This: <kbd>Cmd</kbd> won't match, but this: <kbd>⌘</kbd> will.</p>
            `),
			);
		});

		it('keyMap overrides preset', () => {
			// mac:cmd is ⌘ in preset, but replaced with --- in keyMap. mac:opt is ⌥ in preset, but not replaced in keyMap.
			expect(
				keyMapPresetMd.render(
					trimmed(`
                # Test

                This combination is cool: [[cmd]] + [[opt]].
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This combination is cool: <kbd>---</kbd> + <kbd>⌥</kbd>.</p>
            `),
			);
		});
	});

	describe('[caseSensitive]', () => {
		it('can be case sensitive', () => {
			expect(
				caseSensitiveMd.render(
					trimmed(`
                # Test

                This combination is cool: [[thiswillnotwork]] + [[THISWILLWORK]].
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This combination is cool: <kbd>thiswillnotwork</kbd> + <kbd>:)</kbd>.</p>
            `),
			);
		});
	});

	describe('[transform]', () => {
		it('can transform content (.toUpperCase())', () => {
			expect(
				transformMdUpperCase.render(
					trimmed(`
                # Test

                This will be uppercased: [[test]].
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This will be uppercased: <kbd>TEST</kbd>.</p>
            `),
			);
		});

		it('can transform content (prefix)', () => {
			expect(
				transformMdPrefix.render(
					trimmed(`
                # Test

                This will be prefixed: [[test]].
            `),
				),
			).toEqual(
				trimmed(`
                <h1>Test</h1>
                <p>This will be prefixed: <kbd>prefix: test</kbd>.</p>
            `),
			);
		});
	});
});
