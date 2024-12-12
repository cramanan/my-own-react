export const ELEMENT_TYPE = Symbol.for("my-own-react.element");

function hasValidKey(config) {
    return config.key !== undefined;
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

    return {
        // This tag allows us to uniquely identify this as a my-own-react Element
        $$typeof: ELEMENT_TYPE,

        // Built-in properties that belong on the element
        type,
        key,
        props,
    };
}
