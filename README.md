# markdown-it-kbd-better

This is a fork of [markdown-it-kbd](https://github.com/jGleitz/markdown-it-kbd) with some tiny improvements just for myself.

Notably, it includes the following changes:

- Support for replacing key names with values using a map (e.g. `mac:cmd` -> `⌘`). Fully customizable in the options, add your own replacements or disable it completely. Comes with a built-in preset for macOS keys.
- Support for transforming key names with a custom function (e.g. adding a prefix to all keys or capitalizing them). Fully customizable in the options, add your own transformations or disable it completely.
- Support for case-sensitive key matching. Fully customizable in the options, disable it if you don't need it.

## Installation

```sh
npm install markdown-it-kbd-better
```

```sh
yarn add markdown-it-kbd-better
```

## Usage

```js
const markdownIt = require('markdown-it');
const markdownItKbd = require('markdown-it-kbd-better');

const md = markdownIt().use(markdownItKbd);
```

## Options

### `presets`

Default: `['mac']`

Enable built-in presets. Currently, the only built-in preset is `mac`, which replaces keys like `mac:cmd` with `⌘`, but more may be added in the future (feel free to open an issue if you have a suggestion).

To disable all built-in presets, set this to an empty array:

```js
.use(markdownItKbd, {
  presets: []
})
```

### `keyMap`

Default: `{}`

A map of keys and values to replace. If the content of a KBD element is present in this map, it will be replaced with the corresponding value.

For example, you could replace `option` with `⌥`:

```js
.use(markdownItKbd, {
    keyMap: {
        'option': '⌥'
    }
}
```

### `caseSensitive`

Default: `false`

Whether or not to match keys in a case-sensitive manner. If this is set to `false`, all keys will be converted to lowercase before being matched. Otherwise, they will be matched exactly as they appear in the map.

### `transform`

Default: `return content;` (no transformation)

A function that transforms the content. This is useful for things like capitalizing the key name or adding a prefix to it.

For example, you could capitalize all key names:

```js
.use(markdownItKbd, {
    transform: (content: string) => {
        return content.toUpperCase();
    }
})
```

Or you could add a prefix to all key names:

```js
.use(markdownItKbd, {
    transform: (content: string) => {
        return `Key: ${content}`;
    }
})
```

## License

[MIT](LICENSE)
