# @daiji256/rehype-mathml

[![npm version](https://img.shields.io/npm/v/@daiji256/rehype-mathml.svg)](https://www.npmjs.com/package/@daiji256/rehype-mathmle)
[![npm downloads](https://img.shields.io/npm/dm/@daiji256/rehype-mathml.svg)](https://www.npmjs.com/package/@daiji256/rehype-mathml)

**[rehype][]** plugin to render math with MathML by
converting LaTeX math to MathML using temml.
The reason for using [temml][] is that it is a lightweight library
with a wide coverage of LaTeX functions.

## Contents

- [Contents](#contents)
- [What is this?](#what-is-this)
- [When should I use this?](#when-should-i-use-this)
- [Install](#install)
- [Use](#use)
- [API](#api)
  - [`unified().use(rehypeMathML[, options])`](#unifieduserehypemathml-options)
  - [`Options`](#options)
- [Markdown](#markdown)
- [HTML](#html)
- [Types](#types)
- [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin to render math with MathML.
You can add classes to HTML elements, use fenced code in markdown, or combine
with [`remark-math`][remark-math] for a `$C$` syntax extension.

## When should I use this?

This project is useful as it renders math with MathML at compile time,
which means that no client-side JavaScript or images are needed.

This plugin is the MathML version of other plugins like
[`rehype-mathjax`][rehype-mathjax] (renders with MathJax) and
[`rehype-katex`][rehype-katex] (renders with KaTeX).
With MathML, the HTML becomes simpler and lighter.
Additionally, it supports the use of math fonts like [Noto Math][note-math].

## Install

In Node.js (version 16+), install with [npm][]:

```sh
npm install @daiji256/rehype-mathml
```

To ensure proper rendering of mathematical expressions in every browser, you need to add [`Temml.woff2` and `Temml-*.css`][temml-dist].

## Use

Say our document `input.html` contains:

```html
<p>
  Lift(<code class="language-math">L</code>) can be determined by Lift
  Coefficient (<code class="language-math">C_L</code>) like the following
  equation.
</p>
<pre><code class="language-math">
  L = \frac{1}{2} \rho v^2 S C_L
</code></pre>
```

…and our module `example.js` contains:

```js
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeMathML from '@daiji256/rehype-mathml';
import { read, write } from 'to-vfile';

const file = await unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeMathML)
  .use(rehypeStringify)
  .process(await read('input.html'));

file.basename = 'output.html';
await write(file);
```

…then running `node example.js` creates an `output.html` with:

```html
<p>
  Lift(<math><!--…--></math>) can be determined by Lift
  Coefficient (<math><!--…--></math>) like the following
  equation.
</p>
<math display="block" class="tml-display" style="display:block math;"><!--…--></math>
```

…open `output.html` in a browser to see the rendered math.

## API

This package exports no identifiers.
The default export is [`rehypeMathML`](#unifieduserehypemathml-options).

### `unified().use(rehypeMathML[, options])`

Render elements with a `language-math` (or `math-display`, `math-inline`)
class with [MathML][].

### `Options`

Configuration (TypeScript type).

```ts
import type { Options as TemmlOptions } from 'temml';

type Options = Partial<TemmlOptions>;
```

See [_Options_ on `temml.org`][temml-options] for more info.

## Markdown

This plugin supports the syntax extension enabled by
[`remark-math`][remark-math].
It also supports math generated by using fenced code:

````markdown
```math
C_L
```
````

## HTML

The content of any element with a `language-math`, `math-inline`, or
`math-display` class is transformed.
The elements are replaced by MathML transformed by temml.
Either a `math-display` class or using `<pre><code class="language-math">` will
result in “display” math: math that is a block on its own line.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`](#options).

## License

[MIT][license] © [Daiji256][author]

<!-- Definitions -->

[mathml]: https://www.w3.org/Math/
[temml]: https://temml.org/
[temml-options]: https://temml.org/docs/en/administration#options
[temml-dist]: https://github.com/ronkok/Temml/tree/main/dist
[unified]: https://github.com/unifiedjs/unified
[rehype]: https://github.com/rehypejs/rehype
[remark-math]: https://github.com/remarkjs/remark-math/tree/main/packages/remark-math
[rehype-mathjax]: https://github.com/remarkjs/remark-math/tree/main/packages/rehype-mathjax
[rehype-katex]: https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex
[npm]: https://docs.npmjs.com/cli/install
[typescript]: https://www.typescriptlang.org
[note-math]: https://github.com/notofonts/math
[license]: LICENSE
[author]: https://github.com/Daiji256
