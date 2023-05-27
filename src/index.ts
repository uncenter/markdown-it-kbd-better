import markdownIt from 'markdown-it';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';

const MARKER_OPEN = '[';
const MARKER_CLOSE = ']';
const ESCAPE_CHARACTER = '\\';
const TAG = 'kbd';

type markdownItKbdOptions = {
	presets?: { name: string; prefix?: string }[];
	keyMap?: { [key: string]: string };
	caseSensitive?: boolean;
	transform?: (content: string) => string;
};

export default function kbdPlugin(
	markdownIt: markdownIt,
	options: markdownItKbdOptions,
) {
	const replaceMapPresets: { [key: string]: { [key: string]: string } } = {
		icons: {
			cmd: '⌘',
			command: '⌘',
			opt: '⌥',
			option: '⌥',
			ctrl: '⌃',
			control: '⌃',
			shift: '⇧',
			ret: '⏎',
			return: '⏎',
			pageup: '⇞',
			pagedown: '⇟',
			backspace: '⌫',
			delete: '⌦',
			arrRight: '→',
			arrLeft: '←',
			arrUp: '↑',
			arrDown: '↓',
			capslock: '⇪',
			tab: '⇥',
			space: '␣',
			enter: '⏎',
		},
	};

	const defaults = {
		presets: [],
		keyMap: {},
		caseSensitive: false,
		transform: (content: string) => {
			return content;
		},
	};

	const opts = markdownIt.utils.assign({}, defaults, options || {});
	if (opts.presets) {
		opts.presets.forEach((preset: { name: string; prefix?: string }) => {
			if (replaceMapPresets[preset.name]) {
				const presetMap: any = replaceMapPresets[preset.name];
				opts.keyMap = markdownIt.utils.assign(
					{},
					...Object.keys(presetMap).map((key) => {
						return {
							[`${preset?.prefix || ''}${key}`]: presetMap[key],
						};
					}),
					opts.keyMap,
				);
			}
		});
	}

	function tokenize(state: StateInline, silent: boolean) {
		if (silent) {
			return false;
		}

		const start = state.pos;
		const max = state.posMax;
		let momChar = state.src.charAt(start);
		let nextChar = state.src.charAt(start + 1);

		if (momChar !== MARKER_OPEN || nextChar !== MARKER_OPEN) {
			return false;
		}

		let openTagCount = 1;
		let end = -1;
		let skipNext = false;
		for (let i = start + 1; i < max && end === -1; i++) {
			momChar = nextChar;
			nextChar = state.src.charAt(i + 1);
			if (skipNext) {
				skipNext = false;
				continue;
			}
			if (momChar === MARKER_CLOSE && nextChar === MARKER_CLOSE) {
				openTagCount -= 1;
				if (openTagCount == 0) {
					// Found the end!
					end = i;
				}
				// Skip second marker char, it is already counted.
				skipNext = true;
			} else if (momChar === MARKER_OPEN && nextChar === MARKER_OPEN) {
				openTagCount += 1;
				// Skip second marker char, it is already counted.
				skipNext = true;
			} else if (momChar === '\n') {
				// Found end of line before the end sequence. Thus, ignore our start sequence!
				return false;
			} else if (momChar === ESCAPE_CHARACTER) {
				skipNext = true;
			}
		}

		// Input ended before closing sequence.
		if (end === -1) {
			return false;
		}

		state.push('kbd_open', TAG, 1);
		state.pos += 2;
		state.posMax = end;
		state.md.inline.tokenize(state);

		const tokens = state.tokens;
		for (let i = tokens.length - 1; i >= 0; i--) {
			const token = tokens[i];
			const prevToken = tokens[i - 1] || {};
			if (token.type === 'text' && prevToken.type === 'kbd_open') {
				const content = token.content;
				if (opts.caseSensitive) {
					if (content in opts.keyMap) {
						token.content = opts.keyMap[content];
					}
				} else {
					const lowerContent = content.toLowerCase();
					if (lowerContent in opts.keyMap) {
						token.content = opts.keyMap[lowerContent];
					}
				}
				if (opts.transform) {
					token.content = opts.transform(token.content);
				}
			}
		}

		state.pos = end + 2;
		state.posMax = max;
		state.push('kbd_close', TAG, -1);

		return true;
	}
	markdownIt.inline.ruler.before('link', 'kbd', tokenize);
}
