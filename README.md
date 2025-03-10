# my-own-react

The goal of this project is to understand and recreate React. I will not try to optimize it.

This is a side-project to discover how React works under the hood by:

-   reading React source code
-   reading blogs
-   watching videos

## JSX:

JSX or JavaScript XML is a special syntax that allow developer to write JavaScript in an XML-like syntax:

```jsx
const element = <h1>Hello World<h1>
```

In order to use JSX, we first have to transcomile it using [Babel](https://babeljs.io/docs/) and its [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/babel-plugin-transform-react-jsx) plugin.

In the latest version, this Babel plugin needs 3 exported elements:

-   The `jsx` function
-   The `jsxs` function
-   The `Fragment` Symbol

The plugin automatic runtime will compile the JSX by using the jsx functions:

Example:

```jsx
const element = <h1 className="prop-class">Hello World<h1>
```

Compiles to:

```js
import { jsx as _jsx } from "react/jsx-runtime";

const element = _jsx("h1", {
    className: "prop-class",
    children: "Hello World",
});
```

As seen above, these elements needs to be exported in a file called : `jsx-runtime.js` .

## JSX to JS object

The `jsx` function takes up to 3 arguments:

```js
function jsx(tag, config)
```

-   tag: a string that represents an HTML tag: "div", "h1"
-   config: an object. This parameter will be separated into `props` and `children`

## Shared Internals

React exports its internals as an object so that other libraries using React can push datas into that object:

Example: React's Dispatcher for Hooks:

```js
// react/src/SharedInternals.js
const ReactSharedInternals = {
  H: null,
  ...
};

export default ReactSharedInternals;
```

```js
// react-dom (react-reconciler)
// The shared package serves as a bridge
import ReactSharedInternals from "shared/ReactSharedInternals";

function pushDispatcher() {
    const prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = ContextOnlyDispatcher; // This is where React Hooks are defined
    if (prevDispatcher === null) {
        return ContextOnlyDispatcher;
    } else {
        return prevDispatcher;
    }
}
```

You can then reference hooks like this:

```jsx
import { useState } from "react";
```

## Rendering process

For this part, I mainly used [Pomber's "Build your own React"](https://pomb.us/build-your-own-react/)
