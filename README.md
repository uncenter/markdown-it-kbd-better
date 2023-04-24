# markdown-it-kbd-better

This is a fork of [markdown-it-kbd](https://github.com/jGleitz/markdown-it-kbd) with some tiny improvements just for myself.

Notably, it includes the following changes:

- Support for replacing key names with Unicode characters (e.g. `mac:cmd` -> `⌘`). Fully customizable in the options, add your own replacements or disable it completely.
- Support for transforming key names with a custom function (e.g. adding a prefix to all keys or capitalizing them). Fully customizable in the options, add your own transformations or disable it completely.

## Installation

```sh
npm install markdown-it-kbd-better
```

```sh
yarn add markdown-it-kbd-better
```

## Usage

```js
const markdownIt = require('markdown-it')
const markdownItKbd = require('markdown-it-kbd-better')

const md = markdownIt().use(markdownItKbd, { // ... options ... })
```

## Options

interface MarkdownItKbdOptions {
replaceMap?: { [key: string]: string };
transform?: (content: string) => string;
}

### `replaceMap`

Type: `Record<string, string>` or `string`

Default: `replaceMap: {}`

A map of key names to their replacement. If a key name is present in this map, it will be replaced with the corresponding value.

For example, you could use the built-in `mac` map preset to replace keys like `mac:cmd` with `⌘`:

```js
.use(markdownItKbd, {
  replaceMap: 'mac'
})
```

Or you could define your own map:

```js
.use(markdownItKbd, {
    replaceMap: {
        'option': '⌥ Option', // Replace `option` with `⌥ Option`
    }
}
```

### `transform`

Type: `(content: string) => string`

Default: `transform: (content: string) => { return content; }`

A function that transforms the key name. This is useful for things like capitalizing the key name or adding a prefix to it.

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
