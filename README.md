# Xyfy

Xyfy is a _tiny_ framework designed to let you use JSX in your codebase.

```jsx
/* @jsx jsx @jsxFrag fragment */
import xyfy, { fragment } from './xyfy';

// Create a JSX adapter for basic elements
const jsx = xyfy({
  root({ children }) {
    // Return arbitrary values
    return {
      type: 'root',
      children,
    };
  },

  heading({ level = 1, children }) {
    /* ... */
  },
  pagaraph({ children }) {
    /* ... */
  },
  /* ... */
});

// Functional components work too!
function Section({ title, level, children }) {
  return (
    <>
      <heading level={level}>{title}</heading>
      <paragraph>{children}</paragraph>
    </>
  );
}

saveAST(
  <root>
    <Section title="Installation">
      <code lang="shell">$ npm install --save xyfy</code>
      🔮✨
    </Section>
  </root>,
);
```

## Installation

```shell
$ npm install --save xyfy
```

🔮✨

## API

### Functional Components

A functional component is just a function with a particular structure: it takes a `props` parameter and returns '_something_'. The `props` passed to a functional component is guaranteed to at least be an object, never `null` or `undefined`.

```
(props) => any
```

A special feature of `props` is the `children` prop. `children` represents nodes that belong to the functional component. `children` may be any value, depending on what was passed to the JSX adapter.

### `jsx(component, props, ...children)`

- `component`: A functional component.
- `props`: `null` or an object containing this element's `props` (excluding `children`).
- `children`: Values to place into the `children` prop and pass to the `component`.

`jsx` is the basic form of a JSX adapter that handles combining `props` and `children` and passing them to a functional `component`.

#### Example

```js
import { jsx } from 'xyfy';

function PrintProps(props) {
  console.log(props);
}

jsx(PrintProps, null);
// <PrintProps />
// => {}

jsx(PrintProps, {
  items: ['apples', 'flour', 'butter'],
});
// <PrintProps items={['apples', 'flour', 'butter']} />
// => { items: ['apples', 'flour', 'butter'] }

jsx(PrintProps, { title: 'Installation' }, 'npm install --save xyfy');
// <PrintProps title="Installation">
//   npm install --save xyfy
// </printProps>
//
// => {
//      title: 'Installation',
//      children: 'npm install --save xyfy'
//    }

jsx(PrintProps, { title: 'API' }, 'Functional Components', 'jsx', 'xyfy');
// => {
//      title: 'API',
//      children: ['Functional Components', 'jsx', 'xyfy']
//    }
```

### `xyfy(intrinsics)`

- `intrinsics`: An object where each key is a camelCase string<sup>1</sup> and the value is a functional component for a basic element.

Returns a function similar to `jsx`, except the first parameter is called `elem`: a key of `intrinsics` (indicating which basic element to create) or a functional component.

`xyfy` augments the basic `jsx` adapter by teaching it how to handle strings defined by the `intrinsics` map you pass to it. If you pass an object like `{ applePie(props) { ... } }` to `xyfy` then the `jsx` function it returns knows what to do when it's given a string element, e.g. `jsx('applePie', null)` (`<applePie />`).

<sup>1</sup> In theory, this could also be a [symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), but it's unknown why you'd want to do this. The camelCase restriction is a byproduct of how a JSX interpreter differentiates basic elements and components.

#### Example

```js
import xyfy from 'xyfy';

const jsx = xyfy({
  basic() {
    console.log('basic');
  },
});

function Component() {
  console.log('Component');
}

jsx('basic', null);
// <basic />
// => basic

jsx(Component, null);
// <Component />
// => Component
```

## Grandma's Recipe 🥧

The recommended setup for using Xyfy is to create a file in your project that exports your basic element adapter. Then, import that adapter as `jsx` in your files that use JSX.

> Show, don't tell.

Your directory structure should look something like this:

```
├─ node_modules/
│  ├─ xyfy/
│  └─ ...
├─ src/
│  ├─ jsx.js       <-- Our JSX adapter
│  └─ index.jsx    <-- A file that uses JSX
└─ package.json
```

