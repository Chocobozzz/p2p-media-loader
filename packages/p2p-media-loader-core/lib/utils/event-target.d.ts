export declare class EventTarget<EventTypesMap extends Record<string, (a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) => unknown>> {
    private events;
    dispatchEvent<K extends keyof EventTypesMap>(eventName: K, ...args: Parameters<EventTypesMap[K]>): void;
    getEventDispatcher<K extends keyof EventTypesMap>(eventName: K): (...args: Parameters<EventTypesMap[K]>) => void;
    addEventListener<K extends keyof EventTypesMap>(eventName: K, listener: EventTypesMap[K]): void;
    removeEventListener<K extends keyof EventTypesMap>(eventName: K, listener: EventTypesMap[K]): void;
    clear(): void;
}
