import { ELEMENT_TYPE, FRAGMENT_TYPE } from "shared/Symbols";

function hasValidKey(config) {
    return config.key !== undefined;
}

function ReactElement(type, key, props) {
    // Ignore whatever was passed as the ref argument and treat `props.ref` as
    // the source of truth. The only thing we use this for is `element.ref`,
    // which will log a deprecation warning on access. In the next release, we
    // can remove `element.ref` as well as the `ref` argument.
    const refProp = props.ref;

    // An undefined `element.ref` is coerced to `null` for
    // backwards compatibility.
    const ref = refProp !== undefined ? refProp : null;

    return {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: ELEMENT_TYPE,

        // Built-in properties that belong on the element
        type,
        key,
        ref,

        props,
    };
}

export function createElement(type, config, ...children) {
    let propName;

    // Reserved names are extracted
    const props = {};

    let key = null;

    if (config != null) {
        if (hasValidKey(config)) {
            key = "" + config.key;
        }
    }

    // Assign props from config
    for (const propName in config) {
        if (
            Object.prototype.hasOwnProperty.call(config, propName) &&
            // Skip over reserved prop name
            propName !== "key"
        ) {
            props[propName] = config[propName];
        }
    }

    // React:
    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    //
    // my-own-react:
    // children is a rest parameter so we use the local variable arguments
    // and remove 2 (type, config) to allocate an array
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else {
        // Allocate an Array
        const childArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }

        props.children = childArray;
    }

    console.log(propName.children);

    return ReactElement(type, key, props);
}

// cramanan: It seems that React use maybeKey to handle a key property problem that I don't understand yet.
export function jsx(type, config, maybeKey) {
    let key = null;

    // React:
    // Currently, key can be spread in as a prop. This causes a potential
    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
    // but as an intermediary step, we will use jsxDEV for everything except
    // <div {...props} key="Hi" />, because we aren't currently able to tell if
    // key is explicitly declared to be undefined or not.
    if (maybeKey !== undefined) {
        key = "" + maybeKey;
    }

    if (hasValidKey(config)) {
        key = "" + config.key;
    }

    let props;
    if (!("key" in config)) {
        // React:
        // If key was not spread in, we can reuse the original props object. This
        // only works for `jsx`, not `createElement`, because `jsx` is a compiler
        // target and the compiler always passes a new object. For `createElement`,
        // we can't assume a new object is passed every time because it can be
        // called manually.
        //
        // Spreading key is a warning in dev. In a future release, we will not
        // remove a spread key from the props object. (But we'll still warn.) We'll
        // always pass the object straight through.
        props = config;
    } else {
        // React:
        // We need to remove reserved props (key, prop, ref). Create a fresh props
        // object and copy over all the non-reserved props. We don't use `delete`
        // because in V8 it will deopt the object to dictionary mode.
        props = {};
        for (const propName in config) {
            // Skip over reserved prop names
            if (propName !== "key") {
                props[propName] = config[propName];
            }
        }
    }

    return ReactElement(type, key, props);
}
