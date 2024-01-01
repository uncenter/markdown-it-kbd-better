# markdown-it-kbd-better

This is a fork of [markdown-it-kbd](https://github.com/jGleitz/markdown-it-kbd) with some tiny improvements just for myself.

Notably, it includes the following changes:

-   Support for replacing key names with values using a map (e.g. `mac:cmd` -> `⌘`). Fully customizable in the options, add your own replacements or disable it completely. Comes with a built-in preset for replacing some common keys with icons. You could use this to make macros like `copy` to `⌘+C` or `win:ctrl` to `⊞+Ctrl`.
-   Support for transforming key names with a custom function (e.g. adding a prefix to all keys or capitalizing them). Fully customizable in the options, add your own transformations or disable it completely.
-   Support for case-sensitive key matching. Fully customizable in the options, disable it if you don't need it.

## Installation

```sh
npm i markdown-it-kbd-better
pnpm add markdown-it-kbd-better
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

Default: `[]`

Enable built-in presets. Currently, the only built-in preset is `icons`, which replaces keys like `cmd` with `⌘`, but more may be added in the future (feel free to open an issue if you have a suggestion).

To enable the `icons` preset, use the following:

```js
.use(markdownItKbd, {
    presets: [{
        name: 'icons'
    }]
});
```

You can optionally pass `prefix` as well, which is used to prefix the key name. For example, if you wanted to match `icon:cmd` (prefixed with `icon:`) instead of `cmd`, you could use the following:

```js
.use(markdownItKbd, {
    presets: [
        {
            name: 'icons',
            prefix: 'icon:'
        }
    ]
});
```

### `keyMap`

Default: `{}`

A map of keys and values to replace. If the content of a KBD element is present in this map, it will be replaced with the corresponding value.

For example, you could replace `win` with `⊞`:

```js
.use(markdownItKbd, {
    keyMap: {
        win: '⊞'
    }
});
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
});
```

Or you could add a text to all key names:

```js
.use(markdownItKbd, {
    transform: (content: string) => {
        return `Key: ${content}`;
    }
});
```

## License

[MIT](LICENSE)