Then `jsx.js` would contain the definition of your basic elements:

```js
// jsx.js

import xyfy from 'xyfy';

// This makes it convenient to use fragments with only one import
export { fragment } from 'xyfy';

// Export your JSX adapter
export default xyfy({
  root({ children }) {
    return {
      type: 'root',
      children,
    };
  },

  heading({ level = 1, children }) {
    /* ... */
  },
  pagaraph({ children }) {
    /* ... */
  },
  /* ... */
});
```

And any file using your JSX adapter would import that adapter:

```jsx
// index.jsx

/* @jsx jsx @jsxFrag fragment */
import jsx, { fragment } from './jsx';

function Section({ title, level, children }) {
  return (
    <>
      <heading level={level}>{title}</heading>
      <paragraph>{children}</paragraph>
    </>
  );
}

saveAST(
  <root>
    <Section title="Installation">
      <code lang="shell">$ npm install --save xyfy</code>
      🔮✨
    </Section>
  </root>,
);
```

🎉 Ta-da!

(Don't forget to transpile with [Babel](https://babeljs.io/)!)

### An alternative

An alternative setup is to use the `jsx` adapter provided by Xyfy and simply declare your basic elements as exported functions:

```
├─ node_modules/
│  ├─ xyfy/
│  └─ ...
├─ src/
│  ├─ elements/        <-- Basic elements
│  │  ├─ Root.js
│  │  ├─ Heading.js
│  │  ├─ Paragraph.js
│  │  └─ ...
│  ├─ components/
│  │  └─ Section.jsx   <-- A component glues together elements
│  └─ index.jsx
└─ package.json
```

Under this structure, your code would be far more modular:

```js
// elements/root.js

export default function Root({ children }) {
  return {
    type: 'root',
    children,
  };
}
```

```jsx
// index.jsx

/* @jsx jsx @jsxFrag fragment */
import jsx, { fragment } from './jsx';
import Section from './components/Section';
import Root from './elements/Root';
import Code from './elements/Code';

saveAST(
  <Root>
    <Section title="Installation">
      <Code lang="shell">$ npm install --save xyfy</Code>
      🔮✨
    </Section>
  </Root>,
);
```

You'll notice under this setup that basic elements now have to be declared in PascalCase (with a capital letter at the front). This is due to the fact that the default `jsx` adapter has no basic elements. That means everything passed to it acts like a functional component.

---

## How tiny?

Take a peek at these sizes:

<!--
NOTE: Update the "Last Updated" note under this table when updating these measurements.

Commands to generate each:

Source:               wc -c < ./src/index.js
Built:                wc -c < ./dist/index.js
Minified:             npx terser ./dist/index.js -c -m | wc -c
Minified & Gzipped:   npx terser ./dist/index.js -c -m | gzip | wc -c

-->

|         Kind         |    Size |
| :------------------: | ------: |
|  Source<sup>1</sup>  | 2,269 B |
| Built<sup>1,2</sup>  | 2,386 B |
| Minified<sup>3</sup> |   930 B |
|  Minified & Gzipped  |   443 B |

(Yes, that's in **_bytes_**!)

<details>
<summary>Notes</summary>

Last Updated: 15 Aug 2019

<sup>1</sup> Sizes with this mark include tons of comments and whitespace. They're meant to show how much space this package takes up in your `node_modules` directory, rather than in a properly bundled application.

<sup>2</sup> Passed through [Babel](https://babeljs.io) to ensure compatibility with Node 8. This includes conversion to CommonJS, which adds some bloat.

<sup>3</sup> Minified using [terser](https://github.com/terser-js/terser), a fork of UglifyJS that supports ES2015+.

</details>

## What's the difference between elements and components?

Both are functions that take some `props` and return '_something_'.

A target structure (the thing your JSX models) is comprised of some basic building blocks, similar to how the universe is comprised of atoms or how a toy house is comprised of legos. These individual bits are called **basic elements** (sometimes also called _intrinsic_<sup>1</sup> elements).

Sometimes it's helpful to recognize a pattern of basic elements that isn't quite the full product. When you assign a name to a subgroup of basic elements it becomes a **component**. A component can be comprised of basic elements, other components, or some combination of both!

For example, if your target structure is a programming language AST:

- The **basic elements** might be an identifier (`abc`), an expression (`123`), and a declaration (`x = y`), among others.
- A **component** might be a Variable Declaration (`abc = 123`), which takes an `identifier` and `expression` and returns a `declaration`.

<sup>1</sup> The term _intrinsic_ refers to the idea that the element is natural or essential.

## How does `children` work?

The `children` prop has some special semantics associated with it. The value you get for your `children` prop will depend on what ends up being passed to the `jsx` adapter. There's a few scenarios:

|                                       Case                                       | Value of `children`                                                                     |
| :------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------- |
|                  No children are passed<br/>`jsx(elem, props)`                   | `undefined`.                                                                            |
|                One child is passed<br/>`jsx(elem, props, child)`                 | the value of `child`; if `child` is `'peach'` then props will have `children: 'peach'`. |
| Multiple children are passed<br/>`jsx(elem, props, child1, child2, ..., childN)` | an array containing the children passed; `[child1, child2, ..., childN]`.               |

Arrays also follow the rules above.

If you pass a single array as a child to an element, it will appear to that functional component that _multiple_ children were passed.

```js
jsx(elem, props, [abc, 'easy as', 123]);
// => children: [abc, 'easy as', 123]
```

If you pass an array alongside other children, then that array will be _inside_ the `children` array passed to the functional component.

```js
jsx(elem, props, 'Guess the song:', [abc, 'easy as', 123]);
// => children: ['Guess the song:', [abc, 'easy as', 123]]
```

## Why not React?

Xyfy is meant to be just the glue between JSX and some data represented by that JSX. On the other hand, [React](https://reactjs.org/) is a framework for building user interfaces that _react_ to events (e.g. element interaction). Xyfy and React don't take up the same problem space, so comparing them isn't very useful. 😕

To make it plain:

- If you're building a user interface that reacts to certain events (e.g. user interaction or data fetching), then React is what you're looking for. React has been architected to solve this problem. 🙂
- If you're yearning for the familiar JSX syntax, but aren't building something particularly interactive or reactive (e.g. constructing some kind of static document or AST), then Xyfy is exactly what you're looking for. 😊

## Why JSX?

The core of JSX is that it's just a different way of representing a pattern of calling functions. To illustrate:

```jsx
<foo>
  <bar>baz</bar>
</foo>;

// is equivalent to:

jsx('foo', null, jsx('bar', null, 'baz'));
```

The latter can become cumbersome and difficult to read when the primary goal of your code is to create some nested structure, e.g. an AST:

```js
/**
 * A trimmed-down excerpt from an actual code sample.
 */
function documentClassLikeFields(fields) {
  return fields.length === 0
    ? undefined
    : table(
        ['center', 'center', null],
        [
          tableRow(
            filterUndef([
              tableCell(text('Name')),
              tableCell(text('Type')),
              propsHaveDesc ? tableCell(text('Description')) : undefined,
            ]),
          ),
          ...fields.map(field =>
            tableRow(
              filterUndef([
                // Name
                tableCell(text(field.name)),

                // Type
                tableCell(
                  formatExcerptReferences(ctx, field.propertyTypeExcerpt),
                ),

                // Description
                propsHaveDesc
                  ? tableCell(convertDocSection(field.description))
                  : undefined,
              ]),
            ),
          ),
        ],
      );
}
```

The nesting starts to fight against you, it becomes difficult to determine what's a regular function and what generates the structure, and the presence of magic parameters (parameters that don't have inherent meaning, e.g. `['center', 'center', null]`) all hinder understanding and readability of the code.

JSX is positioned to solve this by:

- Separating structures from functions.
- Giving names to parameters (props).
- Extracting common patterns to simple components.

But after transpiling, it's just a bunch of functions again. Anything you can do with JSX can be identically created with functions.

Thus the decision to adopt JSX into a project comes down to aesthetics: does your code read better as JSX or as functions?
