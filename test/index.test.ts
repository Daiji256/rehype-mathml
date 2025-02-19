import assert from 'node:assert/strict';
import test from 'node:test';
import temml from 'temml';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeMathML from '../lib/index.js';

test('@daiji256/rehype-mathml', async (t) => {
  await t.test('should expose the public api', async () => {
    assert.deepEqual(Object.keys(await import('@daiji256/rehype-mathml')), [
      'default',
    ]);
  });

  await t.test('should transform math with temml', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML)
          .use(rehypeStringify)
          .process(
            `
            <p>Inline math ${temml.renderToString('\\alpha')}.</p>
            <p>Display math:</p>
            <div class="math-display">\\alpha</div>
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            `
            <p>Inline math ${temml.renderToString('\\alpha')}.</p>
            <p>Display math:</p>
            ${temml.renderToString('\\alpha', { displayMode: true })}
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
    );
  });

  await t.test('should support markdown math code block', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeMathML)
          .use(rehypeStringify)
          .process(
            `
            \`\`\`math
            \\alpha
            \`\`\`
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            temml.renderToString('\\alpha\n', {
              displayMode: true,
            }),
          ),
      ),
    );
  });

  await t.test('should integrate with `remark-math`', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(remarkParse)
          .use(remarkMath)
          .use(remarkRehype)
          .use(rehypeMathML)
          .use(rehypeStringify)
          .process(
            `
            Inline math $\\alpha$.

            Display math:

            $$
            \\alpha
            $$
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            `
            <p>Inline math ${temml.renderToString('\\alpha')}.</p>
            <p>Display math:</p>
            ${temml.renderToString('\\alpha', { displayMode: true })}
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
    );
  });

  await t.test('should `math-display` override `math-inline`', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML)
          .use(rehypeStringify)
          .process('<code class="math-inline math-display">\\alpha</code>'),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(temml.renderToString('\\alpha', { displayMode: true })),
      ),
    );
  });

  await t.test('should support `macros`', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML, { macros: { '\\AA': '\\mathbb{A}' } })
          .use(rehypeStringify)
          .process('<span class="math-inline">\\AA</span>'),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(temml.renderToString('\\mathbb{A}')),
      ),
    );
  });

  await t.test('should handle errors, support `errorColor`', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML, { errorColor: 'orange' })
          .use(rehypeStringify)
          .process('<span class="math-inline">\\alpa</span>'),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            temml.renderToString('\\alpa', {
              errorColor: 'orange',
              throwOnError: false,
            }),
          ),
      ),
    );
  });

  await t.test('should support `strict: false`', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML, { errorColor: 'orange', strict: false })
          .use(rehypeStringify)
          .process('<span class="math-inline">ê&amp;</span>'),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            '<span class="temml-error" style="color:orange;white-space:pre-line;">ê&#x26;\n\nParseError:  Expected \'EOF\', got \'&#x26;\' at position 2: \nê&#x26;̲</span>',
          ),
      ),
    );
  });

  await t.test('should support comments', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML)
          .use(rehypeStringify)
          .process(
            `
            <div class="math-display">
            \\begin{split}
            f(-2) &= \\sqrt{-2+4}\\\\
            &= x % Test Comment
            \\end{split}</div>
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            temml.renderToString(
              `
              \\begin{split}
              f(-2) &= \\sqrt{-2+4}\\\\
              &= x
              \\end{split}
              `
                .trim()
                .replace(/  +/g, ''),
              { displayMode: true },
            ),
          ),
      ),
    );
  });

  await t.test('should not crash on non-parse errors', async () => {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeMathML)
          .use(rehypeStringify)
          .process(
            `
            <span class="math-display">
            \\begin{split}
            \\end{{split}}
            </span>
            `
              .trim()
              .replace(/  +/g, ''),
          ),
      ),
      String(
        await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeStringify)
          .process(
            '<span class="rehype-mathml-error" style="color:#b22222" title="Error: Expected node of type textord, but got node of type ordgroup">\n\\begin{split}\n\\end{{split}}\n</span>',
          ),
      ),
    );
  });
});
