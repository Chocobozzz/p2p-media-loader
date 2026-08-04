export class EventTarget {
    constructor() {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    dispatchEvent(eventName, a1, a2, a3, a4, a5) {
        const listeners = this.events.get(eventName);
        if (!listeners)
            return;
        for (const listener of listeners) {
            try {
                listener(a1, a2, a3, a4, a5);
            }
            catch (_a) {
                // Swallow user-land errors to protect internal invariants
            }
        }
    }
    getEventDispatcher(eventName) {
        return (a1, a2, a3, a4, a5) => {
            const listeners = this.events.get(eventName);
            if (!listeners)
                return;
            for (const listener of listeners) {
                try {
                    listener(a1, a2, a3, a4, a5);
                }
                catch (_a) {
                    // Swallow user-land errors to protect internal invariants
                }
            }
        };
    }
    addEventListener(eventName, listener) {
        const listeners = this.events.get(eventName);
        if (!listeners) {
            this.events.set(eventName, [listener]);
        }
        else {
            // Copy-on-write: we MUST create a new array here instead of mutating (e.g. push()).
            // dispatchEvent/getEventDispatcher iterate the array directly (no snapshot copy)
            // for zero-allocation dispatch. Creating a new array ensures any in-progress
            // iteration sees a stable reference and is not affected by concurrent additions.
            this.events.set(eventName, [...listeners, listener]);
        }
    }
    removeEventListener(eventName, listener) {
        const listeners = this.events.get(eventName);
        if (!listeners)
            return;
        const index = listeners.indexOf(listener);
        if (index === -1)
            return;
        if (listeners.length === 1) {
            this.events.delete(eventName);
            return;
        }
        // Copy-on-write: manually slice and splice to avoid closure allocation
        // and maintain stable references for in-progress iterations.
        const newListeners = listeners.slice();
        newListeners.splice(index, 1);
        this.events.set(eventName, newListeners);
    }
    clear() {
        this.events.clear();
    }
}
//# sourceMappingURL=event-target.js.map