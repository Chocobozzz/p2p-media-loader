import { HlsWithP2PInstance, HlsWithP2PConfig } from "./engine.js";
export declare function injectMixin<HlsJsConstructor extends new (...args: any[]) => any>(HlsJsClass: HlsJsConstructor): new (config?: HlsWithP2PConfig<HlsJsConstructor>) => HlsWithP2PInstance<InstanceType<HlsJsConstructor>>;
