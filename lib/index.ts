import type { Root, RootContent } from 'hast';
import type { Plugin } from 'unified';
import temml from 'temml';
import { SKIP, visitParents } from 'unist-util-visit-parents';
import { toText } from 'hast-util-to-text';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';

type Options = Partial<temml.Options>;

const rehypeMathML: Plugin<[Options?], Root> = (options) => {
  return (tree) => {
    visitParents(tree, 'element', (element, parents) => {
      const classes = Array.isArray(element.properties.className)
        ? element.properties.className
        : [];

      const languageMath = classes.includes('language-math');
      const mathDisplay = classes.includes('math-display');
      const mathInline = classes.includes('math-inline');
      if (!languageMath && !mathDisplay && !mathInline) return;

      let scope = element;
      let parent = parents[parents.length - 1];
      let displayMode = mathDisplay;
      if (
        element.tagName === 'code' &&
        languageMath &&
        parent &&
        parent.type === 'element' &&
        parent.tagName === 'pre'
      ) {
        scope = parent;
        parent = parents[parents.length - 2];
        displayMode = true;
      }

      if (!parent) return;

      const latex = toText(scope, { whitespace: 'pre' });

      let result: RootContent[];
      try {
        const mathml = temml.renderToString(
          latex,
          Object.assign({}, options || {}, { displayMode: displayMode }),
        );
        result = unified()
          .use(rehypeParse, { fragment: true })
          .parse(mathml).children;
      } catch (error) {
        result = [
          {
            type: 'element',
            tagName: 'span',
            properties: {
              className: ['rehype-mathml-error'],
              style: 'color:' + ((options || {}).errorColor || '#b22222'),
              title: String(error),
            },
            children: [{ type: 'text', value: latex }],
          },
        ];
      }

      const index = parent.children.indexOf(scope);
      parent.children.splice(index, 1, ...result);
      return SKIP;
    });
  };
};

export default rehypeMathML;
