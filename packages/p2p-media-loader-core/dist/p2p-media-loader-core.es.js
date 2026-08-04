//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region src/types.ts
/**
* Base class for all errors and warnings emitted by the library, carrying a
* machine-readable `type` discriminator. Use `instanceof TypedError` to catch
* any library error regardless of its specific class.
*/
var TypedError = class extends Error {
	type;
	cause;
	constructor(type, message, cause) {
		super(message);
		this.type = type;
		this.cause = cause;
	}
};
/** Represents an error that occurred during a peer connection. */
var PeerError = class extends TypedError {
	name = "PeerError";
};
/** Represents a warning that occurred during a peer connection. */
var PeerWarning = class extends TypedError {
	name = "PeerWarning";
};
/** Represents an error that occurred during a tracker request. */
var TrackerError = class extends TypedError {
	name = "TrackerError";
};
/** Represents a warning that occurred during a tracker request. */
var TrackerWarning = class extends TypedError {
	name = "TrackerWarning";
};
/** Represents an error that occurred while establishing a peer connection. */
var PeerConnectError = class extends TypedError {
	name = "PeerConnectError";
};
/**
* Represents an error that can occur during the request process, with a timestamp for when the error occurred.
* @template T - The specific type of request error.
*/
var RequestError = class extends TypedError {
	name = "RequestError";
	/** Error timestamp. */
	timestamp;
	/**
	* Constructs a new RequestError.
	* @param type - The specific error type.
	* @param message - Optional message describing the error.
	* @param cause - Optional underlying cause of the error.
	*/
	constructor(type, message, cause) {
		super(type, message, cause);
		this.timestamp = performance.now();
	}
};
/** Custom error class for errors that occur during core network requests. */
var CoreRequestError = class extends TypedError {
	name = "CoreRequestError";
};
//#endregion
//#region src/utils/abort-controller.ts
var AbortSignalPolyfill = class {
	aborted = false;
	#listeners = /* @__PURE__ */ new Set();
	addEventListener(_type, listener) {
		this.#listeners.add(listener);
	}
	removeEventListener(_type, listener) {
		this.#listeners.delete(listener);
	}
	dispatchEvent(_type) {
		this.aborted = true;
		for (const listener of this.#listeners) try {
			listener();
		} catch {}
		this.#listeners.clear();
	}
};
var AbortControllerPolyfill = class {
	signal = new AbortSignalPolyfill();
	abort() {
		this.signal.dispatchEvent("abort");
	}
};
var isAbortControllerSupported = typeof AbortController !== "undefined";
var SafeAbortController = isAbortControllerSupported ? AbortController : AbortControllerPolyfill;
//#endregion
//#region src/http-loader.ts
var HttpRequestExecutor = class {
	request;
	httpConfig;
	abortController = new SafeAbortController();
	expectedBytesLength;
	requestByteRange;
	onChunkDownloaded;
	isAborted() {
		return this.abortController.signal.aborted;
	}
	constructor(request, httpConfig, eventTarget) {
		this.request = request;
		this.httpConfig = httpConfig;
		this.onChunkDownloaded = eventTarget.getEventDispatcher("onChunkDownloaded");
		const { byteRange } = this.request.segment;
		if (byteRange) this.requestByteRange = { ...byteRange };
	}
	execute() {
		const startControls = {
			onAbort: () => this.abortController.abort(),
			notReceivingBytesTimeoutMs: this.httpConfig.httpNotReceivingBytesTimeoutMs
		};
		if (this.request.tryCompleteByLoadedBytes({ downloadSource: "http" }, startControls, this.httpConfig.validateHTTPSegment, "http-segment-validation-failed")) return;
		if (this.request.loadedBytes !== 0) {
			this.requestByteRange = this.requestByteRange ?? { start: 0 };
			this.requestByteRange.start = this.requestByteRange.start + this.request.loadedBytes;
		}
		if (this.request.totalBytes) this.expectedBytesLength = this.request.totalBytes - this.request.loadedBytes;
		const requestControls = this.request.start({ downloadSource: "http" }, startControls);
		this.fetch(requestControls);
	}
	async fetch(requestControls) {
		const { segment } = this.request;
		let activeReader;
		if (this.isAborted()) return;
		const onAbort = () => {
			try {
				activeReader?.cancel().catch(() => {});
			} catch {}
		};
		this.abortController.signal.addEventListener("abort", onAbort);
		const abortSignal = isAbortControllerSupported ? this.abortController.signal : void 0;
		try {
			let request = await this.httpConfig.httpRequestSetup?.(segment.url, segment.byteRange, abortSignal, this.requestByteRange);
			if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
			if (!request) {
				const headers = new Headers();
				if (this.requestByteRange) headers.set("Range", `bytes=${this.requestByteRange.start}-${this.requestByteRange.end ?? ""}`);
				const requestOptions = { headers };
				if (abortSignal) requestOptions.signal = abortSignal;
				request = new Request(segment.url, requestOptions);
			}
			if (this.isAborted()) throw new DOMException("Request aborted before request fetch", "AbortError");
			const response = await window.fetch(request);
			if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
			this.handleResponseHeaders(response);
			requestControls.firstBytesReceived();
			if (!response.body || typeof response.body.getReader !== "function") {
				const arrayBuffer = await response.arrayBuffer();
				if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
				const value = new Uint8Array(arrayBuffer);
				requestControls.addLoadedChunk(value);
				this.onChunkDownloaded(value.byteLength, "http", void 0, segment.stream.type, this.request.infoHash);
			} else {
				const reader = response.body.getReader();
				activeReader = reader;
				for (;;) {
					if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
					const { done, value } = await reader.read();
					if (done) break;
					if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
					requestControls.addLoadedChunk(value);
					this.onChunkDownloaded(value.byteLength, "http", void 0, segment.stream.type, this.request.infoHash);
				}
			}
			if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
			if (this.request.totalBytes !== void 0 && this.request.loadedBytes !== this.request.totalBytes) throw new RequestError("http-bytes-mismatch", `HTTP response truncated: received ${this.request.loadedBytes} of ${this.request.totalBytes} bytes`);
			const isValid = await this.request.validateData(this.httpConfig.validateHTTPSegment);
			if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
			if (!isValid) {
				this.request.clearLoadedBytes();
				throw new RequestError("http-segment-validation-failed");
			}
			requestControls.completeOnSuccess();
		} catch (error) {
			this.handleError(error, requestControls);
		} finally {
			this.abortController.signal.removeEventListener("abort", onAbort);
		}
	}
	handleResponseHeaders(response) {
		if (!response.ok) if (response.status === 406 || response.status === 416) {
			this.request.clearLoadedBytes();
			throw new RequestError("http-bytes-mismatch", response.statusText);
		} else throw new RequestError("http-error", response.statusText);
		const { requestByteRange } = this;
		if (requestByteRange) if (response.status === 200) if (this.request.segment.byteRange) throw new RequestError("http-unexpected-status-code");
		else this.request.clearLoadedBytes();
		else {
			if (response.status !== 206) throw new RequestError("http-unexpected-status-code", response.statusText);
			const contentLengthHeader = response.headers.get("Content-Length");
			if (contentLengthHeader && this.expectedBytesLength !== void 0 && this.expectedBytesLength !== +contentLengthHeader) {
				this.request.clearLoadedBytes();
				throw new RequestError("http-bytes-mismatch", response.statusText);
			}
			const contentRangeHeader = response.headers.get("Content-Range");
			const contentRange = contentRangeHeader ? parseContentRangeHeader(contentRangeHeader) : void 0;
			if (contentRange) {
				const { from, to } = contentRange;
				const responseExpectedBytesLength = to !== void 0 && from !== void 0 ? to - from + 1 : void 0;
				if (responseExpectedBytesLength !== void 0 && this.expectedBytesLength !== responseExpectedBytesLength || from !== void 0 && requestByteRange.start !== from || to !== void 0 && requestByteRange.end !== void 0 && requestByteRange.end !== to) {
					this.request.clearLoadedBytes();
					throw new RequestError("http-bytes-mismatch", response.statusText);
				}
			}
		}
		if (response.status === 200 && this.request.totalBytes === void 0) {
			const contentLengthHeader = response.headers.get("Content-Length");
			if (contentLengthHeader) this.request.setTotalBytes(+contentLengthHeader);
		}
	}
	handleError(error, requestControls) {
		if (this.isAborted()) return;
		if (error instanceof Error) {
			const httpLoaderError = error instanceof RequestError ? error : new RequestError("http-error", error.message);
			requestControls.failWithError(httpLoaderError);
		}
	}
};
var rangeHeaderRegex = /^bytes (?:(?:(\d+)|)-(?:(\d+)|)|\*)\/(?:(\d+)|\*)$/;
function parseContentRangeHeader(headerValue) {
	const match = rangeHeaderRegex.exec(headerValue.trim());
	if (!match) return;
	const [, from, to, total] = match;
	return {
		from: from ? parseInt(from) : void 0,
		to: to ? parseInt(to) : void 0,
		total: total ? parseInt(total) : void 0
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js
var require_ms = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Helpers.
	*/
	var s = 1e3;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	/**
	* Parse or format the given `val`.
	*
	* Options:
	*
	*  - `long` verbose formatting [false]
	*
	* @param {String|Number} val
	* @param {Object} [options]
	* @throws {Error} throw an error if val is not a non-empty string or a number
	* @return {String|Number}
	* @api public
	*/
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === "string" && val.length > 0) return parse(val);
		else if (type === "number" && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
		throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
	};
	/**
	* Parse the given `str` and return milliseconds.
	*
	* @param {String} str
	* @return {Number}
	* @api private
	*/
	function parse(str) {
		str = String(str);
		if (str.length > 100) return;
		var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
		if (!match) return;
		var n = parseFloat(match[1]);
		switch ((match[2] || "ms").toLowerCase()) {
			case "years":
			case "year":
			case "yrs":
			case "yr":
			case "y": return n * y;
			case "weeks":
			case "week":
			case "w": return n * w;
			case "days":
			case "day":
			case "d": return n * d;
			case "hours":
			case "hour":
			case "hrs":
			case "hr":
			case "h": return n * h;
			case "minutes":
			case "minute":
			case "mins":
			case "min":
			case "m": return n * m;
			case "seconds":
			case "second":
			case "secs":
			case "sec":
			case "s": return n * s;
			case "milliseconds":
			case "millisecond":
			case "msecs":
			case "msec":
			case "ms": return n;
			default: return;
		}
	}
	/**
	* Short format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtShort(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + "d";
		if (msAbs >= h) return Math.round(ms / h) + "h";
		if (msAbs >= m) return Math.round(ms / m) + "m";
		if (msAbs >= s) return Math.round(ms / s) + "s";
		return ms + "ms";
	}
	/**
	* Long format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtLong(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return plural(ms, msAbs, d, "day");
		if (msAbs >= h) return plural(ms, msAbs, h, "hour");
		if (msAbs >= m) return plural(ms, msAbs, m, "minute");
		if (msAbs >= s) return plural(ms, msAbs, s, "second");
		return ms + " ms";
	}
	/**
	* Pluralization helper.
	*/
	function plural(ms, msAbs, n, name) {
		var isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
	}
}));
//#endregion
//#region ../../node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the common logic for both the Node.js and web browser
	* implementations of `debug()`.
	*/
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = require_ms();
		createDebug.destroy = destroy;
		Object.keys(env).forEach((key) => {
			createDebug[key] = env[key];
		});
		/**
		* The currently active debug mode names, and names to skip.
		*/
		createDebug.names = [];
		createDebug.skips = [];
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
			for (let i = 0; i < namespace.length; i++) {
				hash = (hash << 5) - hash + namespace.charCodeAt(i);
				hash |= 0;
			}
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
			function debug(...args) {
				if (!debug.enabled) return;
				const self = debug;
				const curr = Number(/* @__PURE__ */ new Date());
				self.diff = curr - (prevTime || curr);
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
				args[0] = createDebug.coerce(args[0]);
				if (typeof args[0] !== "string") args.unshift("%O");
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					if (match === "%%") return "%";
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === "function") {
						const val = args[index];
						match = formatter.call(self, val);
						args.splice(index, 1);
						index--;
					}
					return match;
				});
				createDebug.formatArgs.call(self, args);
				(self.log || createDebug.log).apply(self, args);
			}
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy;
			Object.defineProperty(debug, "enabled", {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) return enableOverride;
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
					return enabledCache;
				},
				set: (v) => {
					enableOverride = v;
				}
			});
			if (typeof createDebug.init === "function") createDebug.init(debug);
			return debug;
		}
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
			createDebug.names = [];
			createDebug.skips = [];
			const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
			for (const ns of split) if (ns[0] === "-") createDebug.skips.push(ns.slice(1));
			else createDebug.names.push(ns);
		}
		/**
		* Checks if the given string matches a namespace template, honoring
		* asterisks as wildcards.
		*
		* @param {String} search
		* @param {String} template
		* @return {Boolean}
		*/
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;
			while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) if (template[templateIndex] === "*") {
				starIndex = templateIndex;
				matchIndex = searchIndex;
				templateIndex++;
			} else {
				searchIndex++;
				templateIndex++;
			}
			else if (starIndex !== -1) {
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else return false;
			while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
			return templateIndex === template.length;
		}
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [...createDebug.names, ...createDebug.skips.map((namespace) => "-" + namespace)].join(",");
			createDebug.enable("");
			return namespaces;
		}
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) if (matchesTemplate(name, skip)) return false;
			for (const ns of createDebug.names) if (matchesTemplate(name, ns)) return true;
			return false;
		}
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) return val.stack || val.message;
			return val;
		}
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
		}
		createDebug.enable(createDebug.load());
		return createDebug;
	}
	module.exports = setup;
}));
//#endregion
//#region src/p2p/commands/types.ts
var import_browser = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the web browser implementation of `debug()`.
	*/
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
		return () => {
			if (!warned) {
				warned = true;
				console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
			}
		};
	})();
	/**
	* Colors.
	*/
	exports.colors = [
		"#0000CC",
		"#0000FF",
		"#0033CC",
		"#0033FF",
		"#0066CC",
		"#0066FF",
		"#0099CC",
		"#0099FF",
		"#00CC00",
		"#00CC33",
		"#00CC66",
		"#00CC99",
		"#00CCCC",
		"#00CCFF",
		"#3300CC",
		"#3300FF",
		"#3333CC",
		"#3333FF",
		"#3366CC",
		"#3366FF",
		"#3399CC",
		"#3399FF",
		"#33CC00",
		"#33CC33",
		"#33CC66",
		"#33CC99",
		"#33CCCC",
		"#33CCFF",
		"#6600CC",
		"#6600FF",
		"#6633CC",
		"#6633FF",
		"#66CC00",
		"#66CC33",
		"#9900CC",
		"#9900FF",
		"#9933CC",
		"#9933FF",
		"#99CC00",
		"#99CC33",
		"#CC0000",
		"#CC0033",
		"#CC0066",
		"#CC0099",
		"#CC00CC",
		"#CC00FF",
		"#CC3300",
		"#CC3333",
		"#CC3366",
		"#CC3399",
		"#CC33CC",
		"#CC33FF",
		"#CC6600",
		"#CC6633",
		"#CC9900",
		"#CC9933",
		"#CCCC00",
		"#CCCC33",
		"#FF0000",
		"#FF0033",
		"#FF0066",
		"#FF0099",
		"#FF00CC",
		"#FF00FF",
		"#FF3300",
		"#FF3333",
		"#FF3366",
		"#FF3399",
		"#FF33CC",
		"#FF33FF",
		"#FF6600",
		"#FF6633",
		"#FF9900",
		"#FF9933",
		"#FFCC00",
		"#FFCC33"
	];
	/**
	* Currently only WebKit-based Web Inspectors, Firefox >= v31,
	* and the Firebug extension (any Firefox version) are known
	* to support "%c" CSS customizations.
	*
	* TODO: add a `localStorage` variable to explicitly enable/disable colors
	*/
	function useColors() {
		if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return true;
		if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
		let m;
		return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	}
	/**
	* Colorize log arguments if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
		if (!this.useColors) return;
		const c = "color: " + this.color;
		args.splice(1, 0, c, "color: inherit");
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, (match) => {
			if (match === "%%") return;
			index++;
			if (match === "%c") lastC = index;
		});
		args.splice(lastC, 0, c);
	}
	/**
	* Invokes `console.debug()` when available.
	* No-op when `console.debug` is not a "function".
	* If `console.debug` is not available, falls back
	* to `console.log`.
	*
	* @api public
	*/
	exports.log = console.debug || console.log || (() => {});
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		try {
			if (namespaces) exports.storage.setItem("debug", namespaces);
			else exports.storage.removeItem("debug");
		} catch (error) {}
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		let r;
		try {
			r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
		} catch (error) {}
		if (!r && typeof process !== "undefined" && "env" in process) r = process.env.DEBUG;
		return r;
	}
	/**
	* Localstorage attempts to return the localstorage.
	*
	* This is necessary because safari throws
	* when a user disables cookies/localstorage
	* and you attempt to access it.
	*
	* @return {LocalStorage}
	* @api private
	*/
	function localstorage() {
		try {
			return localStorage;
		} catch (error) {}
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	*/
	formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return "[UnexpectedJSONParseError]: " + error.message;
		}
	};
})))(), 1);
var PeerCommandType$1 = /* @__PURE__ */ function(PeerCommandType) {
	PeerCommandType[PeerCommandType["SegmentsAnnouncement"] = 0] = "SegmentsAnnouncement";
	PeerCommandType[PeerCommandType["SegmentRequest"] = 1] = "SegmentRequest";
	PeerCommandType[PeerCommandType["SegmentData"] = 2] = "SegmentData";
	PeerCommandType[PeerCommandType["SegmentDataSendingCompleted"] = 3] = "SegmentDataSendingCompleted";
	PeerCommandType[PeerCommandType["SegmentAbsent"] = 4] = "SegmentAbsent";
	PeerCommandType[PeerCommandType["CancelSegmentRequest"] = 5] = "CancelSegmentRequest";
	return PeerCommandType;
}({});
//#endregion
//#region src/utils/utils.ts
function getPromiseWithResolvers() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
function queueMicrotask(fn) {
	Promise.resolve().then(fn);
}
function joinChunks(chunks, totalBytes) {
	totalBytes ??= chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
	const buffer = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		buffer.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return buffer;
}
function getRandomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}
function getWeightedRandomItem(items, weightAccessor) {
	if (items.length === 0) throw new Error("Cannot get item from empty array");
	if (items.length === 1) return items[0];
	let totalWeight = 0;
	const weights = items.map((item) => {
		const weight = weightAccessor(item);
		totalWeight += weight;
		return weight;
	});
	let randomWeight = Math.random() * totalWeight;
	for (let i = 0; i < items.length; i++) {
		randomWeight -= weights[i];
		if (randomWeight <= 0) return items[i];
	}
	return items[items.length - 1];
}
function utf8ToUintArray(utf8String) {
	return new TextEncoder().encode(utf8String);
}
function* arrayBackwards(arr) {
	for (let i = arr.length - 1; i >= 0; i--) yield arr[i];
}
function isObject(item) {
	return !!item && typeof item === "object" && !Array.isArray(item);
}
function isArray(item) {
	return Array.isArray(item);
}
function filterUndefinedProps(obj) {
	function filter(obj) {
		if (isObject(obj)) {
			const result = {};
			Object.keys(obj).forEach((key) => {
				if (obj[key] !== void 0) {
					const value = filter(obj[key]);
					if (value !== void 0) result[key] = value;
				}
			});
			return result;
		} else return obj;
	}
	return filter(obj);
}
function deepCopy(item) {
	if (isArray(item)) return item.map((element) => deepCopy(element));
	else if (isObject(item)) {
		const copy = {};
		for (const key of Object.keys(item)) copy[key] = deepCopy(item[key]);
		return copy;
	} else return item;
}
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
function overrideConfig(target, updates, defaults = {}) {
	if (typeof target !== "object" || target === null || typeof updates !== "object" || updates === null) return target;
	Object.keys(updates).forEach((key) => {
		const keyStr = typeof key === "symbol" ? key.toString() : String(key);
		if (key === "__proto__" || key === "constructor" || key === "prototype") throw new Error(`Attempt to modify restricted property '${keyStr}'`);
		const updateValue = updates[key];
		const defaultValue = defaults[key];
		if (key in target) if (updateValue === void 0) target[key] = defaultValue === void 0 ? void 0 : defaultValue;
		else target[key] = updateValue;
	});
	return target;
}
function mergeAndFilterConfig(options) {
	const { defaultConfig, baseConfig = {}, specificStreamConfig = {} } = options;
	const mergedConfig = deepCopy({
		...defaultConfig,
		...baseConfig,
		...specificStreamConfig
	});
	const keysOfT = Object.keys(defaultConfig);
	const filteredConfig = {};
	keysOfT.forEach((key) => {
		if (key in mergedConfig) filteredConfig[key] = mergedConfig[key];
	});
	return filteredConfig;
}
//#endregion
//#region src/p2p/commands/binary-serialization.ts
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf8");
var SerializedItem = /* @__PURE__ */ function(SerializedItem) {
	SerializedItem[SerializedItem["Min"] = -1] = "Min";
	SerializedItem[SerializedItem["Int"] = 0] = "Int";
	SerializedItem[SerializedItem["SimilarIntArray"] = 1] = "SimilarIntArray";
	SerializedItem[SerializedItem["String"] = 2] = "String";
	SerializedItem[SerializedItem["Max"] = 3] = "Max";
	return SerializedItem;
}({});
function getRequiredBytesForInt(num) {
	if (num === 0) return 1;
	const necessaryBits = Math.floor(Math.log2(Math.abs(num))) + 2;
	return Math.ceil(necessaryBits / 8);
}
function intToBytes(num) {
	const isNegative = num < 0;
	const bytesAmountNumber = getRequiredBytesForInt(num);
	const bytes = new Uint8Array(bytesAmountNumber);
	num = Math.abs(num);
	for (let i = 0; i < bytesAmountNumber; i++) {
		const shift = 8 * (bytesAmountNumber - 1 - i);
		bytes[i] = Math.floor(num / Math.pow(2, shift)) & 255;
	}
	if (isNegative) bytes[0] = bytes[0] | 128;
	return bytes;
}
function bytesToInt(bytes) {
	const byteLength = bytes.length;
	const getNumberPart = (byte, i) => {
		const shift = 8 * (byteLength - 1 - i);
		return byte * Math.pow(2, shift);
	};
	let number = getNumberPart(bytes[0] & 127, 0);
	for (let i = 1; i < byteLength; i++) number += getNumberPart(bytes[i], i);
	if ((bytes[0] & 128) >> 7 !== 0) number = -number;
	return number;
}
function serializeInt(num) {
	const numBytes = intToBytes(num);
	const numberMetadata = 0 | numBytes.length;
	return new Uint8Array([numberMetadata, ...numBytes]);
}
function deserializeInt(bytes) {
	if (bytes.length === 0) throw new Error("Buffer is too short");
	const metadata = bytes[0];
	if (metadata >> 4 !== 0) throw new Error("Trying to deserialize integer with invalid serialized item code");
	const numberBytesLength = metadata & 15;
	if (numberBytesLength === 0) throw new Error("Invalid integer: zero byte length");
	if (numberBytesLength > 7) throw new Error("Invalid integer: byte length exceeds safe integer limit");
	const start = 1;
	const end = start + numberBytesLength;
	if (bytes.length < end) throw new Error("Buffer is too short");
	return {
		number: bytesToInt(bytes.subarray(start, end)),
		byteLength: numberBytesLength + 1
	};
}
function serializeUniqueSimilarIntArray(numbers) {
	const commonPartNumbersMap = /* @__PURE__ */ new Map();
	for (const number of numbers) {
		const diffByte = number & 255;
		const common = number - diffByte;
		const bytes = commonPartNumbersMap.get(common) ?? new ResizableUint8Array();
		if (!bytes.length) commonPartNumbersMap.set(common, bytes);
		bytes.push(diffByte);
	}
	const result = new ResizableUint8Array();
	result.push([16, commonPartNumbersMap.size]);
	for (const [commonPart, binaryArray] of commonPartNumbersMap) {
		const { length } = binaryArray;
		const commonPartWithLength = commonPart + (length & 255);
		binaryArray.unshift(serializeInt(commonPartWithLength));
		result.push(binaryArray.getBuffer());
	}
	return result.getBuffer();
}
function deserializeUniqueSimilarIntArray(bytes) {
	if (bytes.length < 2) throw new Error("Buffer is too short");
	const [codeByte, commonPartArraysAmount] = bytes;
	if (codeByte >> 4 !== 1) throw new Error("Trying to deserialize similar int array with invalid serialized item code");
	let offset = 2;
	const originalIntArr = [];
	for (let i = 0; i < commonPartArraysAmount; i++) {
		const { number: commonPartWithLength, byteLength } = deserializeInt(bytes.subarray(offset));
		offset += byteLength;
		const arrayLength = commonPartWithLength & 255;
		const actualLength = arrayLength === 0 ? 256 : arrayLength;
		const commonPart = commonPartWithLength - arrayLength;
		if (offset + actualLength > bytes.length) throw new Error("Malformed similar int array: buffer too short");
		for (let j = 0; j < actualLength; j++) {
			const diffPart = bytes[offset];
			originalIntArr.push(commonPart + diffPart);
			offset++;
		}
	}
	return {
		numbers: originalIntArr,
		byteLength: offset
	};
}
function serializeString(string) {
	const encoded = textEncoder.encode(string);
	const { length } = encoded;
	if (length > 4095) throw new Error("String exceeds maximum length of 4095 bytes");
	const bytes = new ResizableUint8Array();
	bytes.push([32 | length >> 8 & 15, length & 255]);
	bytes.push(encoded);
	return bytes.getBuffer();
}
function deserializeString(bytes) {
	if (bytes.length < 2) throw new Error("Buffer is too short");
	const [codeByte, lengthByte] = bytes;
	if (codeByte >> 4 !== 2) throw new Error("Trying to deserialize bytes (sting) with invalid serialized item code.");
	const length = (codeByte & 15) << 8 | lengthByte;
	if (bytes.length < length + 2) throw new Error("Malformed string: buffer too short");
	const stringBytes = bytes.subarray(2, length + 2);
	return {
		string: textDecoder.decode(stringBytes),
		byteLength: length + 2
	};
}
var ResizableUint8Array = class {
	#bytes = [];
	#length = 0;
	push(bytes) {
		this.#addBytes(bytes, "end");
	}
	unshift(bytes) {
		this.#addBytes(bytes, "start");
	}
	#addBytes(bytes, position) {
		let bytesToAdd;
		if (bytes instanceof Uint8Array) bytesToAdd = bytes;
		else if (Array.isArray(bytes)) bytesToAdd = new Uint8Array(bytes);
		else bytesToAdd = new Uint8Array([bytes]);
		this.#length += bytesToAdd.length;
		this.#bytes[position === "start" ? "unshift" : "push"](bytesToAdd);
	}
	getBytesChunks() {
		return this.#bytes;
	}
	getBuffer() {
		return joinChunks(this.#bytes, this.#length);
	}
	get length() {
		return this.#length;
	}
};
//#endregion
//#region src/p2p/commands/binary-command-creator.ts
var FRAME_PART_LENGTH = 4;
var commandFrameStart = stringToUtf8CodesBuffer("cstr", FRAME_PART_LENGTH);
var commandFrameEnd = stringToUtf8CodesBuffer("cend", FRAME_PART_LENGTH);
var commandDivFrameStart = stringToUtf8CodesBuffer("dstr", FRAME_PART_LENGTH);
var commandDivFrameEnd = stringToUtf8CodesBuffer("dend", FRAME_PART_LENGTH);
var startFrames = [commandFrameStart, commandDivFrameStart];
var endFrames = [commandFrameEnd, commandDivFrameEnd];
var commandFramesLength = commandFrameStart.length + commandFrameEnd.length;
function isCommandChunk(buffer) {
	if (buffer.length < commandFramesLength) return false;
	const { length } = commandFrameStart;
	const bufferEndingToCompare = buffer.subarray(-length);
	return startFrames.some((frame) => areBuffersEqual(buffer, frame, FRAME_PART_LENGTH)) && endFrames.some((frame) => areBuffersEqual(bufferEndingToCompare, frame, FRAME_PART_LENGTH));
}
function isFirstCommandChunk(buffer) {
	if (buffer.length < commandFramesLength) return false;
	return areBuffersEqual(buffer, commandFrameStart, FRAME_PART_LENGTH);
}
function isLastCommandChunk(buffer) {
	if (buffer.length < commandFramesLength) return false;
	return areBuffersEqual(buffer.subarray(-4), commandFrameEnd, FRAME_PART_LENGTH);
}
var BinaryCommandJoiningError = class extends Error {
	type;
	constructor(type) {
		super();
		this.type = type;
	}
};
var BinaryCommandChunksJoiner = class {
	#chunks = new ResizableUint8Array();
	#status = "joining";
	#onComplete;
	constructor(onComplete) {
		this.#onComplete = onComplete;
	}
	addCommandChunk(chunk) {
		if (this.#status === "completed") return;
		const isFirstChunk = isFirstCommandChunk(chunk);
		if (!this.#chunks.length && !isFirstChunk) throw new BinaryCommandJoiningError("no-first-chunk");
		if (this.#chunks.length && isFirstChunk) throw new BinaryCommandJoiningError("incomplete-joining");
		this.#chunks.push(this.#unframeCommandChunk(chunk));
		if (!isLastCommandChunk(chunk)) return;
		this.#status = "completed";
		this.#onComplete(this.#chunks.getBuffer());
	}
	#unframeCommandChunk(chunk) {
		if (chunk.length < commandFramesLength) throw new Error("Command chunk is too short to unframe");
		return chunk.subarray(FRAME_PART_LENGTH, chunk.length - FRAME_PART_LENGTH);
	}
};
var BinaryCommandCreator = class {
	#bytes = new ResizableUint8Array();
	#resultBuffers = [];
	#status = "creating";
	#maxChunkLength;
	constructor(commandType, maxChunkLength) {
		this.#maxChunkLength = maxChunkLength;
		this.#bytes.push(commandType);
	}
	addInteger(name, value) {
		this.#bytes.push(name.charCodeAt(0));
		const bytes = serializeInt(value);
		this.#bytes.push(bytes);
	}
	addUniqueSimilarIntArr(name, arr) {
		this.#bytes.push(name.charCodeAt(0));
		const bytes = serializeUniqueSimilarIntArray(arr);
		this.#bytes.push(bytes);
	}
	addString(name, string) {
		this.#bytes.push(name.charCodeAt(0));
		const bytes = serializeString(string);
		this.#bytes.push(bytes);
	}
	complete() {
		if (!this.#bytes.length) throw new Error("Buffer is empty");
		if (this.#status === "completed") return;
		this.#status = "completed";
		const unframedBuffer = this.#bytes.getBuffer();
		if (unframedBuffer.length + commandFramesLength <= this.#maxChunkLength) {
			this.#resultBuffers.push(frameBuffer(unframedBuffer, commandFrameStart, commandFrameEnd));
			return;
		}
		let chunksCount = Math.ceil(unframedBuffer.length / this.#maxChunkLength);
		if (Math.ceil(unframedBuffer.length / chunksCount) + commandFramesLength > this.#maxChunkLength) chunksCount++;
		for (const [i, chunk] of splitBufferToEqualChunks(unframedBuffer, chunksCount)) if (i === 0) this.#resultBuffers.push(frameBuffer(chunk, commandFrameStart, commandDivFrameEnd));
		else if (i === chunksCount - 1) this.#resultBuffers.push(frameBuffer(chunk, commandDivFrameStart, commandFrameEnd));
		else this.#resultBuffers.push(frameBuffer(chunk, commandDivFrameStart, commandDivFrameEnd));
	}
	getResultBuffers() {
		if (this.#status === "creating" || !this.#resultBuffers.length) throw new Error("Command is not complete.");
		return this.#resultBuffers;
	}
};
function deserializeCommand(bytes) {
	const [commandCode] = bytes;
	const deserializedCommand = { c: commandCode };
	let offset = 1;
	while (offset < bytes.length) {
		if (offset + 1 >= bytes.length) throw new Error("Malformed command buffer: truncated name/type header");
		const name = String.fromCharCode(bytes[offset]);
		offset++;
		switch (getDataTypeFromByte(bytes[offset])) {
			case SerializedItem.Int:
				{
					const { number, byteLength } = deserializeInt(bytes.subarray(offset));
					deserializedCommand[name] = number;
					offset += byteLength;
				}
				break;
			case SerializedItem.SimilarIntArray:
				{
					const { numbers, byteLength } = deserializeUniqueSimilarIntArray(bytes.subarray(offset));
					deserializedCommand[name] = numbers;
					offset += byteLength;
				}
				break;
			case SerializedItem.String:
				{
					const { string, byteLength } = deserializeString(bytes.subarray(offset));
					deserializedCommand[name] = string;
					offset += byteLength;
				}
				break;
		}
	}
	return validateCommand(deserializedCommand);
}
function getDataTypeFromByte(byte) {
	const typeCode = byte >> 4;
	if (typeCode <= SerializedItem.Min || typeCode >= SerializedItem.Max) throw new Error("Not existing type");
	return typeCode;
}
function stringToUtf8CodesBuffer(string, length) {
	if (length && string.length !== length) throw new Error("Wrong string length");
	const buffer = new Uint8Array(length ?? string.length);
	for (let i = 0; i < string.length; i++) buffer[i] = string.charCodeAt(i);
	return buffer;
}
function* splitBufferToEqualChunks(buffer, chunksCount) {
	const chunkLength = Math.ceil(buffer.length / chunksCount);
	for (let i = 0; i < chunksCount; i++) yield [i, buffer.subarray(i * chunkLength, (i + 1) * chunkLength)];
}
function frameBuffer(buffer, frameStart, frameEnd) {
	const result = new Uint8Array(buffer.length + frameStart.length + frameEnd.length);
	result.set(frameStart);
	result.set(buffer, frameStart.length);
	result.set(frameEnd, frameStart.length + buffer.length);
	return result;
}
function areBuffersEqual(buffer1, buffer2, length) {
	for (let i = 0; i < length; i++) if (buffer1[i] !== buffer2[i]) return false;
	return true;
}
function validateCommand(command) {
	switch (command.c) {
		case PeerCommandType$1.SegmentsAnnouncement: return command;
		case PeerCommandType$1.SegmentRequest:
			assertNumberFields(command, "i", "r");
			return command;
		case PeerCommandType$1.SegmentData:
			assertNumberFields(command, "i", "r", "s");
			return command;
		case PeerCommandType$1.SegmentAbsent:
		case PeerCommandType$1.CancelSegmentRequest:
		case PeerCommandType$1.SegmentDataSendingCompleted:
			assertNumberFields(command, "i", "r");
			return command;
		default: throw new Error(`Unknown peer command type: ${String(command.c)}`);
	}
}
function assertNumberFields(obj, ...fields) {
	for (const field of fields) if (typeof obj[field] !== "number") throw new Error(`Expected number field "${field}", got ${typeof obj[field]}`);
}
//#endregion
//#region src/p2p/commands/commands.ts
function serializeSegmentAnnouncementCommand(command, maxChunkSize) {
	const { c: commandCode, p: loadingByHttp, l: loaded } = command;
	const creator = new BinaryCommandCreator(commandCode, maxChunkSize);
	if (loaded?.length) creator.addUniqueSimilarIntArr("l", loaded);
	if (loadingByHttp?.length) creator.addUniqueSimilarIntArr("p", loadingByHttp);
	creator.complete();
	return creator.getResultBuffers();
}
function serializePeerSegmentCommand(command, maxChunkSize) {
	const creator = new BinaryCommandCreator(command.c, maxChunkSize);
	creator.addInteger("i", command.i);
	creator.addInteger("r", command.r);
	creator.complete();
	return creator.getResultBuffers();
}
function serializePeerSendSegmentCommand(command, maxChunkSize) {
	const creator = new BinaryCommandCreator(command.c, maxChunkSize);
	creator.addInteger("i", command.i);
	creator.addInteger("s", command.s);
	creator.addInteger("r", command.r);
	creator.complete();
	return creator.getResultBuffers();
}
function serializePeerSegmentRequestCommand(command, maxChunkSize) {
	const creator = new BinaryCommandCreator(command.c, maxChunkSize);
	creator.addInteger("i", command.i);
	creator.addInteger("r", command.r);
	if (command.b) creator.addInteger("b", command.b);
	creator.complete();
	return creator.getResultBuffers();
}
function serializePeerCommand(command, maxChunkSize) {
	switch (command.c) {
		case PeerCommandType$1.CancelSegmentRequest:
		case PeerCommandType$1.SegmentAbsent:
		case PeerCommandType$1.SegmentDataSendingCompleted: return serializePeerSegmentCommand(command, maxChunkSize);
		case PeerCommandType$1.SegmentRequest: return serializePeerSegmentRequestCommand(command, maxChunkSize);
		case PeerCommandType$1.SegmentsAnnouncement: return serializeSegmentAnnouncementCommand(command, maxChunkSize);
		case PeerCommandType$1.SegmentData: return serializePeerSendSegmentCommand(command, maxChunkSize);
	}
}
//#endregion
//#region src/p2p/commands/index.ts
var commands_exports = /* @__PURE__ */ __exportAll({
	BinaryCommandChunksJoiner: () => BinaryCommandChunksJoiner,
	BinaryCommandJoiningError: () => BinaryCommandJoiningError,
	PeerCommandType: () => PeerCommandType$1,
	deserializeCommand: () => deserializeCommand,
	isCommandChunk: () => isCommandChunk,
	serializePeerCommand: () => serializePeerCommand
});
//#endregion
//#region src/webtorrent/utils.ts
function getRTCError(event, fallbackMessage = "RTC error") {
	const errorEvent = event;
	if (errorEvent.error instanceof Error) return errorEvent.error;
	const msg = errorEvent.error?.message ?? fallbackMessage;
	return new Error(msg);
}
function getRTCErrorMessage(event, fallbackMessage = "RTC error") {
	return getRTCError(event, fallbackMessage).message;
}
function isTerminalConnectionState(state) {
	return state === "failed" || state === "closed" || state === "disconnected";
}
//#endregion
//#region src/webtorrent/data-channel-sender.ts
var MAX_BUFFERED_AMOUNT = 64 * 1024;
var DataChannelSender = class {
	channel;
	maxMessageSize;
	#currentSendContext;
	constructor(channel, maxMessageSize) {
		this.channel = channel;
		this.maxMessageSize = maxMessageSize;
	}
	async sendData(data, onChunkSent) {
		if (this.#currentSendContext) throw new Error("Already sending data");
		if (this.channel.readyState !== "open") throw new Error("Data channel is not open");
		this.channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT;
		const { promise, resolve, reject } = getPromiseWithResolvers();
		let offset = 0;
		let isSettled = false;
		const cleanup = () => {
			if (isSettled) return false;
			isSettled = true;
			this.#currentSendContext = void 0;
			this.channel.removeEventListener("bufferedamountlow", sendChunks);
			this.channel.removeEventListener("closing", onClose);
			this.channel.removeEventListener("close", onClose);
			this.channel.removeEventListener("error", onError);
			return true;
		};
		this.#currentSendContext = { cancel: () => {
			if (cleanup()) reject(/* @__PURE__ */ new Error("Send cancelled"));
		} };
		const onClose = () => {
			if (cleanup()) reject(/* @__PURE__ */ new Error("Data channel closed"));
		};
		const onError = (event) => {
			if (!cleanup()) return;
			const message = getRTCErrorMessage(event, "Unknown error");
			reject(/* @__PURE__ */ new Error(`Data channel error: ${message}`));
		};
		const buffer = ArrayBuffer.isView(data) ? data.buffer : data;
		const byteOffset = ArrayBuffer.isView(data) ? data.byteOffset : 0;
		const sendChunks = () => {
			if (isSettled) return;
			if (this.channel.readyState !== "open") {
				if (cleanup()) reject(/* @__PURE__ */ new Error(`Data channel not open (state: ${this.channel.readyState})`));
				return;
			}
			try {
				while (offset < data.byteLength) {
					if (this.channel.bufferedAmount > MAX_BUFFERED_AMOUNT) return;
					const bytesToSend = Math.min(this.maxMessageSize, data.byteLength - offset);
					const chunk = new Uint8Array(buffer, byteOffset + offset, bytesToSend);
					this.channel.send(chunk);
					offset += bytesToSend;
					onChunkSent?.(bytesToSend);
					if (!this.#currentSendContext) return;
				}
			} catch (error) {
				if (cleanup()) reject(error instanceof Error ? error : new Error(String(error)));
				return;
			}
			if (cleanup()) resolve();
		};
		this.channel.addEventListener("bufferedamountlow", sendChunks);
		this.channel.addEventListener("closing", onClose);
		this.channel.addEventListener("close", onClose);
		this.channel.addEventListener("error", onError);
		sendChunks();
		return promise;
	}
	cancel() {
		this.#currentSendContext?.cancel();
	}
};
//#endregion
//#region src/p2p/peer-protocol.ts
var logger = (0, import_browser.default)("p2pml-core:peer-protocol");
var PeerProtocol = class {
	#commandChunks;
	#dataChannelSender;
	#uploadingRequestId;
	#onChunkDownloaded;
	#onChunkUploaded;
	#channel;
	#peerConfig;
	#eventHandlers;
	#peerId;
	constructor(channel, peerConfig, eventHandlers, eventTarget, peerId) {
		this.#channel = channel;
		this.#peerConfig = peerConfig;
		this.#eventHandlers = eventHandlers;
		this.#peerId = peerId;
		this.#dataChannelSender = new DataChannelSender(channel, peerConfig.webRtcMaxMessageSize);
		this.#onChunkDownloaded = eventTarget.getEventDispatcher("onChunkDownloaded");
		this.#onChunkUploaded = eventTarget.getEventDispatcher("onChunkUploaded");
		if (channel.binaryType !== "arraybuffer") throw new Error(`Expected binaryType "arraybuffer", got "${channel.binaryType}"`);
		channel.addEventListener("message", this.#onMessageReceived);
	}
	#onMessageReceived = (event) => {
		try {
			const data = new Uint8Array(event.data);
			if (isCommandChunk(data)) this.#receivingCommandBytes(data);
			else {
				this.#eventHandlers.onSegmentChunkReceived(data);
				this.#onChunkDownloaded(data.byteLength, "p2p", this.#peerId, this.#peerConfig.streamType, this.#peerConfig.infoHash);
			}
		} catch (err) {
			logger("error handling data channel message: %O", err);
			this.#eventHandlers.onProtocolError(err);
		}
	};
	sendCommand(command) {
		if (this.#channel.readyState !== "open") throw new Error(`cannot send command ${command.c} (channel state: ${this.#channel.readyState})`);
		const binaryCommandBuffers = serializePeerCommand(command, this.#peerConfig.webRtcMaxMessageSize);
		for (const buffer of binaryCommandBuffers) this.#channel.send(buffer);
	}
	stopUploadingSegmentData() {
		this.#dataChannelSender.cancel();
		this.#uploadingRequestId = void 0;
	}
	getUploadingRequestId() {
		return this.#uploadingRequestId;
	}
	async splitSegmentDataToChunksAndUploadAsync(data, requestId) {
		if (this.#uploadingRequestId !== void 0) throw new Error(`Some segment data is already uploading.`);
		this.#uploadingRequestId = requestId;
		try {
			await this.#dataChannelSender.sendData(data, (chunkSize) => {
				this.#onChunkUploaded(chunkSize, this.#peerId, this.#peerConfig.streamType, this.#peerConfig.infoHash);
			});
		} finally {
			if (this.#uploadingRequestId === requestId) this.#uploadingRequestId = void 0;
		}
	}
	#receivingCommandBytes(buffer) {
		this.#commandChunks ??= new BinaryCommandChunksJoiner((commandBuffer) => {
			this.#commandChunks = void 0;
			let command;
			try {
				command = deserializeCommand(commandBuffer);
			} catch (err) {
				logger("error deserializing command: %O", err);
				this.#eventHandlers.onProtocolError(err);
				return;
			}
			this.#eventHandlers.onCommandReceived(command);
		});
		try {
			this.#commandChunks.addCommandChunk(buffer);
		} catch (err) {
			logger("error receiving command chunks: %O", err);
			this.#commandChunks = void 0;
			this.#eventHandlers.onProtocolError(err);
		}
	}
	destroy() {
		this.#channel.removeEventListener("message", this.#onMessageReceived);
		this.#dataChannelSender.cancel();
		this.#commandChunks = void 0;
		this.#uploadingRequestId = void 0;
	}
};
//#endregion
//#region src/bandwidth-calculator.ts
var MIN_TIME_DIFF_MS = 1;
var BandwidthCalculator = class {
	clearThresholdMs;
	loadingsCount = 0;
	bytes = [];
	loadingOnlyTimestamps = [];
	timestamps = [];
	noLoadingsTime = 0;
	loadingsStoppedAt = 0;
	constructor(clearThresholdMs = 2e4) {
		this.clearThresholdMs = clearThresholdMs;
	}
	addBytes(bytesLength, now = performance.now()) {
		this.bytes.push(bytesLength);
		this.loadingOnlyTimestamps.push(now - this.noLoadingsTime);
		this.timestamps.push(now);
	}
	startLoading(now = performance.now()) {
		this.clearStale();
		if (this.loadingsCount === 0 && this.loadingsStoppedAt !== 0) this.noLoadingsTime += now - this.loadingsStoppedAt;
		this.loadingsCount++;
	}
	stopLoading(now = performance.now()) {
		if (this.loadingsCount > 0) {
			this.loadingsCount--;
			if (this.loadingsCount === 0) this.loadingsStoppedAt = now;
		}
	}
	getBandwidthLoadingOnly(seconds, ignoreThresholdTimestamp = Number.NEGATIVE_INFINITY) {
		if (!this.loadingOnlyTimestamps.length) return 0;
		const milliseconds = seconds * 1e3;
		const lastItemTimestamp = this.loadingOnlyTimestamps[this.loadingOnlyTimestamps.length - 1];
		let lastCountedTimestamp = lastItemTimestamp;
		const threshold = lastItemTimestamp - milliseconds;
		let totalBytes = 0;
		for (let i = this.bytes.length - 1; i >= 0; i--) {
			const timestamp = this.loadingOnlyTimestamps[i];
			if (timestamp < threshold || this.timestamps[i] < ignoreThresholdTimestamp) break;
			lastCountedTimestamp = timestamp;
			totalBytes += this.bytes[i];
		}
		const timeDiff = Math.max(lastItemTimestamp - lastCountedTimestamp, MIN_TIME_DIFF_MS);
		return totalBytes * 8e3 / timeDiff;
	}
	getBandwidth(seconds, ignoreThresholdTimestamp = Number.NEGATIVE_INFINITY, now = performance.now()) {
		if (!this.timestamps.length) return 0;
		const threshold = now - seconds * 1e3;
		let lastCountedTimestamp = now;
		let totalBytes = 0;
		for (let i = this.bytes.length - 1; i >= 0; i--) {
			const timestamp = this.timestamps[i];
			if (timestamp < threshold || timestamp < ignoreThresholdTimestamp) break;
			lastCountedTimestamp = timestamp;
			totalBytes += this.bytes[i];
		}
		const timeDiff = Math.max(now - lastCountedTimestamp, MIN_TIME_DIFF_MS);
		return totalBytes * 8e3 / timeDiff;
	}
	clearStale() {
		if (!this.loadingOnlyTimestamps.length) return;
		const threshold = this.loadingOnlyTimestamps[this.loadingOnlyTimestamps.length - 1] - this.clearThresholdMs;
		let samplesToRemove = 0;
		for (const timestamp of this.loadingOnlyTimestamps) {
			if (timestamp > threshold) break;
			samplesToRemove++;
		}
		this.bytes.splice(0, samplesToRemove);
		this.loadingOnlyTimestamps.splice(0, samplesToRemove);
		this.timestamps.splice(0, samplesToRemove);
	}
	clear() {
		this.bytes.length = 0;
		this.loadingOnlyTimestamps.length = 0;
		this.timestamps.length = 0;
		this.loadingsCount = 0;
		this.noLoadingsTime = 0;
		this.loadingsStoppedAt = 0;
	}
};
//#endregion
//#region src/p2p/peer.ts
var { PeerCommandType } = commands_exports;
var Peer = class {
	id;
	channel;
	eventTarget;
	#peerProtocol;
	#downloadingContext;
	#loadedSegments = /* @__PURE__ */ new Set();
	#httpLoadingSegments = /* @__PURE__ */ new Set();
	#consecutiveTimeouts = 0;
	#bandwidthCalculator = new BandwidthCalculator();
	#cachedDownloadBandwidth = {
		value: 0,
		timestamp: 0
	};
	#logger = (0, import_browser.default)("p2pml-core:peer");
	#nextRequestId = 0;
	#latestRequestedUploadRequestId;
	#isDestroyed = false;
	connectedAt = performance.now();
	#closeConnection;
	#eventHandlers;
	#peerConfig;
	get isDestroyed() {
		return this.#isDestroyed;
	}
	constructor(id, channel, closeConnection, eventHandlers, peerConfig, eventTarget) {
		this.id = id;
		this.channel = channel;
		this.eventTarget = eventTarget;
		this.#closeConnection = closeConnection;
		this.#eventHandlers = eventHandlers;
		this.#peerConfig = peerConfig;
		this.#peerProtocol = new PeerProtocol(channel, peerConfig, {
			onSegmentChunkReceived: this.#onSegmentChunkReceived,
			onCommandReceived: (command) => void this.#onCommandReceived(command).catch((error) => {
				this.#logger("error processing command %O: %O", command, error);
				this.destroy(false, new PeerError("protocol-violation", error instanceof Error ? error.message : "Error processing command", error));
			}),
			onProtocolError: (error) => {
				this.destroy(false, new PeerError("protocol-violation", error instanceof Error ? error.message : "Protocol error", error));
			}
		}, eventTarget, id);
	}
	get downloadingSegment() {
		return this.#downloadingContext?.request.segment;
	}
	get isUploadingSegment() {
		return this.#peerProtocol.getUploadingRequestId() !== void 0;
	}
	getDownloadBandwidth() {
		const now = performance.now();
		if (now - this.#cachedDownloadBandwidth.timestamp > 1e3) {
			this.#cachedDownloadBandwidth.value = this.#bandwidthCalculator.getBandwidthLoadingOnly(15);
			this.#cachedDownloadBandwidth.timestamp = now;
		}
		return this.#cachedDownloadBandwidth.value;
	}
	getSegmentStatus(segment) {
		const { externalId } = segment;
		if (this.#loadedSegments.has(externalId)) return "loaded";
		if (this.#httpLoadingSegments.has(externalId)) return "http-loading";
	}
	#onCommandReceived = async (command) => {
		switch (command.c) {
			case PeerCommandType.SegmentsAnnouncement:
				this.#loadedSegments = new Set(command.l);
				this.#httpLoadingSegments = new Set(command.p);
				this.#eventHandlers.onSegmentsAnnouncement();
				break;
			case PeerCommandType.SegmentRequest:
				this.#latestRequestedUploadRequestId = command.r;
				this.#peerProtocol.stopUploadingSegmentData();
				this.#eventHandlers.onSegmentRequested(this, command.i, command.r, command.b);
				break;
			case PeerCommandType.SegmentData:
				{
					if (!this.#downloadingContext) break;
					if (this.#downloadingContext.isSegmentDataCommandReceived) break;
					const { request, controls, requestId } = this.#downloadingContext;
					if (request.segment.externalId !== command.i || requestId !== command.r) break;
					this.#downloadingContext.isSegmentDataCommandReceived = true;
					controls.firstBytesReceived();
					if (request.totalBytes === void 0) request.setTotalBytes(request.loadedBytes + command.s);
					else if (request.totalBytes - request.loadedBytes !== command.s) this.#destroyOnPeerError("bytes-length-mismatch", "Peer response bytes length mismatch");
				}
				break;
			case PeerCommandType.SegmentDataSendingCompleted: {
				const downloadingContext = this.#downloadingContext;
				if (!downloadingContext?.isSegmentDataCommandReceived) return;
				const { request, controls, requestId } = downloadingContext;
				if (request.segment.externalId !== command.i || requestId !== command.r) {
					this.#destroyOnPeerError("protocol-violation", "Peer protocol violation");
					return;
				}
				if (request.loadedBytes !== request.totalBytes) {
					this.#destroyOnPeerError("bytes-length-mismatch", "Peer response bytes length mismatch");
					return;
				}
				const isValid = await request.validateData(this.#peerConfig.validateP2PSegment);
				if (this.#isDestroyed) return;
				if (this.#downloadingContext !== downloadingContext) return;
				if (!isValid) {
					this.#destroyOnPeerError("validation-failed", "P2P segment validation failed");
					return;
				}
				this.#consecutiveTimeouts = 0;
				controls.completeOnSuccess();
				this.#bandwidthCalculator.stopLoading();
				this.#downloadingContext = void 0;
				break;
			}
			case PeerCommandType.SegmentAbsent:
				this.#loadedSegments.delete(command.i);
				if (this.#downloadingContext?.request.segment.externalId === command.i && this.#downloadingContext.requestId === command.r) this.#cancelSegmentDownloading("peer-segment-absent");
				break;
			case PeerCommandType.CancelSegmentRequest:
				if (this.#latestRequestedUploadRequestId === command.r) this.#latestRequestedUploadRequestId = void 0;
				if (this.#peerProtocol.getUploadingRequestId() !== command.r) break;
				this.#peerProtocol.stopUploadingSegmentData();
				break;
		}
	};
	#onSegmentChunkReceived = (chunk) => {
		if (!this.#downloadingContext?.isSegmentDataCommandReceived) return;
		const { request, controls } = this.#downloadingContext;
		if (request.totalBytes !== void 0 && request.loadedBytes + chunk.byteLength > request.totalBytes) {
			this.#destroyOnPeerError("bytes-length-mismatch", "Peer response bytes length mismatch");
			return;
		}
		this.#bandwidthCalculator.addBytes(chunk.byteLength);
		this.#cachedDownloadBandwidth.timestamp = 0;
		controls.addLoadedChunk(chunk);
	};
	downloadSegment(segmentRequest) {
		if (this.#isDestroyed) return;
		if (this.#downloadingContext) throw new Error("Some segment already is downloading");
		if (segmentRequest.tryCompleteByLoadedBytes({
			downloadSource: "p2p",
			peerId: this.id
		}, {
			notReceivingBytesTimeoutMs: this.#peerConfig.p2pNotReceivingBytesTimeoutMs,
			onAbort: () => void 0
		}, this.#peerConfig.validateP2PSegment, "p2p-segment-validation-failed")) return;
		this.#bandwidthCalculator.startLoading();
		this.#nextRequestId = (this.#nextRequestId + 1) % 1e9;
		this.#downloadingContext = {
			request: segmentRequest,
			requestId: this.#nextRequestId,
			isSegmentDataCommandReceived: false,
			controls: segmentRequest.start({
				downloadSource: "p2p",
				peerId: this.id
			}, {
				notReceivingBytesTimeoutMs: this.#peerConfig.p2pNotReceivingBytesTimeoutMs,
				onAbort: (error) => {
					if (!this.#downloadingContext || this.#downloadingContext.request !== segmentRequest) return;
					const { request, requestId } = this.#downloadingContext;
					this.#sendCancelSegmentRequestCommand(request.segment, requestId);
					this.#bandwidthCalculator.stopLoading();
					if (error.type !== "abort") {
						this.#bandwidthCalculator.clear();
						this.#cachedDownloadBandwidth.timestamp = 0;
						this.#logger(`cleared bandwidth history due to ${error.type}`);
					}
					this.#downloadingContext = void 0;
					if (error.type === "bytes-receiving-timeout") this.#consecutiveTimeouts++;
					if (this.#consecutiveTimeouts >= this.#peerConfig.p2pErrorRetries) this.destroy(false, new PeerError("timeout", "Too many timeout errors"));
					else if (error.type === "bytes-receiving-timeout") this.#eventHandlers.onWarning(new PeerWarning("timeout-strike", `Timeout strike ${this.#consecutiveTimeouts}/${this.#peerConfig.p2pErrorRetries}`));
				}
			})
		};
		const command = {
			c: PeerCommandType.SegmentRequest,
			r: this.#downloadingContext.requestId,
			i: segmentRequest.segment.externalId
		};
		if (segmentRequest.loadedBytes) command.b = segmentRequest.loadedBytes;
		if (!this.#sendCommand(command)) this.#cancelSegmentDownloading("peer-closed");
	}
	async uploadSegmentData(segment, requestId, data) {
		if (this.#isDestroyed) return;
		if (requestId !== this.#latestRequestedUploadRequestId) {
			this.#logger(`discarding obsolete upload request ${requestId} for segment ${segment.externalId}`);
			return;
		}
		const { externalId } = segment;
		this.#logger(`send segment ${segment.externalId} to ${this.id} (byteLength: ${data.byteLength})`);
		const command = {
			c: PeerCommandType.SegmentData,
			i: externalId,
			r: requestId,
			s: data.byteLength
		};
		if (!this.#sendCommand(command)) return;
		try {
			await this.#peerProtocol.splitSegmentDataToChunksAndUploadAsync(data, requestId);
			if (this.isDestroyed || requestId !== this.#latestRequestedUploadRequestId) return;
			this.#sendSegmentDataSendingCompletedCommand(segment, requestId);
			this.#logger(`segment ${externalId} has been sent to ${this.id}`);
		} catch (error) {
			this.#logger(`cancel segment uploading ${externalId}: %O`, error);
		}
	}
	#destroyOnPeerError(type, message) {
		this.#downloadingContext?.request.clearLoadedBytes();
		const error = new PeerError(type, message);
		this.#cancelSegmentDownloading("peer-closed", error);
		this.destroy(false, error);
	}
	#cancelSegmentDownloading(type, cause) {
		if (!this.#downloadingContext) return;
		const { request, controls } = this.#downloadingContext;
		const { segment } = request;
		this.#logger(`cancel segment request ${segment.externalId} (${type})`);
		const error = new RequestError(type, void 0, cause);
		controls.failWithError(error);
		this.#bandwidthCalculator.stopLoading();
		if (type !== "peer-segment-absent") {
			this.#bandwidthCalculator.clear();
			this.#cachedDownloadBandwidth.timestamp = 0;
			this.#logger(`cleared bandwidth history due to ${error.type}`);
		}
		this.#downloadingContext = void 0;
	}
	sendSegmentsAnnouncementCommand(loadedSegmentsIds, httpLoadingSegmentsIds) {
		const command = {
			c: PeerCommandType.SegmentsAnnouncement,
			p: httpLoadingSegmentsIds,
			l: loadedSegmentsIds
		};
		this.#sendCommand(command);
	}
	sendSegmentAbsentCommand(segmentExternalId, requestId) {
		this.#sendCommand({
			c: PeerCommandType.SegmentAbsent,
			i: segmentExternalId,
			r: requestId
		});
	}
	#sendCancelSegmentRequestCommand(segment, requestId) {
		this.#sendCommand({
			c: PeerCommandType.CancelSegmentRequest,
			i: segment.externalId,
			r: requestId
		});
	}
	#sendSegmentDataSendingCompletedCommand(segment, requestId) {
		this.#sendCommand({
			c: PeerCommandType.SegmentDataSendingCompleted,
			r: requestId,
			i: segment.externalId
		});
	}
	destroy(isConnectionClosed = false, error) {
		if (this.#isDestroyed) return;
		this.#isDestroyed = true;
		this.#cancelSegmentDownloading("peer-closed", error);
		this.#peerProtocol.destroy();
		if (!isConnectionClosed) this.#closeConnection(error);
		this.#logger(`peer closed ${this.id}`);
	}
	#sendCommand(command) {
		if (this.#isDestroyed) return false;
		try {
			this.#peerProtocol.sendCommand(command);
			return true;
		} catch (error) {
			this.#logger("error sending command %d: %O", command.c, error);
			return false;
		}
	}
};
//#endregion
//#region src/utils/event-target.ts
var EventTarget = class {
	events = /* @__PURE__ */ new Map();
	dispatchEvent(eventName, a1, a2, a3, a4, a5) {
		const listeners = this.events.get(eventName);
		if (!listeners) return;
		for (const listener of listeners) try {
			listener(a1, a2, a3, a4, a5);
		} catch {}
	}
	getEventDispatcher(eventName) {
		return (a1, a2, a3, a4, a5) => {
			const listeners = this.events.get(eventName);
			if (!listeners) return;
			for (const listener of listeners) try {
				listener(a1, a2, a3, a4, a5);
			} catch {}
		};
	}
	addEventListener(eventName, listener) {
		const listeners = this.events.get(eventName);
		if (!listeners) this.events.set(eventName, [listener]);
		else this.events.set(eventName, [...listeners, listener]);
	}
	removeEventListener(eventName, listener) {
		const listeners = this.events.get(eventName);
		if (!listeners) return;
		const index = listeners.indexOf(listener);
		if (index === -1) return;
		if (listeners.length === 1) {
			this.events.delete(eventName);
			return;
		}
		const newListeners = listeners.slice();
		newListeners.splice(index, 1);
		this.events.set(eventName, newListeners);
	}
	clear() {
		this.events.clear();
	}
};
//#endregion
//#region src/webtorrent/webtorrent-client/webrtc-utils.ts
var win = typeof window !== "undefined" ? window : {};
var PeerConnection = win.RTCPeerConnection ?? win.webkitRTCPeerConnection ?? win.mozRTCPeerConnection;
var SessionDescription = win.RTCSessionDescription ?? win.webkitRTCSessionDescription ?? win.mozRTCSessionDescription;
/**
* Detects whether the current browser environment natively supports Promise-based WebRTC APIs
* (specifically pc.createOffer and pc.createAnswer).
*
* For example:
* - Chrome < 50: Callback-only for all WebRTC APIs.
* - Chrome 50: Promise support for setLocalDescription/setRemoteDescription, but callback-only for createOffer/createAnswer.
* - Chrome 51+: Promise support for all WebRTC APIs.
*
* Probing this statically once at startup prevents the need to repeatedly execute throw/catch blocks
* during runtime connection negotiations, avoiding unnecessary exception-handling overhead.
*/
var supportsPromiseWebRTC = (() => {
	if (!win.RTCPeerConnection && !win.webkitRTCPeerConnection && !win.mozRTCPeerConnection) return false;
	let pc;
	try {
		pc = new PeerConnection();
		const p = pc.createOffer();
		if (typeof p?.then === "function") {
			p.catch(() => {});
			return true;
		}
	} catch {} finally {
		try {
			pc?.close();
		} catch {}
	}
	return false;
})();
/**
* Safe, backward-compatible wrapper for RTCPeerConnection.createOffer.
*
* Falls back to legacy callback-based signature on older engines (like Chrome 50 and below)
* while leveraging native Promises on modern browsers, avoiding runtime throwing or exception latency.
*/
function safeCreateOffer(pc, options) {
	if (supportsPromiseWebRTC) return pc.createOffer(options);
	return new Promise((resolve, reject) => {
		try {
			pc.createOffer(resolve, reject, options);
		} catch (err) {
			reject(err);
		}
	});
}
/**
* Safe, backward-compatible wrapper for RTCPeerConnection.createAnswer.
*
* Falls back to legacy callback-based signature on older engines (like Chrome 50 and below)
* while leveraging native Promises on modern browsers, avoiding runtime throwing or exception latency.
*/
function safeCreateAnswer(pc, options) {
	if (supportsPromiseWebRTC) return pc.createAnswer(options);
	return new Promise((resolve, reject) => {
		try {
			pc.createAnswer(resolve, reject, options);
		} catch (err) {
			reject(err);
		}
	});
}
/**
* Safe, backward-compatible wrapper for RTCPeerConnection.setLocalDescription.
*
* Falls back to legacy callback-based signature on older engines (like Chrome < 50)
* while leveraging native Promises on modern browsers.
*/
function safeSetLocalDescription(pc, description) {
	if (supportsPromiseWebRTC) return pc.setLocalDescription(description);
	return new Promise((resolve, reject) => {
		try {
			pc.setLocalDescription(description, resolve, reject);
		} catch (err) {
			reject(err);
		}
	});
}
/**
* Safe, backward-compatible wrapper for RTCPeerConnection.setRemoteDescription.
*
* Falls back to legacy callback-based signature on older engines (like Chrome < 50)
* while leveraging native Promises on modern browsers.
*/
function safeSetRemoteDescription(pc, description) {
	if (supportsPromiseWebRTC) return pc.setRemoteDescription(description);
	return new Promise((resolve, reject) => {
		try {
			pc.setRemoteDescription(description, resolve, reject);
		} catch (err) {
			reject(err);
		}
	});
}
//#endregion
//#region src/webtorrent/webtorrent-client/index.ts
var WEBTORRENT_DEFAULT_OFFER_TIMEOUT = 5e4;
var WEBTORRENT_DEFAULT_CONNECTION_TIMEOUT = 15e3;
var WEBTORRENT_DEFAULT_OFFERS_COUNT = 5;
var WEBTORRENT_DEFAULT_ICE_GATHERING_TIMEOUT = 5e3;
function generateOfferId() {
	let id = "";
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 20; i++) id += chars.charAt(Math.floor(Math.random() * 62));
	return id;
}
var VALID_SDP_TYPES = /* @__PURE__ */ new Set([
	"offer",
	"answer",
	"pranswer",
	"rollback"
]);
function isSessionDescriptionInit(value) {
	if (typeof value !== "object" || value === null) return false;
	const obj = value;
	return typeof obj.type === "string" && VALID_SDP_TYPES.has(obj.type) && typeof obj.sdp === "string";
}
var WebTorrentClient = class WebTorrentClient {
	static #DEFAULT_ANNOUNCE_INTERVAL_SECONDS = 120;
	static #MIN_ANNOUNCE_INTERVAL_SECONDS = 20;
	#config;
	#wsClient;
	#eventTarget = new EventTarget();
	#pendingOffers = /* @__PURE__ */ new Map();
	#negotiatingConnections = /* @__PURE__ */ new Set();
	#destroyAbortController = new SafeAbortController();
	#announceTimeoutId = null;
	#announceIntervalSeconds = null;
	#scheduleAnnounceRunId = 0;
	#activeAnnouncePromise = null;
	#nextAnnounceEvent = void 0;
	#trackerId = null;
	#started = false;
	#isDestroyed() {
		return this.#destroyAbortController.signal.aborted;
	}
	#throwIfDestroyed() {
		if (this.#destroyAbortController.signal.aborted) throw new Error("Client destroyed");
	}
	constructor(config) {
		this.#config = {
			infoHash: config.infoHash,
			peerId: config.peerId,
			rtcConfig: config.rtcConfig,
			channelConfig: config.channelConfig,
			offerTimeout: config.offerTimeout ?? (() => WEBTORRENT_DEFAULT_OFFER_TIMEOUT),
			offersCount: config.offersCount ?? (() => WEBTORRENT_DEFAULT_OFFERS_COUNT),
			iceGatheringTimeout: config.iceGatheringTimeout ?? (() => WEBTORRENT_DEFAULT_ICE_GATHERING_TIMEOUT),
			connectionTimeout: config.connectionTimeout ?? (() => WEBTORRENT_DEFAULT_CONNECTION_TIMEOUT),
			claimPeer: config.claimPeer ?? (() => true),
			shouldGenerateOffers: config.shouldGenerateOffers ?? (() => true)
		};
		this.#wsClient = config.wsClient;
	}
	addEventListener(eventName, listener) {
		this.#eventTarget.addEventListener(eventName, listener);
	}
	removeEventListener(eventName, listener) {
		this.#eventTarget.removeEventListener(eventName, listener);
	}
	start() {
		if (this.#isDestroyed() || this.#started) return;
		this.#started = true;
		this.#wsClient.addEventListener("connected", this.#onWsConnected);
		this.#wsClient.addEventListener("disconnected", this.#onWsDisconnected);
		this.#wsClient.addEventListener("message", this.#onWsMessage);
		if (this.#wsClient.state === "connected") this.#onWsConnected();
	}
	destroy() {
		if (this.#isDestroyed()) return;
		this.#destroyAbortController.abort();
		this.#clearAnnounceTimeout();
		this.#sendStopped();
		this.#cleanupPendingOffers();
		this.#cleanupNegotiatingConnections();
		if (this.#started) {
			this.#wsClient.removeEventListener("connected", this.#onWsConnected);
			this.#wsClient.removeEventListener("disconnected", this.#onWsDisconnected);
			this.#wsClient.removeEventListener("message", this.#onWsMessage);
		}
		this.#eventTarget.clear();
	}
	#onWsConnected = () => {
		this.#scheduleAnnounce(WebTorrentClient.#DEFAULT_ANNOUNCE_INTERVAL_SECONDS);
		this.#announce("started").catch((err) => {
			if (this.#isDestroyed()) return;
			this.#eventTarget.dispatchEvent("error", new TrackerError("announce-failed", `Initial announce failed: ${err instanceof Error ? err.message : String(err)}`, err));
		});
	};
	#onWsDisconnected = () => {
		this.#clearAnnounceTimeout();
		this.#announceIntervalSeconds = null;
	};
	#onWsMessage = (data) => {
		if (this.#isDestroyed()) return;
		let msg;
		try {
			const text = typeof data === "string" ? data : new TextDecoder().decode(data);
			msg = JSON.parse(text);
		} catch (err) {
			this.#eventTarget.dispatchEvent("error", new TrackerError("parse-error", `Failed to parse tracker message: ${err instanceof Error ? err.message : String(err)}`, err));
			return;
		}
		if (typeof msg !== "object" || msg === null || Array.isArray(msg)) return;
		const dataObject = msg;
		const infoHash = dataObject.info_hash;
		if (typeof infoHash === "string" && infoHash !== this.#config.infoHash) return;
		const warningMessage = dataObject["warning message"];
		if (typeof warningMessage === "string") this.#eventTarget.dispatchEvent("warning", new TrackerWarning("tracker-response", warningMessage));
		const failureReason = dataObject["failure reason"];
		if (typeof failureReason === "string") {
			this.#eventTarget.dispatchEvent("error", new TrackerError("tracker-response", failureReason));
			return;
		}
		const { interval } = dataObject;
		if (typeof interval === "number" && interval > 0) {
			const safeInterval = Math.max(WebTorrentClient.#MIN_ANNOUNCE_INTERVAL_SECONDS, interval);
			if (this.#announceIntervalSeconds !== safeInterval) this.#scheduleAnnounce(safeInterval);
		}
		const trackerId = dataObject["tracker id"];
		if (typeof trackerId === "string") this.#trackerId = trackerId;
		const peerId = dataObject.peer_id;
		if (typeof peerId === "string" && peerId === this.#config.peerId) return;
		const offerId = dataObject.offer_id;
		if (typeof peerId !== "string" || typeof offerId !== "string") return;
		if (isSessionDescriptionInit(dataObject.offer)) this.#handleIncomingOffer({
			sdp: dataObject.offer,
			peerId,
			offerId
		}).catch((err) => {
			if (this.#isDestroyed()) return;
			this.#eventTarget.dispatchEvent("error", new TrackerError("signaling-failed", `Failed to handle offer: ${err instanceof Error ? err.message : String(err)}`, err));
		});
		else if (isSessionDescriptionInit(dataObject.answer)) this.#handleIncomingAnswer({
			sdp: dataObject.answer,
			peerId,
			offerId
		}).catch((err) => {
			if (this.#isDestroyed()) return;
			this.#eventTarget.dispatchEvent("error", new TrackerError("signaling-failed", `Failed to handle answer: ${err instanceof Error ? err.message : String(err)}`, err));
		});
	};
	#scheduleAnnounce(intervalSeconds) {
		this.#clearAnnounceTimeout();
		this.#announceIntervalSeconds = intervalSeconds;
		const runId = ++this.#scheduleAnnounceRunId;
		const run = async () => {
			try {
				await this.#announce();
			} catch (err) {
				if (this.#isDestroyed()) return;
				this.#eventTarget.dispatchEvent("error", new TrackerError("announce-failed", `Announce failed: ${err instanceof Error ? err.message : String(err)}`, err));
			}
			if (!this.#isDestroyed() && this.#announceIntervalSeconds !== null && this.#scheduleAnnounceRunId === runId) this.#announceTimeoutId = setTimeout(run, this.#announceIntervalSeconds * 1e3);
		};
		this.#announceTimeoutId = setTimeout(run, intervalSeconds * 1e3);
	}
	#clearAnnounceTimeout() {
		if (this.#announceTimeoutId !== null) {
			clearTimeout(this.#announceTimeoutId);
			this.#announceTimeoutId = null;
		}
	}
	async #announce(event) {
		if (this.#isDestroyed() || this.#wsClient.state !== "connected") return;
		if (event) this.#nextAnnounceEvent = event;
		if (this.#activeAnnouncePromise) return this.#activeAnnouncePromise;
		const promise = (async () => {
			const offersCount = this.#config.shouldGenerateOffers() ? this.#config.offersCount() : 0;
			const results = await Promise.all(Array.from({ length: offersCount }, () => this.#createOffer()));
			if (this.#isDestroyed()) {
				for (const result of results) if (result) this.#cleanupPendingOffer(result.offer_id);
				return;
			}
			const offers = [];
			for (const result of results) if (result) offers.push(result);
			const currentEvent = this.#nextAnnounceEvent;
			this.#nextAnnounceEvent = void 0;
			const payload = this.#buildAnnouncePayload({
				numwant: offers.length,
				offers,
				event: currentEvent
			});
			if (this.#wsClient.state !== "connected") {
				for (const offer of offers) this.#cleanupPendingOffer(offer.offer_id);
				return;
			}
			try {
				this.#wsClient.send(JSON.stringify(payload));
			} catch (err) {
				for (const offer of offers) this.#cleanupPendingOffer(offer.offer_id);
				throw err;
			}
		})();
		this.#activeAnnouncePromise = promise;
		try {
			await promise;
		} finally {
			if (this.#activeAnnouncePromise === promise) this.#activeAnnouncePromise = null;
		}
	}
	async #createOffer() {
		if (this.#isDestroyed()) return void 0;
		let pc;
		try {
			pc = new PeerConnection(this.#config.rtcConfig?.());
			this.#negotiatingConnections.add(pc);
			const channel = pc.createDataChannel("webtorrent", this.#config.channelConfig);
			const offer = await safeCreateOffer(pc);
			this.#throwIfDestroyed();
			await safeSetLocalDescription(pc, offer);
			this.#throwIfDestroyed();
			await this.#waitForIceGathering(pc);
			this.#throwIfDestroyed();
			const sdp = pc.localDescription;
			if (!sdp?.sdp) {
				pc.close();
				return;
			}
			const offerId = generateOfferId();
			this.#pendingOffers.set(offerId, {
				connection: pc,
				channel,
				timeoutId: setTimeout(() => {
					this.#cleanupPendingOffer(offerId);
				}, this.#config.offerTimeout())
			});
			return {
				offer: {
					type: sdp.type,
					sdp: sdp.sdp
				},
				offer_id: offerId
			};
		} catch (err) {
			pc?.close();
			if (!this.#isDestroyed()) this.#eventTarget.dispatchEvent("warning", new TrackerWarning("offer-failed", `Failed to create offer: ${err instanceof Error ? err.message : String(err)}`, err));
		} finally {
			if (pc) this.#negotiatingConnections.delete(pc);
		}
	}
	#sendStopped() {
		if (this.#wsClient.state !== "connected") return;
		const payload = this.#buildAnnouncePayload({
			numwant: 0,
			offers: [],
			event: "stopped"
		});
		try {
			this.#wsClient.send(JSON.stringify(payload));
		} catch {}
	}
	#buildAnnouncePayload({ numwant, offers, event }) {
		const payload = {
			action: "announce",
			info_hash: this.#config.infoHash,
			peer_id: this.#config.peerId,
			numwant,
			uploaded: 0,
			downloaded: 0,
			offers
		};
		if (event) payload.event = event;
		if (this.#trackerId) payload.trackerid = this.#trackerId;
		return payload;
	}
	async #handleIncomingOffer({ sdp: offerSdp, peerId: remotePeerId, offerId: remoteOfferId }) {
		if (this.#isDestroyed()) return;
		if (!this.#config.claimPeer(remotePeerId)) return;
		let pc;
		try {
			pc = new PeerConnection(this.#config.rtcConfig?.());
			this.#negotiatingConnections.add(pc);
			await safeSetRemoteDescription(pc, new SessionDescription(offerSdp));
			this.#throwIfDestroyed();
			const answer = await safeCreateAnswer(pc);
			this.#throwIfDestroyed();
			await safeSetLocalDescription(pc, answer);
			this.#throwIfDestroyed();
			await this.#waitForIceGathering(pc);
			this.#throwIfDestroyed();
			const sdp = pc.localDescription;
			if (!sdp) throw new Error("Failed to get local description after ICE gathering");
			const payload = {
				action: "announce",
				info_hash: this.#config.infoHash,
				peer_id: this.#config.peerId,
				to_peer_id: remotePeerId,
				offer_id: remoteOfferId,
				answer: {
					type: sdp.type,
					sdp: sdp.sdp
				}
			};
			this.#wsClient.send(JSON.stringify(payload));
			const channel = await this.#waitForConnection(pc);
			this.#throwIfDestroyed();
			this.#eventTarget.dispatchEvent("peerConnected", {
				peerId: remotePeerId,
				connection: pc,
				channel
			});
		} catch (err) {
			pc?.close();
			this.#eventTarget.dispatchEvent("peerConnectFailed", {
				peerId: remotePeerId,
				error: new PeerConnectError("connection-failed", err instanceof Error ? err.message : String(err), err)
			});
		} finally {
			if (pc) this.#negotiatingConnections.delete(pc);
		}
	}
	async #handleIncomingAnswer({ sdp: answerSdp, peerId: remotePeerId, offerId: ourOfferId }) {
		if (this.#isDestroyed()) return;
		const pending = this.#pendingOffers.get(ourOfferId);
		if (!pending) return;
		this.#pendingOffers.delete(ourOfferId);
		clearTimeout(pending.timeoutId);
		if (!this.#config.claimPeer(remotePeerId)) {
			pending.connection.close();
			return;
		}
		this.#negotiatingConnections.add(pending.connection);
		try {
			await safeSetRemoteDescription(pending.connection, new SessionDescription(answerSdp));
			this.#throwIfDestroyed();
			const channel = await this.#waitForConnection(pending.connection, pending.channel);
			this.#throwIfDestroyed();
			this.#eventTarget.dispatchEvent("peerConnected", {
				peerId: remotePeerId,
				connection: pending.connection,
				channel
			});
		} catch (err) {
			pending.connection.close();
			this.#eventTarget.dispatchEvent("peerConnectFailed", {
				peerId: remotePeerId,
				error: new PeerConnectError("connection-failed", err instanceof Error ? err.message : String(err), err)
			});
		} finally {
			this.#negotiatingConnections.delete(pending.connection);
		}
	}
	#waitForIceGathering(pc) {
		return new Promise((resolve, reject) => {
			if (pc.iceGatheringState === "complete") {
				resolve();
				return;
			}
			if (pc.signalingState === "closed") {
				reject(/* @__PURE__ */ new Error("RTCPeerConnection closed"));
				return;
			}
			let timeoutId = void 0;
			const cleanup = () => {
				clearTimeout(timeoutId);
				pc.removeEventListener("icegatheringstatechange", onGatheringChange);
				pc.removeEventListener("icecandidate", onIceCandidate);
				pc.removeEventListener("signalingstatechange", onSignalingChange);
				this.#destroyAbortController.signal.removeEventListener("abort", onAbort);
			};
			const onGatheringChange = () => {
				if (pc.iceGatheringState === "complete") {
					cleanup();
					resolve();
				}
			};
			const onIceCandidate = (event) => {
				if (event.candidate === null) {
					cleanup();
					resolve();
				}
			};
			const onSignalingChange = () => {
				if (pc.signalingState === "closed") {
					cleanup();
					reject(/* @__PURE__ */ new Error("RTCPeerConnection closed"));
				}
			};
			const onAbort = () => {
				cleanup();
				reject(/* @__PURE__ */ new Error("ICE gathering aborted due to teardown"));
			};
			if (this.#destroyAbortController.signal.aborted) {
				onAbort();
				return;
			}
			timeoutId = setTimeout(() => {
				cleanup();
				resolve();
			}, this.#config.iceGatheringTimeout());
			pc.addEventListener("icegatheringstatechange", onGatheringChange);
			pc.addEventListener("icecandidate", onIceCandidate);
			pc.addEventListener("signalingstatechange", onSignalingChange);
			this.#destroyAbortController.signal.addEventListener("abort", onAbort);
		});
	}
	#waitForConnection(pc, channel) {
		const { promise, resolve, reject } = getPromiseWithResolvers();
		let timeoutId = void 0;
		let boundChannel = channel;
		const rejectIfTerminalState = () => {
			if (isTerminalConnectionState(pc.iceConnectionState)) {
				cleanup();
				reject(/* @__PURE__ */ new Error(`ICE connection ${pc.iceConnectionState}`));
				return true;
			}
			return false;
		};
		const onChannelOpen = () => {
			cleanup();
			if (boundChannel) resolve(boundChannel);
			else reject(/* @__PURE__ */ new Error("Data channel missing on open"));
		};
		const onChannelError = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("Data channel error"));
		};
		const onChannelClose = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("Data channel closed prematurely"));
		};
		const bindDataChannel = (dc) => {
			boundChannel = dc;
			if (dc.readyState === "open") onChannelOpen();
			else if (dc.readyState === "closed" || dc.readyState === "closing") onChannelClose();
			else {
				dc.addEventListener("open", onChannelOpen);
				dc.addEventListener("error", onChannelError);
				dc.addEventListener("close", onChannelClose);
				dc.addEventListener("closing", onChannelClose);
			}
		};
		const onDataChannel = (event) => {
			if (!boundChannel) bindDataChannel(event.channel);
		};
		const onAbort = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("Connection aborted due to teardown"));
		};
		const cleanup = () => {
			clearTimeout(timeoutId);
			pc.removeEventListener("iceconnectionstatechange", rejectIfTerminalState);
			pc.removeEventListener("datachannel", onDataChannel);
			if (boundChannel) {
				boundChannel.removeEventListener("open", onChannelOpen);
				boundChannel.removeEventListener("error", onChannelError);
				boundChannel.removeEventListener("close", onChannelClose);
				boundChannel.removeEventListener("closing", onChannelClose);
			}
			this.#destroyAbortController.signal.removeEventListener("abort", onAbort);
		};
		if (this.#destroyAbortController.signal.aborted) {
			onAbort();
			return promise;
		}
		if (rejectIfTerminalState()) return promise;
		timeoutId = setTimeout(() => {
			cleanup();
			reject(/* @__PURE__ */ new Error("Data channel open timeout"));
		}, this.#config.connectionTimeout());
		pc.addEventListener("iceconnectionstatechange", rejectIfTerminalState);
		this.#destroyAbortController.signal.addEventListener("abort", onAbort);
		if (boundChannel) bindDataChannel(boundChannel);
		else pc.addEventListener("datachannel", onDataChannel);
		return promise;
	}
	#cleanupPendingOffer(offerId, pending) {
		const entry = pending ?? this.#pendingOffers.get(offerId);
		if (entry) {
			clearTimeout(entry.timeoutId);
			entry.connection.close();
			this.#pendingOffers.delete(offerId);
		}
	}
	#cleanupPendingOffers() {
		for (const [offerId, pending] of this.#pendingOffers) this.#cleanupPendingOffer(offerId, pending);
	}
	#cleanupNegotiatingConnections() {
		for (const pc of this.#negotiatingConnections) pc.close();
		this.#negotiatingConnections.clear();
	}
};
//#endregion
//#region src/webtorrent/webtorrent-manager/index.ts
var WEBTORRENT_DEFAULT_MAX_PEERS = 50;
var WEBTORRENT_DEFAULT_MAX_PEERS_MULTIPLIER = 1.5;
var WebTorrentManager = class {
	#config;
	#eventTarget = new EventTarget();
	#connectingPeers = /* @__PURE__ */ new Set();
	#connectedPeers = /* @__PURE__ */ new Map();
	#clients = /* @__PURE__ */ new Set();
	#destroyed = false;
	#started = false;
	#claimPeer = (remotePeerId) => {
		if (this.#destroyed) return false;
		if (this.#connectingPeers.has(remotePeerId) || this.#connectedPeers.has(remotePeerId)) return false;
		const hardLimit = Math.floor(this.#config.maxPeers() * Math.max(1, this.#config.maxPeersMultiplier()));
		if (this.#connectingPeers.size + this.#connectedPeers.size >= hardLimit) return false;
		this.#connectingPeers.add(remotePeerId);
		return true;
	};
	constructor(config) {
		this.#config = {
			...config,
			maxPeers: config.maxPeers ?? (() => WEBTORRENT_DEFAULT_MAX_PEERS),
			maxPeersMultiplier: config.maxPeersMultiplier ?? (() => WEBTORRENT_DEFAULT_MAX_PEERS_MULTIPLIER)
		};
	}
	addEventListener(eventName, listener) {
		this.#eventTarget.addEventListener(eventName, listener);
	}
	removeEventListener(eventName, listener) {
		this.#eventTarget.removeEventListener(eventName, listener);
	}
	start() {
		if (this.#destroyed || this.#started) return;
		this.#started = true;
		try {
			for (const url of this.#config.trackerUrls) {
				const { client: wsClient, release } = this.#config.socketPool.acquire(url);
				let addedToClients = false;
				try {
					const client = new WebTorrentClient({
						infoHash: this.#config.infoHash,
						peerId: this.#config.peerId,
						wsClient,
						rtcConfig: this.#config.rtcConfig,
						channelConfig: this.#config.channelConfig,
						claimPeer: this.#claimPeer,
						offersCount: this.#config.offersCount,
						offerTimeout: this.#config.offerTimeout,
						iceGatheringTimeout: this.#config.iceGatheringTimeout,
						connectionTimeout: this.#config.connectionTimeout,
						shouldGenerateOffers: () => this.#connectingPeers.size + this.#connectedPeers.size < this.#config.maxPeers()
					});
					const onPeerConnected = (event) => {
						this.#connectingPeers.delete(event.peerId);
						this.#addConnectedPeer(event.peerId, event.connection, event.channel, url);
					};
					const onPeerConnectFailed = (event) => {
						if (this.#connectingPeers.has(event.peerId)) {
							this.#connectingPeers.delete(event.peerId);
							this.#eventTarget.dispatchEvent("peerConnectFailed", {
								peerId: event.peerId,
								trackerUrl: url,
								error: event.error
							});
						}
					};
					const onWarning = (warning) => {
						this.#eventTarget.dispatchEvent("warning", {
							trackerUrl: url,
							warning
						});
					};
					const onError = (error) => {
						this.#eventTarget.dispatchEvent("error", {
							trackerUrl: url,
							error
						});
					};
					client.addEventListener("peerConnected", onPeerConnected);
					client.addEventListener("peerConnectFailed", onPeerConnectFailed);
					client.addEventListener("warning", onWarning);
					client.addEventListener("error", onError);
					const cleanupListeners = () => {
						client.removeEventListener("peerConnected", onPeerConnected);
						client.removeEventListener("peerConnectFailed", onPeerConnectFailed);
						client.removeEventListener("warning", onWarning);
						client.removeEventListener("error", onError);
					};
					this.#clients.add({
						client,
						releaseSocket: release,
						cleanupListeners
					});
					addedToClients = true;
					client.start();
				} catch (error) {
					if (!addedToClients) release();
					throw error;
				}
			}
		} catch (error) {
			this.destroy();
			throw error;
		}
	}
	destroy() {
		if (this.#destroyed) return;
		this.#destroyed = true;
		for (const { client, releaseSocket, cleanupListeners } of this.#clients) {
			cleanupListeners();
			client.destroy();
			releaseSocket();
		}
		this.#clients.clear();
		this.#connectingPeers.clear();
		const connectedSnapshot = [...this.#connectedPeers.entries()];
		this.#connectedPeers.clear();
		for (const [peerId, peer] of connectedSnapshot) {
			peer.cleanup();
			try {
				peer.channel.close();
			} catch {}
			try {
				peer.connection.close();
			} catch {}
			this.#eventTarget.dispatchEvent("peerDisconnected", {
				peerId,
				trackerUrl: peer.trackerUrl,
				disconnectReason: "Manager destroyed"
			});
		}
		this.#eventTarget.clear();
	}
	#closePeer(peerId, cause) {
		if (this.#destroyed) return;
		const connected = this.#connectedPeers.get(peerId);
		if (!connected) return;
		this.#connectedPeers.delete(peerId);
		connected.cleanup();
		try {
			connected.channel.close();
		} catch {}
		try {
			connected.connection.close();
		} catch {}
		this.#eventTarget.dispatchEvent("peerDisconnected", {
			peerId,
			trackerUrl: connected.trackerUrl,
			...cause
		});
	}
	#addConnectedPeer(peerId, connection, channel, trackerUrl) {
		if (isTerminalConnectionState(connection.iceConnectionState)) {
			try {
				connection.close();
			} catch {}
			this.#eventTarget.dispatchEvent("peerConnectFailed", {
				peerId,
				trackerUrl,
				error: new PeerConnectError("connection-failed", "Connection failed during promotion")
			});
			return;
		}
		const onDisconnect = (cause) => this.#closePeer(peerId, cause);
		const onIceConnectionStateChange = () => {
			if (isTerminalConnectionState(connection.iceConnectionState)) onDisconnect({ error: new PeerError("connection-lost", `ICE connection state became ${connection.iceConnectionState}`) });
		};
		const onChannelClose = () => onDisconnect({ disconnectReason: "Data channel closed" });
		const onChannelClosing = () => onDisconnect({ disconnectReason: "Data channel closing" });
		const onChannelError = (event) => {
			const msg = getRTCErrorMessage(event, "Data channel error");
			onDisconnect({ error: new PeerError("transport-error", `Data channel error: ${msg}`) });
		};
		let closeRef = (error) => this.#closePeer(peerId, error ? { error } : { disconnectReason: "Closed by consumer" });
		const cleanup = () => {
			closeRef = null;
			connection.removeEventListener("iceconnectionstatechange", onIceConnectionStateChange);
			channel.removeEventListener("close", onChannelClose);
			channel.removeEventListener("closing", onChannelClosing);
			channel.removeEventListener("error", onChannelError);
		};
		this.#connectedPeers.set(peerId, {
			connection,
			channel,
			trackerUrl,
			cleanup
		});
		connection.addEventListener("iceconnectionstatechange", onIceConnectionStateChange);
		channel.addEventListener("close", onChannelClose);
		channel.addEventListener("closing", onChannelClosing);
		channel.addEventListener("error", onChannelError);
		this.#eventTarget.dispatchEvent("peerConnected", {
			peerId,
			connection,
			channel,
			trackerUrl,
			close: (error) => closeRef?.(error)
		});
	}
};
//#endregion
//#region src/utils/stream.ts
function getSegmentFromStreamsMap(streams, segmentRuntimeId) {
	for (const stream of streams.values()) {
		const segment = stream.segments.get(segmentRuntimeId);
		if (segment) return segment;
	}
}
function getSegmentFromStreamByExternalId(stream, segmentExternalId) {
	for (const segment of stream.segments.values()) if (segment.externalId === segmentExternalId) return segment;
}
function getSegmentAvgDuration(stream) {
	const { segments } = stream;
	let sumDuration = 0;
	const { size } = segments;
	if (size === 0) return 0;
	for (const segment of segments.values()) {
		const duration = segment.endTime - segment.startTime;
		sumDuration += duration;
	}
	return sumDuration / size;
}
function calculateTimeWindows(timeWindowsConfig, availableMemoryInPercent) {
	const { highDemandTimeWindow, httpDownloadTimeWindow, p2pDownloadTimeWindow } = timeWindowsConfig;
	const result = {
		highDemandTimeWindow,
		httpDownloadTimeWindow,
		p2pDownloadTimeWindow
	};
	if (availableMemoryInPercent <= 5) {
		result.httpDownloadTimeWindow = 0;
		result.p2pDownloadTimeWindow = 0;
	} else if (availableMemoryInPercent <= 10) result.p2pDownloadTimeWindow = result.httpDownloadTimeWindow;
	return result;
}
function getSegmentPlaybackStatuses(segment, playback, timeWindowsConfig, currentP2PLoader, availableMemoryPercent) {
	const { highDemandTimeWindow, httpDownloadTimeWindow, p2pDownloadTimeWindow } = calculateTimeWindows(timeWindowsConfig, availableMemoryPercent);
	return {
		isHighDemand: isSegmentInTimeWindow(segment, playback, highDemandTimeWindow),
		isHttpDownloadable: isSegmentInTimeWindow(segment, playback, httpDownloadTimeWindow),
		isP2PDownloadable: isSegmentInTimeWindow(segment, playback, p2pDownloadTimeWindow) && currentP2PLoader.isSegmentLoadingOrLoadedBySomeone(segment)
	};
}
function isSegmentInTimeWindow(segment, playback, timeWindowLength) {
	const { startTime, endTime } = segment;
	const { position, rate } = playback;
	return !(position + timeWindowLength * rate < startTime || position > endTime);
}
//#endregion
//#region src/p2p/loader.ts
var MIN_CHURN_CLEANUP_INTERVAL_MS = 1e3;
var P2PLoader = class {
	#webtorrentManager;
	#peersMap = /* @__PURE__ */ new Map();
	#isAnnounceMicrotaskCreated = false;
	#webtorrentManagerLogger = (0, import_browser.default)("p2pml-core:webtorrent-manager");
	#churnLogger = (0, import_browser.default)("p2pml-core:churn-cleanup");
	#stream;
	#requests;
	#segmentStorage;
	#config;
	#webTorrentSocketPool;
	#eventTarget;
	#onSegmentAnnouncement;
	#churnCleanupTimeoutId;
	#onPeerConnect;
	#onPeerConnectError;
	#onPeerClose;
	#onPeerError;
	#onPeerWarning;
	#onTrackerWarning;
	#onTrackerError;
	constructor(stream, requests, segmentStorage, config, webTorrentSocketPool, eventTarget, peerId, onSegmentAnnouncement) {
		this.#stream = stream;
		this.#requests = requests;
		this.#segmentStorage = segmentStorage;
		this.#config = config;
		this.#webTorrentSocketPool = webTorrentSocketPool;
		this.#eventTarget = eventTarget;
		this.#onSegmentAnnouncement = onSegmentAnnouncement;
		this.#onPeerConnect = eventTarget.getEventDispatcher("onPeerConnect");
		this.#onPeerConnectError = eventTarget.getEventDispatcher("onPeerConnectError");
		this.#onPeerClose = eventTarget.getEventDispatcher("onPeerClose");
		this.#onPeerError = eventTarget.getEventDispatcher("onPeerError");
		this.#onPeerWarning = eventTarget.getEventDispatcher("onPeerWarning");
		this.#onTrackerWarning = eventTarget.getEventDispatcher("onTrackerWarning");
		this.#onTrackerError = eventTarget.getEventDispatcher("onTrackerError");
		this.#webtorrentManager = new WebTorrentManager({
			infoHash: this.#stream.infoHash,
			peerId,
			trackerUrls: this.#config.announceTrackers,
			rtcConfig: () => this.#config.rtcConfig,
			socketPool: this.#webTorrentSocketPool,
			maxPeers: () => this.#config.p2pMaxPeers,
			maxPeersMultiplier: () => this.#config.p2pChurnMaxPeersMultiplier,
			offersCount: () => this.#config.webRtcOffersCount,
			offerTimeout: () => this.#config.webRtcOfferTimeoutMs,
			iceGatheringTimeout: () => this.#config.webRtcIceGatheringTimeoutMs,
			connectionTimeout: () => this.#config.webRtcConnectionTimeoutMs
		});
		this.#webtorrentManager.addEventListener("peerConnected", this.#onPeerConnectedWebTorrent);
		this.#webtorrentManager.addEventListener("peerDisconnected", this.#onPeerDisconnectedWebTorrent);
		this.#webtorrentManager.addEventListener("peerConnectFailed", (event) => {
			this.#webtorrentManagerLogger(`Peer connection failed (${event.peerId}) from tracker ${event.trackerUrl}:`, event.error);
			this.#onPeerConnectError({
				peerId: event.peerId,
				infoHash: this.#stream.infoHash,
				streamType: this.#stream.type,
				trackerUrl: event.trackerUrl,
				error: event.error
			});
		});
		this.#webtorrentManager.addEventListener("warning", (event) => {
			this.#webtorrentManagerLogger(`Tracker warning (${event.trackerUrl}):`, event.warning);
			this.#onTrackerWarning({
				trackerUrl: event.trackerUrl,
				infoHash: this.#stream.infoHash,
				streamType: this.#stream.type,
				warning: event.warning
			});
		});
		this.#webtorrentManager.addEventListener("error", (event) => {
			this.#webtorrentManagerLogger(`Tracker error (${event.trackerUrl}):`, event.error);
			this.#onTrackerError({
				trackerUrl: event.trackerUrl,
				infoHash: this.#stream.infoHash,
				streamType: this.#stream.type,
				error: event.error
			});
		});
		this.#eventTarget.addEventListener(`onStorageUpdated-${this.#stream.streamSwarmId}`, this.broadcastAnnouncement);
		this.#webtorrentManager.start();
		this.#churnCleanupTimeoutId = setTimeout(this.#churnCleanup, Math.max(MIN_CHURN_CLEANUP_INTERVAL_MS, this.#config.p2pChurnCleanupIntervalMs));
	}
	#churnCleanup = () => {
		this.#churnCleanupTimeoutId = setTimeout(this.#churnCleanup, Math.max(MIN_CHURN_CLEANUP_INTERVAL_MS, this.#config.p2pChurnCleanupIntervalMs));
		const excessPeersCount = this.#peersMap.size - this.#config.p2pMaxPeers;
		if (excessPeersCount <= 0) return;
		const eligiblePeers = [];
		const now = performance.now();
		for (const peer of this.#peersMap.values()) {
			if (peer.downloadingSegment || peer.isUploadingSegment) continue;
			if (now - peer.connectedAt < this.#config.p2pChurnGracePeriodMs) continue;
			eligiblePeers.push(peer);
		}
		if (eligiblePeers.length === 0) return;
		eligiblePeers.sort((a, b) => {
			return a.getDownloadBandwidth() - b.getDownloadBandwidth() || a.connectedAt - b.connectedAt;
		});
		const peersToDrop = eligiblePeers.slice(0, excessPeersCount);
		this.#churnLogger(`Background churn cleanup: dropping ${peersToDrop.length} excess peers (total: ${this.#peersMap.size}, target: ${this.#config.p2pMaxPeers}, eligible: ${eligiblePeers.length})`);
		for (const peer of peersToDrop) {
			this.#churnLogger(`dropping excess peer ${peer.id} with bandwidth ${peer.getDownloadBandwidth()}`);
			peer.destroy();
		}
	};
	downloadSegment(segment) {
		const peersWithSegment = [];
		for (const peer of this.#peersMap.values()) if (!peer.downloadingSegment && peer.getSegmentStatus(segment) === "loaded") peersWithSegment.push(peer);
		if (peersWithSegment.length === 0) return;
		const selectedPeer = selectPeerForDownload(peersWithSegment);
		const request = this.#requests.getOrCreateRequest(segment);
		selectedPeer.downloadSegment(request);
	}
	isSegmentLoadingOrLoadedBySomeone(segment) {
		for (const peer of this.#peersMap.values()) if (peer.getSegmentStatus(segment)) return true;
		return false;
	}
	isSegmentLoadedBySomeone(segment) {
		for (const peer of this.#peersMap.values()) if (peer.getSegmentStatus(segment) === "loaded") return true;
		return false;
	}
	get connectedPeerCount() {
		return this.#peersMap.size;
	}
	*peers() {
		for (const peer of this.#peersMap.values()) yield peer;
	}
	#getSegmentsAnnouncement() {
		const loaded = this.#segmentStorage.getStoredSegmentIds(this.#stream.swarmId, this.#stream.streamSwarmId);
		const httpLoading = [];
		for (const request of this.#requests.httpRequests()) {
			const segment = this.#stream.segments.get(request.segment.runtimeId);
			if (!segment) continue;
			httpLoading.push(segment.externalId);
		}
		return {
			loaded,
			httpLoading
		};
	}
	#onPeerConnectedWebTorrent = (event) => {
		this.#webtorrentManagerLogger(`peerConnected: peerId=${event.peerId}`);
		if (this.#peersMap.has(event.peerId)) {
			event.close();
			return;
		}
		const peer = new Peer(event.peerId, event.channel, event.close, {
			onSegmentRequested: (peer, segmentExternalId, requestId, byteFrom) => {
				this.#onSegmentRequested(peer, segmentExternalId, requestId, byteFrom).catch((error) => {
					this.#webtorrentManagerLogger(`Error in onSegmentRequested ${segmentExternalId} for peer ${peer.id}:`, error);
				});
			},
			onSegmentsAnnouncement: this.#onSegmentAnnouncement,
			onWarning: (warning) => {
				this.#onPeerWarning({
					peerId: peer.id,
					infoHash: this.#stream.infoHash,
					streamType: this.#stream.type,
					trackerUrl: event.trackerUrl,
					warning
				});
			}
		}, {
			p2pNotReceivingBytesTimeoutMs: this.#config.p2pNotReceivingBytesTimeoutMs,
			webRtcMaxMessageSize: this.#config.webRtcMaxMessageSize,
			p2pErrorRetries: this.#config.p2pErrorRetries,
			validateP2PSegment: this.#config.validateP2PSegment,
			streamType: this.#stream.type,
			infoHash: this.#stream.infoHash
		}, this.#eventTarget);
		this.#peersMap.set(event.peerId, peer);
		this.#onPeerConnect({
			peerId: event.peerId,
			infoHash: this.#stream.infoHash,
			streamType: this.#stream.type,
			trackerUrl: event.trackerUrl
		});
		if (this.#config.isP2PUploadDisabled) return;
		const { httpLoading, loaded } = this.#getSegmentsAnnouncement();
		peer.sendSegmentsAnnouncementCommand(loaded, httpLoading);
	};
	#onPeerDisconnectedWebTorrent = (event) => {
		this.#webtorrentManagerLogger("peerDisconnected: peerId=%s error=%s reason=%s", event.peerId, event.error?.message, event.disconnectReason);
		const peer = this.#peersMap.get(event.peerId);
		if (!peer) return;
		this.#peersMap.delete(event.peerId);
		peer.destroy(true);
		if (event.error) this.#onPeerError({
			peerId: event.peerId,
			infoHash: this.#stream.infoHash,
			streamType: this.#stream.type,
			trackerUrl: event.trackerUrl,
			error: event.error
		});
		this.#onPeerClose({
			peerId: peer.id,
			infoHash: this.#stream.infoHash,
			streamType: this.#stream.type,
			trackerUrl: event.trackerUrl
		});
	};
	broadcastAnnouncement = (sendEmptyAnnouncement = false) => {
		if (sendEmptyAnnouncement) {
			this.#sendSegmentsAnnouncement(sendEmptyAnnouncement);
			return;
		}
		if (this.#isAnnounceMicrotaskCreated || this.#config.isP2PUploadDisabled) return;
		this.#sendSegmentsAnnouncement();
	};
	#sendSegmentsAnnouncement = (sendEmptyAnnouncement = false) => {
		this.#isAnnounceMicrotaskCreated = true;
		queueMicrotask(() => {
			const { loaded = [], httpLoading = [] } = sendEmptyAnnouncement ? {} : this.#getSegmentsAnnouncement();
			for (const peer of this.#peersMap.values()) peer.sendSegmentsAnnouncementCommand(loaded, httpLoading);
			this.#isAnnounceMicrotaskCreated = false;
		});
	};
	#onSegmentRequested = async (peer, segmentExternalId, requestId, byteFrom) => {
		const segment = getSegmentFromStreamByExternalId(this.#stream, segmentExternalId);
		if (!segment) return;
		if (this.#config.isP2PUploadDisabled) {
			peer.sendSegmentAbsentCommand(segmentExternalId, requestId);
			return;
		}
		let segmentData;
		try {
			segmentData = await this.#segmentStorage.getSegmentData(this.#stream.swarmId, this.#stream.streamSwarmId, segment.externalId);
		} catch (error) {
			this.#webtorrentManagerLogger(`Storage error for segment ${segmentExternalId} requested by peer ${peer.id}:`, error);
		}
		if (!this.#peersMap.has(peer.id)) return;
		if (!segmentData) {
			peer.sendSegmentAbsentCommand(segmentExternalId, requestId);
			return;
		}
		await peer.uploadSegmentData(segment, requestId, byteFrom !== void 0 ? new Uint8Array(segmentData).subarray(byteFrom) : segmentData);
	};
	destroy() {
		clearTimeout(this.#churnCleanupTimeoutId);
		this.#churnCleanupTimeoutId = void 0;
		this.#eventTarget.removeEventListener(`onStorageUpdated-${this.#stream.streamSwarmId}`, this.broadcastAnnouncement);
		this.#webtorrentManager.destroy();
		for (const peer of this.#peersMap.values()) peer.destroy();
		this.#peersMap.clear();
	}
};
function selectPeerForDownload(peersWithSegment) {
	if (peersWithSegment.length === 1) return peersWithSegment[0];
	let maxSpeed = 0;
	for (const peer of peersWithSegment) {
		const speed = peer.getDownloadBandwidth();
		if (speed > maxSpeed) maxSpeed = speed;
	}
	if (maxSpeed > 0) {
		const baseSpeed = Math.max(1, maxSpeed * .1);
		let unprovenPeersCount = 0;
		let provenPeersWeight = 0;
		for (const peer of peersWithSegment) if (peer.getDownloadBandwidth() <= baseSpeed) unprovenPeersCount++;
		else provenPeersWeight += peer.getDownloadBandwidth();
		let adjustedBaseSpeed = baseSpeed;
		if (unprovenPeersCount > 0 && provenPeersWeight > 0 && unprovenPeersCount * baseSpeed > provenPeersWeight) adjustedBaseSpeed = provenPeersWeight / unprovenPeersCount;
		return getWeightedRandomItem(peersWithSegment, (peer) => Math.max(peer.getDownloadBandwidth(), adjustedBaseSpeed));
	} else return getRandomItem(peersWithSegment);
}
//#endregion
//#region src/utils/logger.ts
function getStreamString(stream) {
	return `${stream.type}-${stream.identityHash}`;
}
function getSegmentString(segment) {
	const { externalId } = segment;
	return `(${getStreamString(segment.stream)} | ${externalId})`;
}
//#endregion
//#region src/p2p/loaders-container.ts
var P2PLoadersContainer = class {
	#loaders = /* @__PURE__ */ new Map();
	#currentLoaderItem;
	#logger = (0, import_browser.default)("p2pml-core:p2p-loaders-container");
	#requests;
	#segmentStorage;
	#config;
	#webTorrentSocketPool;
	#eventTarget;
	#peerId;
	#onSegmentAnnouncement;
	constructor(stream, requests, segmentStorage, config, webTorrentSocketPool, eventTarget, peerId, onSegmentAnnouncement) {
		this.#requests = requests;
		this.#segmentStorage = segmentStorage;
		this.#config = config;
		this.#webTorrentSocketPool = webTorrentSocketPool;
		this.#eventTarget = eventTarget;
		this.#peerId = peerId;
		this.#onSegmentAnnouncement = onSegmentAnnouncement;
		this.#currentLoaderItem = this.#findOrCreateLoaderForStream(stream);
		this.#logger(`set current p2p loader: ${getStreamString(stream)}`);
	}
	#createLoader(stream) {
		if (this.#loaders.has(stream.runtimeId)) throw new Error("Loader for this stream already exists");
		const loader = new P2PLoader(stream, this.#requests, this.#segmentStorage, this.#config, this.#webTorrentSocketPool, this.#eventTarget, this.#peerId, () => {
			if (this.#currentLoaderItem.loader === loader) this.#onSegmentAnnouncement();
		});
		const loggerInfo = getStreamString(stream);
		this.#logger(`created new loader: ${loggerInfo}`);
		return {
			loader,
			stream,
			loggerInfo
		};
	}
	#findOrCreateLoaderForStream(stream) {
		const loaderItem = this.#loaders.get(stream.runtimeId);
		if (loaderItem) {
			clearTimeout(loaderItem.destroyTimeoutId);
			loaderItem.destroyTimeoutId = void 0;
			return loaderItem;
		} else {
			const loader = this.#createLoader(stream);
			this.#loaders.set(stream.runtimeId, loader);
			return loader;
		}
	}
	changeCurrentLoader(stream) {
		const currentStream = this.#currentLoaderItem.stream;
		if (!this.#segmentStorage.getStoredSegmentIds(currentStream.swarmId, currentStream.streamSwarmId).length) this.#destroyAndRemoveLoader(this.#currentLoaderItem);
		else this.#setLoaderDestroyTimeout(this.#currentLoaderItem);
		this.#currentLoaderItem = this.#findOrCreateLoaderForStream(stream);
		this.#logger(`change current p2p loader: ${getStreamString(stream)}`);
	}
	#setLoaderDestroyTimeout(item) {
		item.destroyTimeoutId = window.setTimeout(() => this.#destroyAndRemoveLoader(item), this.#config.p2pInactiveLoaderDestroyTimeoutMs);
	}
	#destroyAndRemoveLoader(item) {
		item.loader.destroy();
		this.#loaders.delete(item.stream.runtimeId);
		this.#logger(`destroy p2p loader: `, item.loggerInfo);
	}
	get currentLoader() {
		return this.#currentLoaderItem.loader;
	}
	destroy() {
		for (const { loader, destroyTimeoutId } of this.#loaders.values()) {
			loader.destroy();
			clearTimeout(destroyTimeoutId);
		}
		this.#loaders.clear();
	}
};
//#endregion
//#region src/requests/request.ts
function mapSegmentWithStreamToSegment(segment) {
	return {
		runtimeId: segment.runtimeId,
		externalId: segment.externalId,
		url: segment.url,
		byteRange: segment.byteRange && { ...segment.byteRange },
		startTime: segment.startTime,
		endTime: segment.endTime
	};
}
var Request$1 = class {
	segment;
	requestProcessQueueCallback;
	bandwidthCalculators;
	playback;
	playbackConfig;
	infoHash;
	currentAttempt;
	_failedAttempts = new FailedRequestAttempts();
	finalData;
	bytes = [];
	_loadedBytes = 0;
	_totalBytes;
	_status = "not-started";
	progress;
	notReceivingBytesTimeout;
	_onAbortCallback;
	notReceivingBytesTimeoutMs;
	_logger;
	_isHandledByProcessQueue = false;
	onSegmentError;
	onSegmentAbort;
	onSegmentStart;
	onSegmentLoaded;
	constructor(segment, requestProcessQueueCallback, bandwidthCalculators, playback, playbackConfig, eventTarget, infoHash) {
		this.segment = segment;
		this.requestProcessQueueCallback = requestProcessQueueCallback;
		this.bandwidthCalculators = bandwidthCalculators;
		this.playback = playback;
		this.playbackConfig = playbackConfig;
		this.infoHash = infoHash;
		this.onSegmentError = eventTarget.getEventDispatcher("onSegmentError");
		this.onSegmentAbort = eventTarget.getEventDispatcher("onSegmentAbort");
		this.onSegmentStart = eventTarget.getEventDispatcher("onSegmentStart");
		this.onSegmentLoaded = eventTarget.getEventDispatcher("onSegmentLoaded");
		const { byteRange } = this.segment;
		if (byteRange) {
			const { end, start } = byteRange;
			this._totalBytes = end - start + 1;
		}
		this.notReceivingBytesTimeout = new Timeout(this.abortOnTimeout);
		const { type } = this.segment.stream;
		this._logger = (0, import_browser.default)(`p2pml-core:request-${type}`);
	}
	clearLoadedBytes() {
		this._loadedBytes = 0;
		this.bytes = [];
		this._totalBytes = void 0;
		this.finalData = void 0;
	}
	get status() {
		return this._status;
	}
	setStatus(status) {
		this._status = status;
		this._isHandledByProcessQueue = false;
	}
	get downloadSource() {
		return this.currentAttempt?.downloadSource;
	}
	get loadedBytes() {
		return this._loadedBytes;
	}
	get totalBytes() {
		return this._totalBytes;
	}
	get data() {
		this.finalData ??= joinChunks(this.bytes).buffer;
		return this.finalData;
	}
	get failedAttempts() {
		return this._failedAttempts;
	}
	get isHandledByProcessQueue() {
		return this._isHandledByProcessQueue;
	}
	markHandledByProcessQueue() {
		this._isHandledByProcessQueue = true;
	}
	setTotalBytes(value) {
		if (this._totalBytes !== void 0) throw new Error("Request total bytes value is already set");
		this._totalBytes = value;
	}
	/**
	* Checks if all bytes are already loaded and, if so, starts, validates,
	* and completes the request without making a network request.
	*
	* Handles three cases:
	* - loadedBytes === totalBytes: start → validate → complete (returns true)
	* - loadedBytes > totalBytes: corrupted state → clearLoadedBytes (returns false)
	* - otherwise: no-op (returns false)
	*
	* The request is started synchronously so that processQueue sees
	* it as "loading" immediately. Validation runs as fire-and-forget.
	*
	* @returns true if the request was started and is being handled,
	* false if caller should proceed with a normal download.
	*/
	tryCompleteByLoadedBytes(requestData, controls, validate, validationErrorType) {
		if (!this._totalBytes) return false;
		if (this._loadedBytes > this._totalBytes) {
			this.logger(`${requestData.downloadSource} ${this.segment.externalId} loaded bytes overflow: ${this._loadedBytes} > ${this._totalBytes}, clearing`);
			this.clearLoadedBytes();
			return false;
		}
		if (this._loadedBytes !== this._totalBytes) return false;
		const requestControls = this.start(requestData, controls);
		this.notReceivingBytesTimeout.clear();
		if (validate) this.validateAndComplete(requestData.downloadSource, requestControls, validate, validationErrorType);
		else requestControls.completeOnSuccess();
		return true;
	}
	async validateData(validate) {
		if (!validate) return true;
		try {
			return await validate(this.segment.url, this.segment.byteRange, this.data);
		} catch (err) {
			this.logger(`validation threw an error: ${String(err)}`);
			return false;
		}
	}
	async validateAndComplete(downloadSource, requestControls, validate, validationErrorType) {
		const isValid = await this.validateData(validate);
		if (this._status !== "loading") return;
		if (!isValid) {
			this.logger(`${downloadSource} ${this.segment.externalId} validation failed for already-loaded bytes, clearing`);
			this.clearLoadedBytes();
			requestControls.failWithError(new RequestError(validationErrorType));
			return;
		}
		this.logger(`${downloadSource} ${this.segment.externalId} validation passed for already-loaded bytes`);
		requestControls.completeOnSuccess();
	}
	start(requestData, controls) {
		if (this._status === "succeed") throw new Error(`Request ${this.segment.externalId} has been already succeed.`);
		if (this._status === "loading") throw new Error(`Request ${this.segment.externalId} has been already started.`);
		this.setStatus("loading");
		this.currentAttempt = { ...requestData };
		this.progress = {
			startFromByte: this._loadedBytes,
			loadedBytes: 0,
			startTimestamp: performance.now()
		};
		this.manageBandwidthCalculatorsState("start");
		const { notReceivingBytesTimeoutMs } = controls;
		this._onAbortCallback = controls.onAbort;
		this.notReceivingBytesTimeoutMs = notReceivingBytesTimeoutMs;
		if (notReceivingBytesTimeoutMs !== void 0) this.notReceivingBytesTimeout.start(notReceivingBytesTimeoutMs);
		this.logger(`${requestData.downloadSource} ${this.segment.externalId} started`);
		this.onSegmentStart({
			segment: mapSegmentWithStreamToSegment(this.segment),
			downloadSource: requestData.downloadSource,
			peerId: requestData.downloadSource === "p2p" ? requestData.peerId : void 0,
			infoHash: this.infoHash,
			streamType: this.segment.stream.type
		});
		return {
			firstBytesReceived: this.firstBytesReceived,
			addLoadedChunk: this.addLoadedChunk,
			completeOnSuccess: this.completeOnSuccess,
			failWithError: this.failWithError
		};
	}
	cancel() {
		this.throwErrorIfNotLoadingStatus();
		this.setStatus("aborted");
		this.logger(`${this.currentAttempt?.downloadSource} ${this.segment.externalId} aborted`);
		this._onAbortCallback?.(new RequestError("abort"));
		this.onSegmentAbort({
			segment: mapSegmentWithStreamToSegment(this.segment),
			downloadSource: this.currentAttempt?.downloadSource,
			peerId: this.currentAttempt?.downloadSource === "p2p" ? this.currentAttempt.peerId : void 0,
			infoHash: this.infoHash,
			streamType: this.segment.stream.type
		});
		this._onAbortCallback = void 0;
		this.manageBandwidthCalculatorsState("stop");
		this.notReceivingBytesTimeout.clear();
	}
	abortOnTimeout = () => {
		this.throwErrorIfNotLoadingStatus();
		if (!this.currentAttempt || !this.progress || this.notReceivingBytesTimeoutMs === void 0) return;
		const msSinceLastActive = performance.now() - (this.progress.lastLoadedChunkTimestamp ?? this.progress.startTimestamp);
		if (msSinceLastActive < this.notReceivingBytesTimeoutMs) {
			this.notReceivingBytesTimeout.restart(this.notReceivingBytesTimeoutMs - msSinceLastActive);
			return;
		}
		const error = new RequestError("bytes-receiving-timeout");
		this._onAbortCallback?.(error);
		this.handleFailure(error);
	};
	failWithError = (error) => {
		this.throwErrorIfNotLoadingStatus();
		if (!this.currentAttempt) return;
		this.handleFailure(error);
	};
	handleFailure = (error) => {
		if (!this.currentAttempt) return;
		this.setStatus("failed");
		this.logger(`${this.downloadSource} ${this.segment.externalId} failed ${error.type}`);
		this._failedAttempts.add({
			...this.currentAttempt,
			error
		});
		this.onSegmentError({
			segment: mapSegmentWithStreamToSegment(this.segment),
			error,
			downloadSource: this.currentAttempt.downloadSource,
			peerId: this.currentAttempt.downloadSource === "p2p" ? this.currentAttempt.peerId : void 0,
			infoHash: this.infoHash,
			streamType: this.segment.stream.type
		});
		this.notReceivingBytesTimeout.clear();
		this.manageBandwidthCalculatorsState("stop");
		this.requestProcessQueueCallback();
	};
	completeOnSuccess = () => {
		this.throwErrorIfNotLoadingStatus();
		if (!this.currentAttempt) return;
		this.manageBandwidthCalculatorsState("stop");
		this.notReceivingBytesTimeout.clear();
		this.setStatus("succeed");
		this._totalBytes = this._loadedBytes;
		this.onSegmentLoaded({
			segment: mapSegmentWithStreamToSegment(this.segment),
			bytesLength: this.data.byteLength,
			downloadSource: this.currentAttempt.downloadSource,
			peerId: this.currentAttempt.downloadSource === "p2p" ? this.currentAttempt.peerId : void 0,
			infoHash: this.infoHash,
			streamType: this.segment.stream.type
		});
		this.logger(`${this.currentAttempt.downloadSource} ${this.segment.externalId} succeed`);
		this.requestProcessQueueCallback();
	};
	addLoadedChunk = (chunk) => {
		this.throwErrorIfNotLoadingStatus();
		if (!this.currentAttempt || !this.progress) return;
		const { byteLength } = chunk;
		const { all: allBC, http: httpBC } = this.bandwidthCalculators;
		allBC.addBytes(byteLength);
		if (this.currentAttempt.downloadSource === "http") httpBC.addBytes(byteLength);
		this.bytes.push(chunk);
		this.progress.lastLoadedChunkTimestamp = performance.now();
		this.progress.loadedBytes += byteLength;
		this._loadedBytes += byteLength;
	};
	firstBytesReceived = () => {
		this.throwErrorIfNotLoadingStatus();
	};
	throwErrorIfNotLoadingStatus() {
		if (this._status !== "loading") throw new Error(`Request has been already ${this.status}.`);
	}
	logger(message) {
		this._logger.color = this.currentAttempt?.downloadSource === "http" ? "green" : "red";
		this._logger(message);
		this._logger.color = "";
	}
	manageBandwidthCalculatorsState(state) {
		const { all, http } = this.bandwidthCalculators;
		const method = state === "start" ? "startLoading" : "stopLoading";
		if (this.currentAttempt?.downloadSource === "http") http[method]();
		all[method]();
	}
};
var FailedRequestAttempts = class {
	attempts = [];
	add(attempt) {
		this.attempts.push(attempt);
	}
	get httpAttemptsCount() {
		return this.attempts.reduce((sum, attempt) => attempt.downloadSource === "http" ? sum + 1 : sum, 0);
	}
	get p2pAttemptsCount() {
		return this.attempts.reduce((sum, attempt) => attempt.downloadSource === "p2p" ? sum + 1 : sum, 0);
	}
	get lastAttempt() {
		return this.attempts[this.attempts.length - 1];
	}
	clear() {
		this.attempts = [];
	}
};
var Timeout = class {
	action;
	timeoutId;
	ms;
	constructor(action) {
		this.action = action;
	}
	start(ms) {
		if (this.timeoutId) throw new Error("Timeout is already started.");
		this.ms = ms;
		this.timeoutId = window.setTimeout(this.action, this.ms);
	}
	restart(ms) {
		this.clear();
		if (ms !== void 0) this.ms = ms;
		if (this.ms === void 0) return;
		this.timeoutId = window.setTimeout(this.action, this.ms);
	}
	clear() {
		clearTimeout(this.timeoutId);
		this.timeoutId = void 0;
	}
};
//#endregion
//#region src/requests/request-container.ts
var RequestsContainer = class {
	requestProcessQueueCallback;
	bandwidthCalculators;
	playback;
	config;
	eventTarget;
	requests = /* @__PURE__ */ new Map();
	constructor(requestProcessQueueCallback, bandwidthCalculators, playback, config, eventTarget) {
		this.requestProcessQueueCallback = requestProcessQueueCallback;
		this.bandwidthCalculators = bandwidthCalculators;
		this.playback = playback;
		this.config = config;
		this.eventTarget = eventTarget;
	}
	get executingHttpCount() {
		let count = 0;
		for (const request of this.httpRequests()) if (request.status === "loading") count++;
		return count;
	}
	get executingP2PCount() {
		let count = 0;
		for (const request of this.p2pRequests()) if (request.status === "loading") count++;
		return count;
	}
	get(segment) {
		return this.requests.get(segment);
	}
	getOrCreateRequest(segment) {
		let request = this.requests.get(segment);
		if (!request) {
			request = new Request$1(segment, this.requestProcessQueueCallback, this.bandwidthCalculators, this.playback, this.config, this.eventTarget, segment.stream.infoHash);
			this.requests.set(segment, request);
		}
		return request;
	}
	remove(request) {
		this.requests.delete(request.segment);
	}
	items() {
		return this.requests.values();
	}
	*httpRequests() {
		for (const request of this.requests.values()) if (request.downloadSource === "http") yield request;
	}
	*p2pRequests() {
		for (const request of this.requests.values()) if (request.downloadSource === "p2p") yield request;
	}
	destroy() {
		for (const request of this.requests.values()) {
			if (request.status !== "loading") continue;
			request.cancel();
		}
		this.requests.clear();
	}
};
//#endregion
//#region src/requests/engine-request.ts
var EngineRequest = class {
	segment;
	engineCallbacks;
	_status = "pending";
	_shouldBeStartedImmediately = false;
	constructor(segment, engineCallbacks) {
		this.segment = segment;
		this.engineCallbacks = engineCallbacks;
	}
	get status() {
		return this._status;
	}
	get shouldBeStartedImmediately() {
		return this._shouldBeStartedImmediately;
	}
	resolve(data, bandwidth) {
		if (this._status !== "pending") return;
		this._status = "succeed";
		this.engineCallbacks.onSuccess({
			data,
			bandwidth
		});
	}
	reject() {
		if (this._status !== "pending") return;
		this._status = "failed";
		this.engineCallbacks.onError(new CoreRequestError("failed"));
	}
	abort() {
		if (this._status !== "pending") return;
		this._status = "aborted";
		this.engineCallbacks.onError(new CoreRequestError("aborted"));
	}
	markAsShouldBeStartedImmediately() {
		this._shouldBeStartedImmediately = true;
	}
};
//#endregion
//#region src/utils/queue.ts
function* generateQueue(lastRequestedSegment, playback, playbackConfig, currentP2PLoader, availablePercentMemory) {
	const { runtimeId, stream } = lastRequestedSegment;
	const requestedSegment = stream.segments.get(runtimeId);
	if (!requestedSegment) return;
	const queueSegments = stream.segments.values();
	let first;
	do {
		const next = queueSegments.next();
		if (next.done) return;
		first = next.value;
	} while (first !== requestedSegment);
	const firstStatuses = getSegmentPlaybackStatuses(first, playback, playbackConfig, currentP2PLoader, availablePercentMemory);
	if (isNotActualStatuses(firstStatuses)) {
		const next = queueSegments.next();
		if (next.done) return;
		const second = next.value;
		const secondStatuses = getSegmentPlaybackStatuses(second, playback, playbackConfig, currentP2PLoader, availablePercentMemory);
		if (isNotActualStatuses(secondStatuses)) return;
		firstStatuses.isHighDemand = true;
		yield {
			segment: first,
			statuses: firstStatuses
		};
		yield {
			segment: second,
			statuses: secondStatuses
		};
	} else yield {
		segment: first,
		statuses: firstStatuses
	};
	for (const segment of queueSegments) {
		const statuses = getSegmentPlaybackStatuses(segment, playback, playbackConfig, currentP2PLoader, availablePercentMemory);
		if (isNotActualStatuses(statuses)) break;
		yield {
			segment,
			statuses
		};
	}
}
function isNotActualStatuses(statuses) {
	const { isHighDemand, isHttpDownloadable, isP2PDownloadable } = statuses;
	return !isHighDemand && !isHttpDownloadable && !isP2PDownloadable;
}
//#endregion
//#region src/hybrid-loader.ts
var FAILED_ATTEMPTS_CLEAR_INTERVAL = 6e4;
var PEER_UPDATE_LATENCY = 1e3;
var HybridLoader = class {
	lastRequestedSegment;
	streamDetails;
	config;
	bandwidthCalculators;
	segmentStorage;
	webTorrentSocketPool;
	eventTarget;
	peerId;
	requests;
	engineRequest;
	p2pLoaders;
	playback;
	segmentAvgDuration;
	logger;
	levelChangedTimestamp;
	lastQueueProcessingTimeStamp;
	randomHttpDownloadTimeout;
	initialHttpDelayTimeoutId;
	isProcessQueueMicrotaskCreated = false;
	createdAt = performance.now();
	constructor(lastRequestedSegment, streamDetails, config, bandwidthCalculators, segmentStorage, webTorrentSocketPool, eventTarget, peerId) {
		this.lastRequestedSegment = lastRequestedSegment;
		this.streamDetails = streamDetails;
		this.config = config;
		this.bandwidthCalculators = bandwidthCalculators;
		this.segmentStorage = segmentStorage;
		this.webTorrentSocketPool = webTorrentSocketPool;
		this.eventTarget = eventTarget;
		this.peerId = peerId;
		const activeStream = this.lastRequestedSegment.stream;
		this.playback = {
			position: this.lastRequestedSegment.startTime,
			rate: 1
		};
		this.segmentAvgDuration = getSegmentAvgDuration(activeStream);
		this.requests = new RequestsContainer(this.requestProcessQueueMicrotask, this.bandwidthCalculators, this.playback, this.config, this.eventTarget);
		this.p2pLoaders = new P2PLoadersContainer(this.lastRequestedSegment.stream, this.requests, this.segmentStorage, this.config, this.webTorrentSocketPool, this.eventTarget, this.peerId, this.requestProcessQueueMicrotask);
		this.logger = (0, import_browser.default)(`p2pml-core:hybrid-loader-${activeStream.type}`);
		this.logger.color = "coral";
		this.setIntervalLoading();
	}
	setIntervalLoading() {
		const peersCount = this.p2pLoaders.currentLoader.connectedPeerCount;
		const randomTimeout = Math.random() * PEER_UPDATE_LATENCY * peersCount + PEER_UPDATE_LATENCY;
		this.randomHttpDownloadTimeout = window.setTimeout(() => {
			this.loadRandomThroughHttp();
			this.setIntervalLoading();
		}, randomTimeout);
	}
	async loadSegment(segment, callbacks) {
		this.logger(`requests: ${getSegmentString(segment)}`);
		const { stream } = segment;
		if (stream !== this.lastRequestedSegment.stream) {
			this.logger(`stream changed to ${getStreamString(stream)}`);
			this.p2pLoaders.changeCurrentLoader(stream);
		}
		this.lastRequestedSegment = segment;
		this.segmentStorage.onSegmentRequested(stream.swarmId, stream.streamSwarmId, segment.externalId, segment.startTime, segment.endTime, stream.type, this.streamDetails.isLive);
		const engineRequest = new EngineRequest(segment, callbacks);
		try {
			if (this.segmentStorage.hasSegment(stream.swarmId, stream.streamSwarmId, segment.externalId)) {
				const data = await this.segmentStorage.getSegmentData(stream.swarmId, stream.streamSwarmId, segment.externalId);
				if (data) {
					const { queueDownloadRatio } = this.generateQueue();
					engineRequest.resolve(data, this.getBandwidth(queueDownloadRatio));
					return;
				}
			}
			this.engineRequest?.abort();
			this.engineRequest = engineRequest;
			const request = this.requests.get(segment);
			if (request?.status === "failed") request.failedAttempts.clear();
		} catch (error) {
			this.logger(`request failed for ${getSegmentString(segment)} in ${getStreamString(stream)}`, error);
			engineRequest.reject();
		} finally {
			this.requestProcessQueueMicrotask();
		}
	}
	requestProcessQueueMicrotask = (force = true) => {
		const now = performance.now();
		if (!force && this.lastQueueProcessingTimeStamp !== void 0 && now - this.lastQueueProcessingTimeStamp <= 1e3 || this.isProcessQueueMicrotaskCreated) return;
		this.isProcessQueueMicrotaskCreated = true;
		queueMicrotask(() => {
			try {
				this.processQueue();
				this.lastQueueProcessingTimeStamp = now;
			} finally {
				this.isProcessQueueMicrotaskCreated = false;
			}
		});
	};
	processRequests(queueSegmentIds, queueDownloadRatio) {
		const { stream } = this.lastRequestedSegment;
		const { httpErrorRetries } = this.config;
		const now = performance.now();
		for (const request of this.requests.items()) {
			const { downloadSource: type, status, segment, isHandledByProcessQueue } = request;
			const engineRequest = this.engineRequest?.segment === segment ? this.engineRequest : void 0;
			switch (status) {
				case "loading":
					if (!queueSegmentIds.has(segment.runtimeId) && !engineRequest) {
						request.cancel();
						this.requests.remove(request);
					}
					break;
				case "succeed":
					if (!type) break;
					if (type === "http") this.p2pLoaders.currentLoader.broadcastAnnouncement();
					if (engineRequest) {
						engineRequest.resolve(request.data, this.getBandwidth(queueDownloadRatio));
						this.engineRequest = void 0;
					}
					this.requests.remove(request);
					this.logger(`succeed: ${getSegmentString(segment)} (byteLength: ${request.data.byteLength})`);
					this.segmentStorage.storeSegment(stream.swarmId, stream.streamSwarmId, segment.externalId, request.data, segment.startTime, segment.endTime, segment.stream.type, this.streamDetails.isLive);
					break;
				case "failed":
					if (type === "http" && !isHandledByProcessQueue) this.p2pLoaders.currentLoader.broadcastAnnouncement();
					if (!engineRequest && !stream.segments.has(request.segment.runtimeId)) this.requests.remove(request);
					if (request.failedAttempts.httpAttemptsCount >= httpErrorRetries && engineRequest) {
						this.engineRequest = void 0;
						engineRequest.reject();
					}
					break;
				case "not-started":
					this.requests.remove(request);
					break;
				case "aborted":
					this.requests.remove(request);
					break;
			}
			request.markHandledByProcessQueue();
			const { lastAttempt } = request.failedAttempts;
			if (lastAttempt && now - lastAttempt.error.timestamp > FAILED_ATTEMPTS_CLEAR_INTERVAL) request.failedAttempts.clear();
		}
	}
	processQueue() {
		const { queue, queueSegmentIds, queueDownloadRatio } = this.generateQueue();
		this.processRequests(queueSegmentIds, queueDownloadRatio);
		const { simultaneousHttpDownloads, simultaneousP2PDownloads, httpErrorRetries, httpDownloadInitialTimeoutMs } = this.config;
		const timeSinceStart = performance.now() - this.createdAt;
		const isInitialHttpWait = httpDownloadInitialTimeoutMs > 0 && timeSinceStart < httpDownloadInitialTimeoutMs;
		if (isInitialHttpWait) this.initialHttpDelayTimeoutId ??= window.setTimeout(() => {
			this.initialHttpDelayTimeoutId = void 0;
			this.requestProcessQueueMicrotask();
		}, httpDownloadInitialTimeoutMs - timeSinceStart);
		const { engineRequest } = this;
		if (engineRequest) {
			const { segment } = engineRequest;
			const request = this.requests.get(segment);
			if (engineRequest.shouldBeStartedImmediately && engineRequest.status === "pending" && (!request || request.status === "not-started" || request.status === "failed" || request.status === "aborted")) {
				if (!isInitialHttpWait && (request?.failedAttempts.httpAttemptsCount ?? 0) < httpErrorRetries && this.requests.executingHttpCount < simultaneousHttpDownloads) this.loadThroughHttp(segment);
				else if (this.p2pLoaders.currentLoader.isSegmentLoadedBySomeone(segment) && this.requests.executingP2PCount < simultaneousP2PDownloads) this.loadThroughP2P(segment);
			}
		}
		for (const item of queue) {
			const { statuses, segment } = item;
			const request = this.requests.get(segment);
			if (request?.status === "succeed") continue;
			if (statuses.isHighDemand) {
				const canLoadThroughHttp = !isInitialHttpWait && (request?.failedAttempts.httpAttemptsCount ?? 0) < httpErrorRetries;
				if (request?.status === "loading") {
					if (canLoadThroughHttp && request.downloadSource === "p2p" && (this.requests.executingHttpCount < simultaneousHttpDownloads || this.abortLastHttpLoadingInQueueAfterItem(queue, segment))) {
						request.cancel();
						this.loadThroughHttp(segment);
					}
					continue;
				}
				if (canLoadThroughHttp && (this.requests.executingHttpCount < simultaneousHttpDownloads || this.abortLastHttpLoadingInQueueAfterItem(queue, segment))) {
					this.loadThroughHttp(segment);
					continue;
				}
				if (this.p2pLoaders.currentLoader.isSegmentLoadedBySomeone(segment) && (this.requests.executingP2PCount < simultaneousP2PDownloads || this.abortLastP2PLoadingInQueueAfterItem(queue, segment))) this.loadThroughP2P(segment);
			} else if (statuses.isP2PDownloadable && request?.status !== "loading" && this.requests.executingP2PCount < simultaneousP2PDownloads) this.loadThroughP2P(segment);
		}
	}
	abortSegmentRequest(segmentRuntimeId) {
		if (this.engineRequest?.segment.runtimeId !== segmentRuntimeId) return;
		this.engineRequest.abort();
		this.logger("abort: ", getSegmentString(this.engineRequest.segment));
		this.engineRequest = void 0;
		this.requestProcessQueueMicrotask();
	}
	loadThroughHttp(segment) {
		new HttpRequestExecutor(this.requests.getOrCreateRequest(segment), this.config, this.eventTarget).execute();
		this.p2pLoaders.currentLoader.broadcastAnnouncement();
	}
	loadThroughP2P(segment) {
		this.p2pLoaders.currentLoader.downloadSegment(segment);
	}
	loadRandomThroughHttp() {
		const { httpDownloadInitialTimeoutMs } = this.config;
		if (httpDownloadInitialTimeoutMs > 0 && performance.now() - this.createdAt < httpDownloadInitialTimeoutMs) return;
		const availableStorageCapacityPercent = this.getAvailableStorageCapacityPercent();
		if (availableStorageCapacityPercent <= 10) return;
		const { simultaneousHttpDownloads, httpErrorRetries } = this.config;
		const p2pLoader = this.p2pLoaders.currentLoader;
		if (this.requests.executingHttpCount >= simultaneousHttpDownloads || !p2pLoader.connectedPeerCount) return;
		const segmentsToLoad = [];
		for (const { segment, statuses } of generateQueue(this.lastRequestedSegment, this.playback, this.config, this.p2pLoaders.currentLoader, availableStorageCapacityPercent)) {
			if (!statuses.isHttpDownloadable || statuses.isP2PDownloadable || this.segmentStorage.hasSegment(segment.stream.swarmId, segment.stream.streamSwarmId, segment.externalId)) continue;
			const request = this.requests.get(segment);
			if (request && (request.status === "loading" || request.status === "succeed" || request.failedAttempts.httpAttemptsCount >= httpErrorRetries)) continue;
			segmentsToLoad.push(segment);
		}
		if (!segmentsToLoad.length) return;
		if (simultaneousHttpDownloads - this.requests.executingHttpCount === 0) return;
		const peersCount = p2pLoader.connectedPeerCount + 1;
		const safeRandomSegmentsCount = Math.min(segmentsToLoad.length, simultaneousHttpDownloads * peersCount);
		const randomIndices = shuffleArray(Array.from({ length: safeRandomSegmentsCount }, (_, i) => i));
		let probability = safeRandomSegmentsCount / peersCount;
		for (const randomIndex of randomIndices) {
			if (this.requests.executingHttpCount >= simultaneousHttpDownloads) break;
			if (probability >= 1 || Math.random() <= probability) {
				const segment = segmentsToLoad[randomIndex];
				this.loadThroughHttp(segment);
			}
			probability--;
			if (probability <= 0) break;
		}
	}
	abortLastHttpLoadingInQueueAfterItem(queue, segment) {
		for (const { segment: itemSegment } of arrayBackwards(queue)) {
			if (itemSegment === segment) break;
			const request = this.requests.get(itemSegment);
			if (request?.downloadSource === "http" && request.status === "loading") {
				request.cancel();
				return true;
			}
		}
		return false;
	}
	abortLastP2PLoadingInQueueAfterItem(queue, segment) {
		for (const { segment: itemSegment } of arrayBackwards(queue)) {
			if (itemSegment === segment) break;
			const request = this.requests.get(itemSegment);
			if (request?.downloadSource === "p2p" && request.status === "loading") {
				request.cancel();
				return true;
			}
		}
		return false;
	}
	getAvailableStorageCapacityPercent() {
		const { totalCapacity, usedCapacity } = this.segmentStorage.getUsage();
		return 100 - usedCapacity / totalCapacity * 100;
	}
	generateQueue() {
		const queue = [];
		const queueSegmentIds = /* @__PURE__ */ new Set();
		let maxPossibleLength = 0;
		let alreadyLoadedCount = 0;
		const availableStorageCapacityPercent = this.getAvailableStorageCapacityPercent();
		for (const item of generateQueue(this.lastRequestedSegment, this.playback, this.config, this.p2pLoaders.currentLoader, availableStorageCapacityPercent)) {
			maxPossibleLength++;
			const { segment } = item;
			if (this.segmentStorage.hasSegment(segment.stream.swarmId, segment.stream.streamSwarmId, segment.externalId) || this.requests.get(segment)?.status === "succeed") {
				alreadyLoadedCount++;
				continue;
			}
			queue.push(item);
			queueSegmentIds.add(segment.runtimeId);
		}
		return {
			queue,
			queueSegmentIds,
			maxPossibleLength,
			alreadyLoadedCount,
			queueDownloadRatio: maxPossibleLength !== 0 ? alreadyLoadedCount / maxPossibleLength : 0
		};
	}
	getBandwidth(queueDownloadRatio) {
		const { http, all } = this.bandwidthCalculators;
		const { activeLevelBitrate } = this.streamDetails;
		if (activeLevelBitrate === 0) return all.getBandwidthLoadingOnly(3);
		const bandwidth = Math.max(all.getBandwidth(30, this.levelChangedTimestamp), all.getBandwidth(60, this.levelChangedTimestamp), all.getBandwidth(90, this.levelChangedTimestamp));
		if (queueDownloadRatio >= .8 || bandwidth >= activeLevelBitrate * .9) return Math.max(all.getBandwidthLoadingOnly(1), all.getBandwidthLoadingOnly(3), all.getBandwidthLoadingOnly(5));
		const httpRealBandwidth = Math.max(http.getBandwidthLoadingOnly(1), http.getBandwidthLoadingOnly(3), http.getBandwidthLoadingOnly(5));
		return Math.max(bandwidth, httpRealBandwidth);
	}
	notifyLevelChanged() {
		this.levelChangedTimestamp = performance.now();
	}
	sendBroadcastAnnouncement(sendEmptySegmentsAnnouncement = false) {
		this.p2pLoaders.currentLoader.broadcastAnnouncement(sendEmptySegmentsAnnouncement);
	}
	updatePlayback(position, rate) {
		const isRateChanged = this.playback.rate !== rate;
		const isPositionChanged = this.playback.position !== position;
		if (!isRateChanged && !isPositionChanged) return;
		const isPositionSignificantlyChanged = Math.abs(position - this.playback.position) / this.segmentAvgDuration > .5;
		if (isPositionChanged) this.playback.position = position;
		if (isRateChanged && rate !== 0) this.playback.rate = rate;
		if (isPositionSignificantlyChanged) {
			this.logger("position significantly changed");
			this.engineRequest?.markAsShouldBeStartedImmediately();
		}
		this.segmentStorage.onPlaybackUpdated(position, rate);
		this.requestProcessQueueMicrotask(isPositionSignificantlyChanged);
	}
	updateStream(stream) {
		if (stream !== this.lastRequestedSegment.stream) return;
		this.logger(`update stream: ${getStreamString(stream)}`);
		this.requestProcessQueueMicrotask();
	}
	destroy() {
		clearTimeout(this.randomHttpDownloadTimeout);
		clearTimeout(this.initialHttpDelayTimeoutId);
		this.engineRequest?.abort();
		this.requests.destroy();
		this.p2pLoaders.destroy();
	}
};
//#endregion
//#region src/utils/hash.ts
function sha1(str) {
	const bytes = utf8ToUintArray(str);
	const words = [];
	const msgLen = bytes.length * 8;
	for (let i = 0; i < bytes.length; i++) words[i >> 2] |= (bytes[i] & 255) << 24 - i % 4 * 8;
	words[msgLen >> 5] |= 128 << 24 - msgLen % 32;
	words[(msgLen + 64 >> 9 << 4) + 15] = msgLen;
	let h0 = 1732584193;
	let h1 = 4023233417;
	let h2 = 2562383102;
	let h3 = 271733878;
	let h4 = 3285377520;
	const w = [];
	for (let i = 0; i < words.length; i += 16) {
		const a = h0, b = h1, c = h2, d = h3, e = h4;
		for (let j = 0; j < 80; j++) {
			if (j < 16) w[j] = words[i + j] | 0;
			else {
				const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
				w[j] = n << 1 | n >>> 31;
			}
			let f;
			if (j < 20) f = (h1 & h2 | ~h1 & h3) + 1518500249;
			else if (j < 40) f = (h1 ^ h2 ^ h3) + 1859775393;
			else if (j < 60) f = (h1 & h2 | h1 & h3 | h2 & h3) - 1894007588;
			else f = (h1 ^ h2 ^ h3) - 899497514;
			const t = (h0 << 5 | h0 >>> 27) + h4 + (w[j] >>> 0) + f | 0;
			h4 = h3;
			h3 = h2;
			h2 = h1 << 30 | h1 >>> 2;
			h1 = h0;
			h0 = t;
		}
		h0 = h0 + a | 0;
		h1 = h1 + b | 0;
		h2 = h2 + c | 0;
		h3 = h3 + d | 0;
		h4 = h4 + e | 0;
	}
	let bin = "";
	const wordsOut = [
		h0,
		h1,
		h2,
		h3,
		h4
	];
	for (let i = 0; i < 20; i++) {
		const shift = 24 - i % 4 * 8;
		const word = wordsOut[i >> 2];
		bin += String.fromCharCode(word >>> shift & 255);
	}
	return bin;
}
//#endregion
//#region src/stream-identity.ts
/**
* Version of the peer swarm protocol. Included in every stream swarm ID, so peers
* with incompatible protocols never join the same swarm.
*
* Changing the identity derivation in any way requires bumping this version.
*/
var PEER_PROTOCOL_VERSION = "v2";
/**
* Computes a stable, unique identity hash for a stream based on its properties.
* The result is identical for all peers regardless of the player in use or the
* stream's position in the manifest.
*
* Uses a SHA-1 hash of the normalized properties, encoded to standard Base64.
*
* This function is environment-agnostic and can be used on a server (Node.js 16+)
* to reproduce the identity hash a client computes for the same stream.
*/
function computeStreamIdentityHash({ bitrate, codecs, width, height, language, channels, name, frameRate, videoRange }) {
	const normalizedCodecs = codecs ? codecs.split(",").map((c) => {
		c = c.trim().toLowerCase();
		const parts = c.split(".");
		if (parts.length === 3 && (parts[0] === "avc1" || parts[0] === "avc")) {
			const profile = parseInt(parts[1], 10);
			const level = parseInt(parts[2], 10);
			if (!isNaN(profile) && !isNaN(level) && parts[1] === profile.toString() && parts[2] === level.toString()) {
				const profileHex = `00${profile.toString(16)}`.slice(-2);
				const levelHex = `00${level.toString(16)}`.slice(-2);
				c = `${parts[0]}.${profileHex}00${levelHex}`;
			}
		}
		return c;
	}).sort().join(",") : "";
	const normalizedLanguage = language && language !== "und" ? language.slice(0, 2).toLowerCase() : "";
	const normalizedChannels = channels ? channels.toString().split("/")[0] : "";
	const normalizedName = name ? name.toLowerCase().trim() : "";
	const normalizedFrameRate = frameRate && !isNaN(Number(frameRate)) ? Number(frameRate).toString() : "";
	const normalizedVideoRange = videoRange ? videoRange.toUpperCase().trim() : "";
	const str = `${bitrate ?? 0}-${normalizedCodecs}-${width ?? ""}-${height ?? ""}-${normalizedLanguage}-${normalizedChannels}-${normalizedName}-${normalizedFrameRate}-${normalizedVideoRange}`;
	return btoa(sha1(str));
}
/**
* Builds the default stream swarm ID from its components. The stream swarm ID is the
* pre-hash string that defines which P2P swarm a stream belongs to;
* its hash is the infohash announced to trackers (see {@link computeInfoHash}).
*/
function buildStreamSwarmId(swarmId, streamType, identityHash) {
	return `v2-${swarmId}-${streamType}-${identityHash}`;
}
/**
* Computes the default stream swarm ID for a stream from its raw properties.
*
* This is the derivation a client with no `streamSwarmIdBuilder` configured uses.
* Run it on a server (Node.js 16+) to predict a stream's swarm ID — and, via
* {@link computeInfoHash}, the exact infohash the client announces to trackers.
*/
function computeStreamSwarmId(options) {
	return buildStreamSwarmId(options.swarmId, options.streamType, computeStreamIdentityHash(options.properties));
}
/**
* Computes the infohash announced to trackers for the given stream swarm ID.
*
* A BitTorrent tracker `infoHash` MUST be exactly 20 bytes.
* We take 15 bytes of the binary SHA-1 and encode it to Base64.
* This produces exactly a 20-character ASCII string (no padding).
* Note: this is a 20-byte ASCII representation, not a standard
* 20-byte binary SHA-1 infoHash.
*
* This function is environment-agnostic: use it on a server (Node.js 16+) to
* compute the infohashes to allowlist on a private tracker.
*/
function computeInfoHash(streamSwarmId) {
	return btoa(sha1(streamSwarmId).slice(0, 15));
}
//#endregion
//#region src/segment-storage/utils.ts
var getStorageItemId = (streamId, segmentId) => `${streamId}|${segmentId}`;
var isAndroid = (userAgent) => /Android/i.test(userAgent);
var isIPadOrIPhone = (userAgent) => /iPad|iPhone/i.test(userAgent);
var isAndroidWebview = (userAgent) => /Android/i.test(userAgent) && (/; wv\)/i.test(userAgent) || !/Chrome|Firefox/i.test(userAgent));
//#endregion
//#region src/segment-storage/segment-memory-storage.ts
var BYTES_PER_MiB = 1048576;
var SegmentMemoryStorage = class {
	userAgent = navigator.userAgent;
	segmentMemoryStorageLimit = 4 * 1024;
	currentStorageUsage = 0;
	cache = /* @__PURE__ */ new Map();
	logger;
	coreConfig;
	mainStreamConfig;
	secondaryStreamConfig;
	currentPlayback;
	lastRequestedSegment;
	segmentChangeCallback;
	constructor() {
		this.logger = (0, import_browser.default)("p2pml-core:segment-memory-storage");
		this.logger.color = "RebeccaPurple";
	}
	async initialize(coreConfig, mainStreamConfig, secondaryStreamConfig) {
		this.coreConfig = coreConfig;
		this.mainStreamConfig = mainStreamConfig;
		this.secondaryStreamConfig = secondaryStreamConfig;
		this.setMemoryStorageLimit();
		this.logger("initialized");
	}
	onPlaybackUpdated(position, rate) {
		this.currentPlayback = {
			position,
			rate
		};
	}
	onSegmentRequested(swarmId, streamSwarmId, segmentId, startTime, endTime, streamType, isLiveStream) {
		this.lastRequestedSegment = {
			streamSwarmId,
			segmentId,
			startTime,
			endTime,
			swarmId,
			streamType,
			isLiveStream
		};
	}
	async storeSegment(_swarmId, streamSwarmId, segmentId, data, startTime, endTime, streamType, isLiveStream) {
		this.clear(isLiveStream, data.byteLength);
		const storageId = getStorageItemId(streamSwarmId, segmentId);
		this.cache.set(storageId, {
			data,
			segmentId,
			streamSwarmId,
			startTime,
			endTime,
			streamType
		});
		this.increaseStorageUsage(data.byteLength);
		this.logger(`add segment: ${segmentId} to ${streamSwarmId}`);
		if (!this.segmentChangeCallback) throw new Error("dispatchStorageUpdatedEvent is not set");
		this.segmentChangeCallback(streamSwarmId);
	}
	async getSegmentData(_swarmId, streamSwarmId, segmentId) {
		const segmentStorageId = getStorageItemId(streamSwarmId, segmentId);
		const dataItem = this.cache.get(segmentStorageId);
		if (dataItem === void 0) return void 0;
		return dataItem.data;
	}
	getUsage() {
		if (!this.lastRequestedSegment || !this.currentPlayback) return {
			totalCapacity: this.segmentMemoryStorageLimit,
			usedCapacity: this.currentStorageUsage
		};
		const playbackPosition = this.currentPlayback.position;
		let calculatedUsedCapacity = 0;
		for (const { endTime, data } of this.cache.values()) {
			if (playbackPosition > endTime) continue;
			calculatedUsedCapacity += data.byteLength;
		}
		return {
			totalCapacity: this.segmentMemoryStorageLimit,
			usedCapacity: calculatedUsedCapacity / BYTES_PER_MiB
		};
	}
	hasSegment(_swarmId, streamSwarmId, externalId) {
		const segmentStorageId = getStorageItemId(streamSwarmId, externalId);
		return this.cache.get(segmentStorageId) !== void 0;
	}
	getStoredSegmentIds(_swarmId, streamSwarmId) {
		const externalIds = [];
		for (const { segmentId, streamSwarmId: streamCacheId } of this.cache.values()) {
			if (streamCacheId !== streamSwarmId) continue;
			externalIds.push(segmentId);
		}
		return externalIds;
	}
	clear(isLiveStream, newSegmentSize) {
		if (!this.currentPlayback || !this.mainStreamConfig || !this.secondaryStreamConfig || !this.coreConfig) return;
		if (!this.isMemoryLimitReached(newSegmentSize) && !isLiveStream) return;
		const affectedStreams = /* @__PURE__ */ new Set();
		const sortedCache = Array.from(this.cache.values()).sort((a, b) => a.startTime - b.startTime);
		for (const segmentData of sortedCache) {
			const { streamSwarmId, segmentId, data } = segmentData;
			const storageId = getStorageItemId(streamSwarmId, segmentId);
			if (!this.shouldRemoveSegment(segmentData, isLiveStream, this.currentPlayback.position)) continue;
			this.cache.delete(storageId);
			affectedStreams.add(streamSwarmId);
			this.decreaseStorageUsage(data.byteLength);
			this.logger(`Removed segment ${segmentId} from stream ${streamSwarmId}`);
			if (!this.isMemoryLimitReached(newSegmentSize) && !isLiveStream) break;
		}
		this.sendUpdatesToAffectedStreams(affectedStreams);
	}
	isMemoryLimitReached(segmentByteLength) {
		return this.currentStorageUsage + segmentByteLength / BYTES_PER_MiB > this.segmentMemoryStorageLimit;
	}
	setSegmentChangeCallback(callback) {
		this.segmentChangeCallback = callback;
	}
	sendUpdatesToAffectedStreams(affectedStreams) {
		if (affectedStreams.size === 0) return;
		affectedStreams.forEach((stream) => {
			if (!this.segmentChangeCallback) throw new Error("dispatchStorageUpdatedEvent is not set");
			this.segmentChangeCallback(stream);
		});
	}
	shouldRemoveSegment(segmentData, isLiveStream, currentPlaybackPosition) {
		const { endTime, streamType } = segmentData;
		const highDemandTimeWindow = this.getStreamTimeWindow(streamType, "highDemandTimeWindow");
		if (currentPlaybackPosition <= endTime) return false;
		if (isLiveStream) return currentPlaybackPosition > highDemandTimeWindow + endTime;
		return true;
	}
	increaseStorageUsage(segmentByteLength) {
		this.currentStorageUsage += segmentByteLength / BYTES_PER_MiB;
	}
	decreaseStorageUsage(segmentByteLength) {
		this.currentStorageUsage -= segmentByteLength / BYTES_PER_MiB;
	}
	setMemoryStorageLimit() {
		if (this.coreConfig?.segmentMemoryStorageLimit) {
			this.segmentMemoryStorageLimit = this.coreConfig.segmentMemoryStorageLimit;
			return;
		}
		if (isAndroidWebview(this.userAgent) || isIPadOrIPhone(this.userAgent)) this.segmentMemoryStorageLimit = 1024;
		else if (isAndroid(this.userAgent)) this.segmentMemoryStorageLimit = 2 * 1024;
	}
	getStreamTimeWindow(streamType, configKey) {
		return (streamType === "main" ? this.mainStreamConfig : this.secondaryStreamConfig)?.[configKey] ?? 0;
	}
	destroy() {
		this.cache.clear();
		this.segmentChangeCallback = void 0;
	}
};
//#endregion
//#region src/utils/peer.ts
var TRACKER_CLIENT_VERSION_PREFIX = `-PM${formatVersion("4.0.0")}-`;
var HASH_SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var PEER_ID_LENGTH = 20;
function generatePeerId(trackerClientVersionPrefix) {
	const trackerClientId = [trackerClientVersionPrefix];
	const randomCharsCount = PEER_ID_LENGTH - trackerClientVersionPrefix.length;
	for (let i = 0; i < randomCharsCount; i++) trackerClientId.push(HASH_SYMBOLS[Math.floor(Math.random() * 62)]);
	return trackerClientId.join("");
}
function formatVersion(versionString) {
	const splittedVersion = versionString.split(".");
	return `${`00${splittedVersion[0]}`.slice(-2)}${`00${splittedVersion[1]}`.slice(-2)}`;
}
//#endregion
//#region src/webtorrent/websocket-client/index.ts
var WebSocketClient = class {
	#config;
	#state = "disconnected";
	#ws = null;
	#backoffCount = 0;
	#reconnectTimeoutId = null;
	#eventTarget = new EventTarget();
	constructor(config) {
		const initialDelay = Math.max(100, config.initialDelay ?? 1e3);
		this.#config = {
			url: config.url,
			initialDelay,
			maxDelay: Math.max(initialDelay, config.maxDelay ?? 3e4),
			jitterMultiplier: Math.max(0, config.jitterMultiplier ?? .2)
		};
	}
	get state() {
		return this.#state;
	}
	addEventListener(eventName, listener) {
		this.#eventTarget.addEventListener(eventName, listener);
	}
	removeEventListener(eventName, listener) {
		this.#eventTarget.removeEventListener(eventName, listener);
	}
	connect() {
		if (this.#state === "connected" || this.#state === "connecting" || this.#state === "disposed") return;
		this.#state = "connecting";
		this.#clearReconnectTimeout();
		try {
			this.#ws = new WebSocket(this.#config.url);
			this.#ws.binaryType = "arraybuffer";
			this.#ws.onopen = this.#onOpen;
			this.#ws.onclose = this.#onClose;
			this.#ws.onerror = this.#onError;
			this.#ws.onmessage = this.#onMessage;
		} catch (error) {
			this.#state = "disconnected";
			const errorEvent = new ErrorEvent("error", {
				message: error instanceof Error ? error.message : "Unknown WebSocket creation error",
				error
			});
			this.#eventTarget.dispatchEvent("error", errorEvent);
		}
	}
	send(data) {
		if (this.#state !== "connected" || !this.#ws) throw new Error("WebSocketClient: Cannot send data when not connected");
		this.#ws.send(data);
	}
	dispose() {
		this.#state = "disposed";
		this.#clearReconnectTimeout();
		if (this.#ws) {
			this.#ws.onopen = null;
			this.#ws.onclose = null;
			this.#ws.onerror = null;
			this.#ws.onmessage = null;
			this.#ws.close();
			this.#ws = null;
		}
		this.#eventTarget.clear();
	}
	#onOpen = () => {
		if (this.#state === "disposed") return;
		this.#state = "connected";
		this.#backoffCount = 0;
		this.#eventTarget.dispatchEvent("connected");
	};
	#onClose = () => {
		if (this.#state === "disposed") return;
		if (this.#ws) {
			this.#ws.onopen = null;
			this.#ws.onclose = null;
			this.#ws.onerror = null;
			this.#ws.onmessage = null;
			this.#ws = null;
		}
		this.#scheduleReconnect();
		this.#eventTarget.dispatchEvent("disconnected");
	};
	#onError = (event) => {
		if (this.#state === "disposed") return;
		this.#eventTarget.dispatchEvent("error", event);
	};
	#onMessage = (event) => {
		if (this.#state === "disposed") return;
		this.#eventTarget.dispatchEvent("message", event.data);
	};
	#scheduleReconnect() {
		if (this.#state === "disposed") return;
		this.#state = "reconnecting";
		const baseDelay = Math.min(this.#config.initialDelay * Math.pow(2, this.#backoffCount), this.#config.maxDelay);
		const jitter = baseDelay * this.#config.jitterMultiplier;
		const randomJitter = Math.random() * 2 * jitter - jitter;
		const delay = Math.max(0, baseDelay + randomJitter);
		if (baseDelay < this.#config.maxDelay) this.#backoffCount++;
		this.#reconnectTimeoutId = setTimeout(() => {
			if (this.#state !== "disposed") this.connect();
		}, delay);
		this.#eventTarget.dispatchEvent("reconnecting");
	}
	#clearReconnectTimeout() {
		if (this.#reconnectTimeoutId !== null) {
			clearTimeout(this.#reconnectTimeoutId);
			this.#reconnectTimeoutId = null;
		}
	}
};
//#endregion
//#region src/webtorrent/webtorrent-socket-pool/index.ts
var WebTorrentSocketPool = class {
	#sockets = /* @__PURE__ */ new Map();
	#eventTarget = new EventTarget();
	addEventListener(eventName, listener) {
		this.#eventTarget.addEventListener(eventName, listener);
	}
	removeEventListener(eventName, listener) {
		this.#eventTarget.removeEventListener(eventName, listener);
	}
	acquire(url) {
		let entry = this.#sockets.get(url);
		if (!entry) {
			const client = new WebSocketClient({ url });
			client.addEventListener("error", (error) => {
				this.#eventTarget.dispatchEvent("error", error, url);
			});
			client.connect();
			entry = {
				client,
				refCount: 0
			};
			this.#sockets.set(url, entry);
		}
		entry.refCount++;
		let isReleased = false;
		return {
			client: entry.client,
			release: () => {
				if (isReleased) return;
				isReleased = true;
				entry.refCount--;
				if (entry.refCount <= 0) {
					if (entry.refCount < 0) console.error(`[WebTorrentSocketPool] Negative refCount detected for ${url}`);
					if (this.#sockets.get(url) === entry) this.#sockets.delete(url);
					entry.client.dispose();
				}
			}
		};
	}
	destroy() {
		this.#eventTarget.clear();
		const entries = Array.from(this.#sockets.values());
		this.#sockets.clear();
		for (const entry of entries) try {
			entry.client.dispose();
		} catch (error) {
			console.error("[WebTorrentSocketPool] Failed to dispose WebSocketClient:", error);
		}
	}
};
//#endregion
//#region src/core.ts
/** Core class for managing media streams loading via P2P. */
var Core = class Core {
	/** Default configuration for common core settings. */
	static DEFAULT_COMMON_CORE_CONFIG = {
		segmentMemoryStorageLimit: void 0,
		customSegmentStorageFactory: void 0,
		trackerClientVersionPrefix: TRACKER_CLIENT_VERSION_PREFIX
	};
	/** Default configuration for stream settings. */
	static DEFAULT_STREAM_CONFIG = {
		isP2PUploadDisabled: false,
		isP2PDisabled: false,
		simultaneousHttpDownloads: 2,
		simultaneousP2PDownloads: 3,
		highDemandTimeWindow: 15,
		httpDownloadInitialTimeoutMs: 0,
		httpDownloadTimeWindow: 3e3,
		p2pDownloadTimeWindow: 6e3,
		webRtcMaxMessageSize: 64 * 1024 - 1,
		p2pNotReceivingBytesTimeoutMs: 2e3,
		p2pInactiveLoaderDestroyTimeoutMs: 30 * 1e3,
		httpNotReceivingBytesTimeoutMs: 3e3,
		httpErrorRetries: 3,
		p2pErrorRetries: 3,
		announceTrackers: [
			"wss://tracker.novage.com.ua",
			"wss://tracker.webtorrent.dev",
			"wss://tracker.openwebtorrent.com"
		],
		rtcConfig: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }] },
		validateP2PSegment: void 0,
		validateHTTPSegment: void 0,
		httpRequestSetup: void 0,
		swarmId: void 0,
		streamSwarmIdBuilder: void 0,
		p2pMaxPeers: 50,
		p2pChurnMaxPeersMultiplier: 1.5,
		p2pChurnCleanupIntervalMs: 3e4,
		p2pChurnGracePeriodMs: 15e3,
		webRtcOffersCount: 5,
		webRtcOfferTimeoutMs: 5e4,
		webRtcIceGatheringTimeoutMs: 5e3,
		webRtcConnectionTimeoutMs: 15e3
	};
	eventTarget = new EventTarget();
	manifestResponseUrl;
	streams = /* @__PURE__ */ new Map();
	mainStreamConfig;
	secondaryStreamConfig;
	commonCoreConfig;
	bandwidthCalculators = {
		all: new BandwidthCalculator(),
		http: new BandwidthCalculator()
	};
	segmentStorage;
	webTorrentSocketPool = new WebTorrentSocketPool();
	logger = (0, import_browser.default)("p2pml-core:core");
	socketPoolLogger = (0, import_browser.default)("p2pml-core:webtorrent-socket-pool");
	peerId;
	mainStreamLoader;
	secondaryStreamLoader;
	streamDetails = {
		isLive: false,
		activeLevelBitrate: 0
	};
	storageInitPromise;
	/**
	* Constructs a new Core instance with optional initial configuration.
	*
	* @param config - Optional partial configuration to override default settings.
	*
	* @example
	* // Create a Core instance with custom configuration for HTTP and P2P downloads.
	* const core = new Core({
	*   simultaneousHttpDownloads: 5,
	*   simultaneousP2PDownloads: 5,
	*   httpErrorRetries: 5,
	*   p2pErrorRetries: 5
	* });
	*
	* @example
	* // Create a Core instance using the default configuration.
	* const core = new Core();
	*/
	constructor(config) {
		const filteredConfig = filterUndefinedProps(config ?? {});
		this.commonCoreConfig = mergeAndFilterConfig({
			defaultConfig: Core.DEFAULT_COMMON_CORE_CONFIG,
			baseConfig: filteredConfig
		});
		this.mainStreamConfig = mergeAndFilterConfig({
			defaultConfig: Core.DEFAULT_STREAM_CONFIG,
			baseConfig: filteredConfig,
			specificStreamConfig: filteredConfig.mainStream
		});
		this.secondaryStreamConfig = mergeAndFilterConfig({
			defaultConfig: Core.DEFAULT_STREAM_CONFIG,
			baseConfig: filteredConfig,
			specificStreamConfig: filteredConfig.secondaryStream
		});
		this.peerId = generatePeerId(this.commonCoreConfig.trackerClientVersionPrefix);
		this.webTorrentSocketPool.addEventListener("error", (error, url) => {
			this.socketPoolLogger(`WebSocket error for tracker url ${url}:`, error);
		});
	}
	/**
	* Retrieves the current configuration for the core instance, ensuring immutability.
	*
	* @returns A deep readonly version of the core configuration.
	*/
	getConfig() {
		return {
			...deepCopy(this.commonCoreConfig),
			mainStream: deepCopy(this.mainStreamConfig),
			secondaryStream: deepCopy(this.secondaryStreamConfig)
		};
	}
	/**
	* Applies a set of dynamic configuration updates to the core, merging with the existing configuration.
	*
	* @param dynamicConfig - A set of configuration changes to apply.
	*
	* @example
	* // Example of dynamically updating the download time windows and timeout settings.
	* const dynamicConfig = {
	*   httpDownloadTimeWindow: 60,  // Set HTTP download time window to 60 seconds
	*   p2pDownloadTimeWindow: 60,   // Set P2P download time window to 60 seconds
	*   httpNotReceivingBytesTimeoutMs: 1500,  // Set HTTP timeout to 1500 milliseconds
	*   p2pNotReceivingBytesTimeoutMs: 1500    // Set P2P timeout to 1500 milliseconds
	* };
	* core.applyDynamicConfig(dynamicConfig);
	*/
	applyDynamicConfig(dynamicConfig) {
		const { mainStream, secondaryStream } = dynamicConfig;
		const mainStreamConfigCopy = deepCopy(this.mainStreamConfig);
		const secondaryStreamConfigCopy = deepCopy(this.secondaryStreamConfig);
		this.overrideAllConfigs(dynamicConfig, mainStream, secondaryStream);
		this.processSpecificDynamicConfigParams(mainStreamConfigCopy, dynamicConfig, "main");
		this.processSpecificDynamicConfigParams(secondaryStreamConfigCopy, dynamicConfig, "secondary");
	}
	processSpecificDynamicConfigParams(prevConfig, updatedConfig, streamType) {
		const isP2PDisabled = this.getUpdatedStreamProperty("isP2PDisabled", updatedConfig, streamType);
		if (isP2PDisabled && prevConfig.isP2PDisabled !== isP2PDisabled) this.destroyStreamLoader(streamType);
		const isP2PUploadDisabled = this.getUpdatedStreamProperty("isP2PUploadDisabled", updatedConfig, streamType);
		if (isP2PUploadDisabled !== void 0 && prevConfig.isP2PUploadDisabled !== isP2PUploadDisabled) (streamType === "main" ? this.mainStreamLoader : this.secondaryStreamLoader)?.sendBroadcastAnnouncement(isP2PUploadDisabled);
	}
	getUpdatedStreamProperty(propertyName, updatedConfig, streamType) {
		return (streamType === "main" ? updatedConfig.mainStream : updatedConfig.secondaryStream)?.[propertyName] ?? updatedConfig[propertyName];
	}
	/**
	* Adds an event listener for the specified event type on the core event target.
	*
	* @param eventName - The name of the event to listen for.
	* @param listener - The callback function to invoke when the event is fired.
	*/
	addEventListener(eventName, listener) {
		this.eventTarget.addEventListener(eventName, listener);
	}
	/**
	* Removes an event listener for the specified event type on the core event target.
	*
	* @param eventName - The name of the event to listen for.
	* @param listener - The callback function to be removed.
	*/
	removeEventListener(eventName, listener) {
		this.eventTarget.removeEventListener(eventName, listener);
	}
	/**
	* Sets the response URL for the manifest, stripping any query parameters.
	*
	* @param url - The full URL to the manifest response.
	*/
	setManifestResponseUrl(url) {
		this.manifestResponseUrl = url.split("?")[0];
	}
	/**
	* Checks if a segment is already stored within the core.
	*
	* @param segmentRuntimeId - The runtime identifier of the segment to check.
	* @returns `true` if the segment is present, otherwise `false`.
	*/
	hasSegment(segmentRuntimeId) {
		return !!getSegmentFromStreamsMap(this.streams, segmentRuntimeId);
	}
	/**
	* Retrieves a specific stream by its runtime identifier, if it exists.
	*
	* @param streamRuntimeId - The runtime identifier of the stream to retrieve.
	* @returns The registered stream with its computed identity, or `undefined` if not found.
	*/
	getStream(streamRuntimeId) {
		return this.streams.get(streamRuntimeId);
	}
	/**
	* Retrieves the runtime identifiers of the segments currently registered
	* for a stream. Player integrations use this to diff a refreshed manifest
	* against the core's registry before calling `updateStream`.
	*
	* @param streamRuntimeId - The runtime identifier of the stream.
	* @returns A snapshot set of the registered segment runtime IDs, or
	* `undefined` if the stream is not registered.
	*/
	getStreamSegmentRuntimeIds(streamRuntimeId) {
		const stream = this.streams.get(streamRuntimeId);
		if (!stream) return void 0;
		return new Set(stream.segments.keys());
	}
	/**
	* Retrieves all currently registered streams with their computed identities,
	* including the infohashes announced to trackers. Unlike the `onStreamAdded`
	* event, this reflects the full set at any moment, so late subscribers can
	* catch up on streams registered before they attached.
	*
	* @returns The registered streams, in registration order.
	*/
	getStreams() {
		return [...this.streams.values()];
	}
	/**
	* Ensures a stream exists in the map; adds it if it does not.
	*
	* Computes the stream's identity (`swarmId`, `identityHash`, `streamSwarmId`,
	* `infoHash`) exactly once at registration and freezes it on the stream.
	* Requires the swarm ID to be resolvable: either a `swarmId` is configured
	* or `setManifestResponseUrl()` has been called.
	*
	* @param stream - The stream to potentially add to the map.
	*/
	addStreamIfNoneExists(stream) {
		if (this.streams.has(stream.runtimeId)) return;
		const config = stream.type === "main" ? this.mainStreamConfig : this.secondaryStreamConfig;
		const swarmId = config.swarmId ?? this.manifestResponseUrl;
		if (swarmId === void 0) throw new Error("Failed to register stream: no swarmId is configured and the manifest response URL is not set. Call setManifestResponseUrl() before adding streams.");
		const properties = Object.freeze({ ...stream.properties });
		const identityHash = computeStreamIdentityHash(properties);
		let streamSwarmId = buildStreamSwarmId(swarmId, stream.type, identityHash);
		if (config.streamSwarmIdBuilder) {
			const customStreamSwarmId = config.streamSwarmIdBuilder({
				swarmId,
				runtimeId: stream.runtimeId,
				streamType: stream.type,
				properties,
				identityHash,
				defaultStreamSwarmId: streamSwarmId,
				peerProtocolVersion: "v2"
			});
			if (customStreamSwarmId !== void 0) {
				if (typeof customStreamSwarmId !== "string" || customStreamSwarmId === "") throw new Error("streamSwarmIdBuilder must return a non-empty string or undefined");
				streamSwarmId = customStreamSwarmId;
			}
		}
		for (const registered of this.streams.values()) {
			if (registered.streamSwarmId !== streamSwarmId) continue;
			if (registered.swarmId !== swarmId || registered.type !== stream.type || registered.identityHash !== identityHash) throw new Error(`streamSwarmIdBuilder produced the same stream swarm ID ("${streamSwarmId}") for streams with different identities. Peers of these streams would exchange segments of the wrong stream.`);
		}
		const registeredStream = {
			...stream,
			properties,
			swarmId,
			identityHash,
			streamSwarmId,
			infoHash: computeInfoHash(streamSwarmId),
			segments: /* @__PURE__ */ new Map()
		};
		this.streams.set(stream.runtimeId, registeredStream);
		const { segments, ...streamSnapshot } = registeredStream;
		this.eventTarget.dispatchEvent("onStreamAdded", { stream: streamSnapshot });
	}
	/**
	* Updates the segments associated with a specific stream.
	*
	* @param streamRuntimeId - The runtime identifier of the stream to update.
	* @param addSegments - Optional segments to add to the stream.
	* @param removeSegmentIds - Optional segment IDs to remove from the stream.
	*/
	updateStream(streamRuntimeId, addSegments, removeSegmentIds) {
		const stream = this.streams.get(streamRuntimeId);
		if (!stream) return;
		if (addSegments) for (const segment of addSegments) {
			if (stream.segments.has(segment.runtimeId)) continue;
			stream.segments.set(segment.runtimeId, {
				...segment,
				stream
			});
		}
		if (removeSegmentIds) for (const id of removeSegmentIds) stream.segments.delete(id);
		this.mainStreamLoader?.updateStream(stream);
		this.secondaryStreamLoader?.updateStream(stream);
	}
	/**
	* Loads a segment given its runtime identifier and invokes the provided callbacks during the process.
	* Initializes segment storage if it has not been initialized yet.
	*
	* @param segmentRuntimeId - The runtime identifier of the segment to load.
	* @param callbacks - The callbacks to be invoked during segment loading.
	* @throws {Error} - Throws if the manifest response URL is not defined.
	*/
	async loadSegment(segmentRuntimeId, callbacks) {
		if (!this.manifestResponseUrl) throw new Error("Manifest response url is not defined");
		await this.initializeSegmentStorage();
		const segment = this.identifySegment(segmentRuntimeId);
		this.getStreamHybridLoader(segment).loadSegment(segment, callbacks);
	}
	/**
	* Aborts the loading of a segment specified by its runtime identifier.
	*
	* @param segmentRuntimeId - The runtime identifier of the segment whose loading is to be aborted.
	*/
	abortSegmentLoading(segmentRuntimeId) {
		this.mainStreamLoader?.abortSegmentRequest(segmentRuntimeId);
		this.secondaryStreamLoader?.abortSegmentRequest(segmentRuntimeId);
	}
	/**
	* Updates the playback parameters while play head moves, specifically position and playback rate, for stream loaders.
	*
	* @param position - The new position in the stream, in seconds.
	* @param rate - The new playback rate.
	*/
	updatePlayback(position, rate) {
		this.mainStreamLoader?.updatePlayback(position, rate);
		this.secondaryStreamLoader?.updatePlayback(position, rate);
	}
	/**
	* Sets the active level bitrate, used for adjusting quality levels in adaptive streaming.
	* Notifies the stream loaders if a change occurs.
	*
	* @param bitrate - The new bitrate to set as active.
	*/
	setActiveLevelBitrate(bitrate) {
		if (bitrate !== this.streamDetails.activeLevelBitrate) {
			this.streamDetails.activeLevelBitrate = bitrate;
			this.mainStreamLoader?.notifyLevelChanged();
			this.secondaryStreamLoader?.notifyLevelChanged();
		}
	}
	/**
	* Updates the 'isLive' status of the stream
	*
	* @param isLive - Boolean indicating whether the stream is live.
	*/
	setIsLive(isLive) {
		this.streamDetails.isLive = isLive;
	}
	/**
	* Identify if a segment is loadable by the P2P core based on the segment's stream type and configuration.
	* @param segmentRuntimeId Segment runtime identifier to check.
	* @returns `true` if the segment is loadable by the P2P core, otherwise `false`.
	*/
	isSegmentLoadable(segmentRuntimeId) {
		try {
			const segment = this.identifySegment(segmentRuntimeId);
			if (segment.stream.type === "main" && this.mainStreamConfig.isP2PDisabled) return false;
			if (segment.stream.type === "secondary" && this.secondaryStreamConfig.isP2PDisabled) return false;
			return true;
		} catch {
			return false;
		}
	}
	/**
	* Cleans up resources used by the Core instance, including destroying any active stream loaders
	* and clearing stored segments.
	*
	* Event listeners deliberately survive: the player integrations reuse one
	* Core instance across media sources, destroying it between loads, and
	* subscriptions (e.g. `onStreamAdded`, `onPeerConnect`) are expected to
	* keep working after the next source loads. Use `removeEventListener` to
	* unsubscribe explicitly.
	*/
	destroy() {
		this.streams.clear();
		this.mainStreamLoader?.destroy();
		this.secondaryStreamLoader?.destroy();
		this.segmentStorage?.setSegmentChangeCallback(void 0);
		this.segmentStorage?.destroy();
		this.mainStreamLoader = void 0;
		this.secondaryStreamLoader = void 0;
		this.segmentStorage = void 0;
		this.manifestResponseUrl = void 0;
		this.streamDetails = {
			isLive: false,
			activeLevelBitrate: 0
		};
		this.storageInitPromise = void 0;
		this.webTorrentSocketPool.destroy();
	}
	async initializeSegmentStorage() {
		if (this.segmentStorage) return;
		if (this.storageInitPromise) return this.storageInitPromise;
		this.storageInitPromise = (async () => {
			const { isLive } = this.streamDetails;
			const createCustomStorage = this.commonCoreConfig.customSegmentStorageFactory;
			if (createCustomStorage && typeof createCustomStorage !== "function") throw new Error("Storage configuration is invalid");
			const segmentStorage = createCustomStorage ? createCustomStorage(isLive) : new SegmentMemoryStorage();
			try {
				await segmentStorage.initialize(this.commonCoreConfig, this.mainStreamConfig, this.secondaryStreamConfig);
			} catch (error) {
				segmentStorage.destroy();
				throw error;
			}
			if (!this.storageInitPromise) {
				segmentStorage.setSegmentChangeCallback(void 0);
				segmentStorage.destroy();
				return;
			}
			segmentStorage.setSegmentChangeCallback((streamSwarmId) => {
				this.eventTarget.dispatchEvent(`onStorageUpdated-${streamSwarmId}`);
			});
			this.segmentStorage = segmentStorage;
		})();
		try {
			await this.storageInitPromise;
		} finally {
			this.storageInitPromise = void 0;
		}
	}
	identifySegment(segmentRuntimeId) {
		if (!this.manifestResponseUrl) throw new Error("Manifest response url is undefined");
		const segment = getSegmentFromStreamsMap(this.streams, segmentRuntimeId);
		if (!segment) throw new Error(`Not found segment with id: ${segmentRuntimeId}`);
		return segment;
	}
	overrideAllConfigs(dynamicConfig, mainStream, secondaryStream) {
		const sanitizedDynamicConfig = this.stripStaticOnlyProps(dynamicConfig);
		const sanitizedMainStream = mainStream && this.stripStaticOnlyProps(mainStream);
		const sanitizedSecondaryStream = secondaryStream && this.stripStaticOnlyProps(secondaryStream);
		overrideConfig(this.commonCoreConfig, sanitizedDynamicConfig);
		overrideConfig(this.mainStreamConfig, sanitizedDynamicConfig);
		overrideConfig(this.secondaryStreamConfig, sanitizedDynamicConfig);
		if (sanitizedMainStream) overrideConfig(this.mainStreamConfig, sanitizedMainStream);
		if (sanitizedSecondaryStream) overrideConfig(this.secondaryStreamConfig, sanitizedSecondaryStream);
	}
	stripStaticOnlyProps(config) {
		if (!("swarmId" in config) && !("streamSwarmIdBuilder" in config)) return config;
		this.logger("swarmId and streamSwarmIdBuilder cannot be changed at runtime; ignoring them in the dynamic configuration update");
		const sanitized = { ...config };
		delete sanitized.swarmId;
		delete sanitized.streamSwarmIdBuilder;
		return sanitized;
	}
	destroyStreamLoader(streamType) {
		if (streamType === "main") {
			this.mainStreamLoader?.destroy();
			this.mainStreamLoader = void 0;
		} else {
			this.secondaryStreamLoader?.destroy();
			this.secondaryStreamLoader = void 0;
		}
	}
	getStreamHybridLoader(segment) {
		if (segment.stream.type === "main") {
			this.mainStreamLoader ??= this.createNewHybridLoader(segment);
			return this.mainStreamLoader;
		} else {
			this.secondaryStreamLoader ??= this.createNewHybridLoader(segment);
			return this.secondaryStreamLoader;
		}
	}
	createNewHybridLoader(segment) {
		if (!this.segmentStorage) throw new Error("Segment storage is not initialized");
		const streamConfig = segment.stream.type === "main" ? this.mainStreamConfig : this.secondaryStreamConfig;
		return new HybridLoader(segment, this.streamDetails, streamConfig, this.bandwidthCalculators, this.segmentStorage, this.webTorrentSocketPool, this.eventTarget, this.peerId);
	}
};
//#endregion
var debug = import_browser.debug;
export { Core, CoreRequestError, PEER_PROTOCOL_VERSION, PeerConnectError, PeerError, PeerWarning, RequestError, TrackerError, TrackerWarning, TypedError, buildStreamSwarmId, computeInfoHash, computeStreamIdentityHash, computeStreamSwarmId, debug };

//# sourceMappingURL=p2p-media-loader-core.es.js.map