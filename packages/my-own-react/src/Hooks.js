import SharedInternals from "shared/SharedInternals";

function resolveDispatcher() {
    const dispatcher = SharedInternals.H;
    if (dispatcher === null) {
        console.error("Invalid hook call.");
    }

    // Will result in a null access error if accessed outside render phase. We
    // intentionally don't throw our own error because this is in a hot path.
    // Also helps ensure this is inlined.
    return dispatcher;
}

function useState(initial) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initial);
}

function useReducer(reducer, initial) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initial);
}

export { useState, useReducer };
