/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'

// The Symbol used to tag the ReactElement-like types.
export const ELEMENT_TYPE = Symbol.for("my-own-react.element");
export const PORTAL_TYPE = Symbol.for("my-own-react.portal");
export const FRAGMENT_TYPE = Symbol.for("my-own-react.fragment");
export const STRICT_MODE_TYPE = Symbol.for("my-own-react.strict_mode");
export const PROFILER_TYPE = Symbol.for("my-own-react.profiler");
export const PROVIDER_TYPE = Symbol.for("my-own-react.provider");
export const CONTEXT_TYPE = Symbol.for("my-own-react.context");
export const SERVER_CONTEXT_TYPE = Symbol.for("my-own-react.server_context");
export const FORWARD_REF_TYPE = Symbol.for("my-own-react.forward_ref");
export const SUSPENSE_TYPE = Symbol.for("my-own-react.suspense");
export const SUSPENSE_LIST_TYPE = Symbol.for("my-own-react.suspense_list");
export const MEMO_TYPE = Symbol.for("my-own-react.memo");
export const LAZY_TYPE = Symbol.for("my-own-react.lazy");
export const SCOPE_TYPE = Symbol.for("my-own-react.scope");
export const DEBUG_TRACING_MODE_TYPE = Symbol.for(
    "my-own-react.debug_trace_mode"
);
export const OFFSCREEN_TYPE = Symbol.for("my-own-react.offscreen");
export const LEGACY_HIDDEN_TYPE = Symbol.for("my-own-react.legacy_hidden");
export const CACHE_TYPE = Symbol.for("my-own-react.cache");
export const TRACING_MARKER_TYPE = Symbol.for("my-own-react.tracing_marker");
export const SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for(
    "my-own-react.default_value"
);

const MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = "@@iterator";

export function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== "object") {
        return null;
    }
    const maybeIterator =
        (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
        maybeIterable[FAUX_ITERATOR_SYMBOL];
    if (typeof maybeIterator === "function") {
        return maybeIterator;
    }
    return null;
}
