import SharedInternals from "my-own-react/src/SharedInternals";
import { TEXT_TYPE } from "shared/Symbols";

let nextUnitOfWork = null;
let currentRoot = null;
let WorkInProgressRoot = null;
let deletions = null;

function createDom(fiber) {
    const dom =
        fiber.type == TEXT_TYPE
            ? document.createTextNode("")
            : document.createElement(fiber.type);

    updateDom(dom, {}, fiber.props);

    return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
    if (!prevProps || !nextProps) return;
    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            (key) => !(key in nextProps) || isNew(prevProps, nextProps)(key)
        )
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name]);
        });

    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = "";
        });

    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = nextProps[name];
        });

    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });
}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(WorkInProgressRoot.child);
    currentRoot = WorkInProgressRoot;
    WorkInProgressRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && WorkInProgressRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

export function render(element, container) {
    pushDispatcher(DOMDispatcher);
    WorkInProgressRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = WorkInProgressRoot;
}

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

const translateChildren = (child) => {
    switch (typeof child) {
        case "undefined":
        case "bigint":
        case "boolean":
        case "number":
        case "string":
            return {
                type: TEXT_TYPE,
                props: {
                    children: [],
                    nodeValue: child,
                },
            };
        case "object":
            // TODO: Handle objects
            return child;
    }
};

function wrapInArray(children) {
    if (children === null || children === undefined) return [];
    if (!Array.isArray(children)) return [children];
    return children.flat();
}

function updateFunctionComponent(fiber) {
    WorkInProgress = fiber;
    hookIndex = 0;
    WorkInProgress.hooks = [];
    const children = wrapInArray(fiber.type(fiber.props)).map(
        translateChildren
    );
    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) fiber.dom = createDom(fiber);

    reconcileChildren(
        fiber,
        wrapInArray(fiber.props?.children).map(translateChildren)
    );
}

function reconcileChildren(WorkInProgress, children) {
    if (!children === null || children === undefined) children = [];

    let index = 0;
    let oldFiber = WorkInProgress.alternate && WorkInProgress.alternate.child;
    let prevSibling = null;

    while (index < children.length || oldFiber != null) {
        const element = children[index];
        let newFiber = null;

        const sameType = oldFiber && element && element.type == oldFiber.type;

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: WorkInProgress,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }

        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: WorkInProgress,
                alternate: null,
                effectTag: "PLACEMENT",
            };
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            WorkInProgress.child = newFiber;
        } else if (element) {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}

let WorkInProgress = null;
let hookIndex = null;

function useState(initial) {
    const indexCopy = hookIndex;
    const oldHook =
        WorkInProgress.alternate &&
        WorkInProgress.alternate.hooks &&
        WorkInProgress.alternate.hooks[indexCopy];

    const hook = { state: oldHook ? oldHook.state : initial };

    const setState = (action) => {
        hook.state = action instanceof Function ? action(hook.state) : action;
        WorkInProgress.hooks[indexCopy] = hook;

        WorkInProgressRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        nextUnitOfWork = WorkInProgressRoot;
        deletions = [];
    };

    WorkInProgress.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}

function useReducer(reducer, initialState) {
    const [state, setState] = useState(initialState);

    function dispatch(action) {
        const nextState = reducer(state, action);
        setState(nextState);
    }

    return [state, dispatch];
}

const DOMDispatcher = {
    useState,
    useReducer,
};

function pushDispatcher(dispatcher) {
    SharedInternals.H = dispatcher;
}
