import test from 'ava';
import xyfy, { jsx, fragment } from '../dist/index';

/** A simple component that returns its props. */
function Props(props) {
  return props;
}

const x = xyfy({
  /** A simple component that returns its props. */
  props: Props,
});

/**
 * A test macro that ensures `props` are consistent across intrinsic elements
 * and functional components, whether passing through an intrinsic element
 * factory or called directly by `factory`.
 */
function propsEqual(t, expected, props, ...children) {
  t.deepEqual(expected, x('props', props, ...children));
  t.deepEqual(expected, x(Props, props, ...children));
  t.deepEqual(expected, jsx(Props, props, ...children));
}

/**
 * A test macro that ensures `children` (1) work correctly and (2) are
 * consistent in the same way as `propsEqual`.
 */
function childrenEqual(t, expected, children) {
  propsEqual(
    t,
    expected === undefined ? {} : { children: expected },
    {},
    ...children,
  );
}

// <props /> or <props></props>
test('bare self-closing/empty tags get empty props', propsEqual, {}, null);

// <props type="list" kind="favorite people">you</props>
test(
  'children and props merge',
  propsEqual,
  { type: 'list', kind: 'favorite people', children: 'you' },
  { type: 'list', kind: 'favorite people' },
  'you',
);

test('giving no children sets no children prop', childrenEqual, undefined, []);
test('single child is itself', childrenEqual, 1, [1]);
test(
  'multiple children are put in an array',
  childrenEqual,
  [['a'], 1, { b: 2 }],
  [['a'], 1, { b: 2 }],
);

// <props>{1}<>{2}</>{3}</props>
test(
  'fragments are spread',
  childrenEqual,
  [1, 2, 3],
  [1, jsx(fragment, null, 2), 3],
);

// <props><>{1}<><>{2}</></></>{3}</props>
test(
  'nested fragments end up flat',
  childrenEqual,
  [1, 2, 3],
  [jsx(fragment, null, 1, jsx(fragment, null, jsx(fragment, null, 2))), 3],
);

// <props>{1}<></>{2}</props>
test(
  'empty fragments disappear',
  childrenEqual,
  [1, 2],
  [1, jsx(fragment, null), 2],
);
