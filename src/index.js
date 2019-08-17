/** A "branding" on JSX fragments. */
export const FRAGMENT_BRAND = Symbol('xyfy Fragment');

/**
 * A JSX fragment factory.
 */
export function fragment({ children }) {
  return {
    [FRAGMENT_BRAND]: true,
    children,
  };
}

/**
 * Checks if a given object is a fragment.
 */
function isFragment(obj) {
  return obj[FRAGMENT_BRAND];
}

/**
 * Extracts the contents of a fragment.
 */
function extractContents(fragment) {
  return fragment.children;
}

/**
 * Flattens a fragment or fragments in a list of children.
 */
function flattenFragments(children) {
  // When given a single child, flatten it (if it's a fragment) or return itself
  if (!Array.isArray(children)) {
    return isFragment(children) ? extractContents(children) : children;
  }

  // Flatten fragments to their contents
  const result = [];

  for (const elem of children) {
    if (isFragment(elem)) {
      // Fragments expand in `children`, replaced by the fragment's contents
      const contents = extractContents(elem);

      if (Array.isArray(contents)) {
        // Fragments with multiple contents expand to multiple children
        result.push(...contents);
      } else if (contents !== undefined) {
        // Fragments with 1 child expand to just 1 child
        result.push(contents);
      }
    } else {
      // Non-fragments stay the same
      result.push(elem);
    }
  }

  return result.length === 0
    ? undefined
    : result.length === 1
    ? result[0]
    : result;
}

/**
 * Merges a set of props and an array of children.
 */
function withChildren(props, children) {
  return Object.assign(
    {},
    props,
    children.length > 0 && {
      children: flattenFragments(
        children.length === 1 ? children[0] : children,
      ),
    },
  );
}

/**
 * Merges a set of props and a list of children and passes them to a component
 * factory.
 */
export function jsx(component, props, ...children) {
  return component(withChildren(props, children));
}

/**
 * Creates a JSX factory from a map of intrinsic element factories.
 */
export default function xyfy(intrinsics) {
  return (component, props, ...children) => {
    return jsx(
      typeof component === 'function' ? component : intrinsics[component],
      props,
      ...children,
    );
  };
}
