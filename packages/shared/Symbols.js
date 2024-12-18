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
export const FRAGMENT_TYPE = Symbol.for("my-own-react.fragment");
export const TEXT_TYPE = Symbol.for("my-own-react.text");
