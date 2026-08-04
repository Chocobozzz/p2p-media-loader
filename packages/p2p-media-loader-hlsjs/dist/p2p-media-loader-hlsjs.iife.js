this.p2pml = this.p2pml || {};
this.p2pml.hlsjs = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
	//#region src/utils.ts
	function getSegmentRuntimeId(segmentRequestUrl, byteRange) {
		if (!byteRange) return segmentRequestUrl;
		return `${segmentRequestUrl}|${byteRange.start}-${byteRange.end}`;
	}
	function getByteRange(rangeStart, rangeEnd) {
		if (rangeStart !== void 0 && rangeEnd !== void 0 && rangeStart <= rangeEnd) return {
			start: rangeStart,
			end: rangeEnd
		};
	}
	//#endregion
	//#region ../p2p-media-loader-core/lib/types.js
	/**
	* Base class for all errors and warnings emitted by the library, carrying a
	* machine-readable `type` discriminator. Use `instanceof TypedError` to catch
	* any library error regardless of its specific class.
	*/
	var TypedError = class extends Error {
		constructor(type, message, cause) {
			super(message);
			Object.defineProperty(this, "type", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: type
			});
			Object.defineProperty(this, "cause", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			this.cause = cause;
		}
	};
	/** Represents an error that occurred during a peer connection. */
	var PeerError = class extends TypedError {
		constructor() {
			super(...arguments);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "PeerError"
			});
		}
	};
	/** Represents a warning that occurred during a peer connection. */
	var PeerWarning = class extends TypedError {
		constructor() {
			super(...arguments);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "PeerWarning"
			});
		}
	};
	/** Represents an error that occurred during a tracker request. */
	var TrackerError = class extends TypedError {
		constructor() {
			super(...arguments);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "TrackerError"
			});
		}
	};
	/** Represents a warning that occurred during a tracker request. */
	var TrackerWarning = class extends TypedError {
		constructor() {
			super(...arguments);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "TrackerWarning"
			});
		}
	};
	/** Represents an error that occurred while establishing a peer connection. */
	var PeerConnectError = class extends TypedError {
		constructor() {
			super(...arguments);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "PeerConnectError"
			});
		}
	};
	/**
	* Represents an error that can occur during the request process, with a timestamp for when the error occurred.
	* @template T - The specific type of request error.
	*/
	var RequestError = class extends TypedError {
		/**
		* Constructs a new RequestError.
		* @param type - The specific error type.
		* @param message - Optional message describing the error.
		* @param cause - Optional underlying cause of the error.
		*/
		constructor(type, message, cause) {
			super(type, message, cause);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "RequestError"
			});
			/** Error timestamp. */
			Object.defineProperty(this, "timestamp", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			this.timestamp = performance.now();
		}
	};
	/** Custom error class for errors that occur during core network requests. */
	var CoreRequestError = class extends TypedError {
		constructor() {
			super(...arguments);
			Object.defineProperty(this, "name", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "CoreRequestError"
			});
		}
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/utils/abort-controller.js
	var __classPrivateFieldGet$11 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _AbortSignalPolyfill_listeners;
	var AbortSignalPolyfill = class {
		constructor() {
			Object.defineProperty(this, "aborted", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: false
			});
			_AbortSignalPolyfill_listeners.set(this, /* @__PURE__ */ new Set());
		}
		addEventListener(_type, listener) {
			__classPrivateFieldGet$11(this, _AbortSignalPolyfill_listeners, "f").add(listener);
		}
		removeEventListener(_type, listener) {
			__classPrivateFieldGet$11(this, _AbortSignalPolyfill_listeners, "f").delete(listener);
		}
		dispatchEvent(_type) {
			this.aborted = true;
			for (const listener of __classPrivateFieldGet$11(this, _AbortSignalPolyfill_listeners, "f")) try {
				listener();
			} catch (_a) {}
			__classPrivateFieldGet$11(this, _AbortSignalPolyfill_listeners, "f").clear();
		}
	};
	_AbortSignalPolyfill_listeners = /* @__PURE__ */ new WeakMap();
	var AbortControllerPolyfill = class {
		constructor() {
			Object.defineProperty(this, "signal", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: new AbortSignalPolyfill()
			});
		}
		abort() {
			this.signal.dispatchEvent("abort");
		}
	};
	var isAbortControllerSupported = typeof AbortController !== "undefined";
	var SafeAbortController = isAbortControllerSupported ? AbortController : AbortControllerPolyfill;
	//#endregion
	//#region ../p2p-media-loader-core/lib/http-loader.js
	var __awaiter$9 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var HttpRequestExecutor = class {
		isAborted() {
			return this.abortController.signal.aborted;
		}
		constructor(request, httpConfig, eventTarget) {
			Object.defineProperty(this, "request", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: request
			});
			Object.defineProperty(this, "httpConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: httpConfig
			});
			Object.defineProperty(this, "abortController", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: new SafeAbortController()
			});
			Object.defineProperty(this, "expectedBytesLength", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "requestByteRange", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "onChunkDownloaded", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			this.onChunkDownloaded = eventTarget.getEventDispatcher("onChunkDownloaded");
			const { byteRange } = this.request.segment;
			if (byteRange) this.requestByteRange = Object.assign({}, byteRange);
		}
		execute() {
			var _a;
			const startControls = {
				onAbort: () => this.abortController.abort(),
				notReceivingBytesTimeoutMs: this.httpConfig.httpNotReceivingBytesTimeoutMs
			};
			if (this.request.tryCompleteByLoadedBytes({ downloadSource: "http" }, startControls, this.httpConfig.validateHTTPSegment, "http-segment-validation-failed")) return;
			if (this.request.loadedBytes !== 0) {
				this.requestByteRange = (_a = this.requestByteRange) !== null && _a !== void 0 ? _a : { start: 0 };
				this.requestByteRange.start = this.requestByteRange.start + this.request.loadedBytes;
			}
			if (this.request.totalBytes) this.expectedBytesLength = this.request.totalBytes - this.request.loadedBytes;
			const requestControls = this.request.start({ downloadSource: "http" }, startControls);
			this.fetch(requestControls);
		}
		fetch(requestControls) {
			return __awaiter$9(this, void 0, void 0, function* () {
				var _a, _b, _c;
				const { segment } = this.request;
				let activeReader;
				if (this.isAborted()) return;
				const onAbort = () => {
					try {
						activeReader === null || activeReader === void 0 || activeReader.cancel().catch(() => {});
					} catch (_a) {}
				};
				this.abortController.signal.addEventListener("abort", onAbort);
				const abortSignal = isAbortControllerSupported ? this.abortController.signal : void 0;
				try {
					let request = yield (_b = (_a = this.httpConfig).httpRequestSetup) === null || _b === void 0 ? void 0 : _b.call(_a, segment.url, segment.byteRange, abortSignal, this.requestByteRange);
					if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
					if (!request) {
						const headers = new Headers();
						if (this.requestByteRange) headers.set("Range", `bytes=${this.requestByteRange.start}-${(_c = this.requestByteRange.end) !== null && _c !== void 0 ? _c : ""}`);
						const requestOptions = { headers };
						if (abortSignal) requestOptions.signal = abortSignal;
						request = new Request(segment.url, requestOptions);
					}
					if (this.isAborted()) throw new DOMException("Request aborted before request fetch", "AbortError");
					const response = yield window.fetch(request);
					if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
					this.handleResponseHeaders(response);
					requestControls.firstBytesReceived();
					if (!response.body || typeof response.body.getReader !== "function") {
						const arrayBuffer = yield response.arrayBuffer();
						if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
						const value = new Uint8Array(arrayBuffer);
						requestControls.addLoadedChunk(value);
						this.onChunkDownloaded(value.byteLength, "http", void 0, segment.stream.type, this.request.infoHash);
					} else {
						const reader = response.body.getReader();
						activeReader = reader;
						for (;;) {
							if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
							const { done, value } = yield reader.read();
							if (done) break;
							if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
							requestControls.addLoadedChunk(value);
							this.onChunkDownloaded(value.byteLength, "http", void 0, segment.stream.type, this.request.infoHash);
						}
					}
					if (this.isAborted()) throw new DOMException("Request aborted", "AbortError");
					if (this.request.totalBytes !== void 0 && this.request.loadedBytes !== this.request.totalBytes) throw new RequestError("http-bytes-mismatch", `HTTP response truncated: received ${this.request.loadedBytes} of ${this.request.totalBytes} bytes`);
					const isValid = yield this.request.validateData(this.httpConfig.validateHTTPSegment);
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
			});
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
	//#region ../p2p-media-loader-core/lib/p2p/commands/types.js
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
	var PeerCommandType$1;
	(function(PeerCommandType) {
		PeerCommandType[PeerCommandType["SegmentsAnnouncement"] = 0] = "SegmentsAnnouncement";
		PeerCommandType[PeerCommandType["SegmentRequest"] = 1] = "SegmentRequest";
		PeerCommandType[PeerCommandType["SegmentData"] = 2] = "SegmentData";
		PeerCommandType[PeerCommandType["SegmentDataSendingCompleted"] = 3] = "SegmentDataSendingCompleted";
		PeerCommandType[PeerCommandType["SegmentAbsent"] = 4] = "SegmentAbsent";
		PeerCommandType[PeerCommandType["CancelSegmentRequest"] = 5] = "CancelSegmentRequest";
	})(PeerCommandType$1 || (PeerCommandType$1 = {}));
	//#endregion
	//#region ../p2p-media-loader-core/lib/utils/utils.js
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
		totalBytes !== null && totalBytes !== void 0 || (totalBytes = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
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
		const mergedConfig = deepCopy(Object.assign(Object.assign(Object.assign({}, defaultConfig), baseConfig), specificStreamConfig));
		const keysOfT = Object.keys(defaultConfig);
		const filteredConfig = {};
		keysOfT.forEach((key) => {
			if (key in mergedConfig) filteredConfig[key] = mergedConfig[key];
		});
		return filteredConfig;
	}
	//#endregion
	//#region ../p2p-media-loader-core/lib/p2p/commands/binary-serialization.js
	var __classPrivateFieldGet$10 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var __classPrivateFieldSet$9 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var _ResizableUint8Array_instances;
	var _ResizableUint8Array_bytes;
	var _ResizableUint8Array_length;
	var _ResizableUint8Array_addBytes;
	var textEncoder = new TextEncoder();
	var textDecoder = new TextDecoder("utf8");
	var SerializedItem;
	(function(SerializedItem) {
		SerializedItem[SerializedItem["Min"] = -1] = "Min";
		SerializedItem[SerializedItem["Int"] = 0] = "Int";
		SerializedItem[SerializedItem["SimilarIntArray"] = 1] = "SimilarIntArray";
		SerializedItem[SerializedItem["String"] = 2] = "String";
		SerializedItem[SerializedItem["Max"] = 3] = "Max";
	})(SerializedItem || (SerializedItem = {}));
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
		const numberMetadata = SerializedItem.Int << 4 | numBytes.length;
		return new Uint8Array([numberMetadata, ...numBytes]);
	}
	function deserializeInt(bytes) {
		if (bytes.length === 0) throw new Error("Buffer is too short");
		const metadata = bytes[0];
		if (metadata >> 4 !== SerializedItem.Int) throw new Error("Trying to deserialize integer with invalid serialized item code");
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
		var _a;
		const commonPartNumbersMap = /* @__PURE__ */ new Map();
		for (const number of numbers) {
			const diffByte = number & 255;
			const common = number - diffByte;
			const bytes = (_a = commonPartNumbersMap.get(common)) !== null && _a !== void 0 ? _a : new ResizableUint8Array();
			if (!bytes.length) commonPartNumbersMap.set(common, bytes);
			bytes.push(diffByte);
		}
		const result = new ResizableUint8Array();
		result.push([SerializedItem.SimilarIntArray << 4, commonPartNumbersMap.size]);
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
		if (codeByte >> 4 !== SerializedItem.SimilarIntArray) throw new Error("Trying to deserialize similar int array with invalid serialized item code");
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
		bytes.push([SerializedItem.String << 4 | length >> 8 & 15, length & 255]);
		bytes.push(encoded);
		return bytes.getBuffer();
	}
	function deserializeString(bytes) {
		if (bytes.length < 2) throw new Error("Buffer is too short");
		const [codeByte, lengthByte] = bytes;
		if (codeByte >> 4 !== SerializedItem.String) throw new Error("Trying to deserialize bytes (sting) with invalid serialized item code.");
		const length = (codeByte & 15) << 8 | lengthByte;
		if (bytes.length < length + 2) throw new Error("Malformed string: buffer too short");
		const stringBytes = bytes.subarray(2, length + 2);
		return {
			string: textDecoder.decode(stringBytes),
			byteLength: length + 2
		};
	}
	var ResizableUint8Array = class {
		constructor() {
			_ResizableUint8Array_instances.add(this);
			_ResizableUint8Array_bytes.set(this, []);
			_ResizableUint8Array_length.set(this, 0);
		}
		push(bytes) {
			__classPrivateFieldGet$10(this, _ResizableUint8Array_instances, "m", _ResizableUint8Array_addBytes).call(this, bytes, "end");
		}
		unshift(bytes) {
			__classPrivateFieldGet$10(this, _ResizableUint8Array_instances, "m", _ResizableUint8Array_addBytes).call(this, bytes, "start");
		}
		getBytesChunks() {
			return __classPrivateFieldGet$10(this, _ResizableUint8Array_bytes, "f");
		}
		getBuffer() {
			return joinChunks(__classPrivateFieldGet$10(this, _ResizableUint8Array_bytes, "f"), __classPrivateFieldGet$10(this, _ResizableUint8Array_length, "f"));
		}
		get length() {
			return __classPrivateFieldGet$10(this, _ResizableUint8Array_length, "f");
		}
	};
	_ResizableUint8Array_bytes = /* @__PURE__ */ new WeakMap(), _ResizableUint8Array_length = /* @__PURE__ */ new WeakMap(), _ResizableUint8Array_instances = /* @__PURE__ */ new WeakSet(), _ResizableUint8Array_addBytes = function _ResizableUint8Array_addBytes(bytes, position) {
		let bytesToAdd;
		if (bytes instanceof Uint8Array) bytesToAdd = bytes;
		else if (Array.isArray(bytes)) bytesToAdd = new Uint8Array(bytes);
		else bytesToAdd = new Uint8Array([bytes]);
		__classPrivateFieldSet$9(this, _ResizableUint8Array_length, __classPrivateFieldGet$10(this, _ResizableUint8Array_length, "f") + bytesToAdd.length, "f");
		__classPrivateFieldGet$10(this, _ResizableUint8Array_bytes, "f")[position === "start" ? "unshift" : "push"](bytesToAdd);
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/p2p/commands/binary-command-creator.js
	var __classPrivateFieldSet$8 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet$9 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _BinaryCommandChunksJoiner_instances;
	var _BinaryCommandChunksJoiner_chunks;
	var _BinaryCommandChunksJoiner_status;
	var _BinaryCommandChunksJoiner_onComplete;
	var _BinaryCommandChunksJoiner_unframeCommandChunk;
	var _BinaryCommandCreator_bytes;
	var _BinaryCommandCreator_resultBuffers;
	var _BinaryCommandCreator_status;
	var _BinaryCommandCreator_maxChunkLength;
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
		constructor(type) {
			super();
			Object.defineProperty(this, "type", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: type
			});
		}
	};
	var BinaryCommandChunksJoiner = class {
		constructor(onComplete) {
			_BinaryCommandChunksJoiner_instances.add(this);
			_BinaryCommandChunksJoiner_chunks.set(this, new ResizableUint8Array());
			_BinaryCommandChunksJoiner_status.set(this, "joining");
			_BinaryCommandChunksJoiner_onComplete.set(this, void 0);
			__classPrivateFieldSet$8(this, _BinaryCommandChunksJoiner_onComplete, onComplete, "f");
		}
		addCommandChunk(chunk) {
			if (__classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_status, "f") === "completed") return;
			const isFirstChunk = isFirstCommandChunk(chunk);
			if (!__classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_chunks, "f").length && !isFirstChunk) throw new BinaryCommandJoiningError("no-first-chunk");
			if (__classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_chunks, "f").length && isFirstChunk) throw new BinaryCommandJoiningError("incomplete-joining");
			__classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_chunks, "f").push(__classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_instances, "m", _BinaryCommandChunksJoiner_unframeCommandChunk).call(this, chunk));
			if (!isLastCommandChunk(chunk)) return;
			__classPrivateFieldSet$8(this, _BinaryCommandChunksJoiner_status, "completed", "f");
			__classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_onComplete, "f").call(this, __classPrivateFieldGet$9(this, _BinaryCommandChunksJoiner_chunks, "f").getBuffer());
		}
	};
	_BinaryCommandChunksJoiner_chunks = /* @__PURE__ */ new WeakMap(), _BinaryCommandChunksJoiner_status = /* @__PURE__ */ new WeakMap(), _BinaryCommandChunksJoiner_onComplete = /* @__PURE__ */ new WeakMap(), _BinaryCommandChunksJoiner_instances = /* @__PURE__ */ new WeakSet(), _BinaryCommandChunksJoiner_unframeCommandChunk = function _BinaryCommandChunksJoiner_unframeCommandChunk(chunk) {
		if (chunk.length < commandFramesLength) throw new Error("Command chunk is too short to unframe");
		return chunk.subarray(FRAME_PART_LENGTH, chunk.length - FRAME_PART_LENGTH);
	};
	var BinaryCommandCreator = class {
		constructor(commandType, maxChunkLength) {
			_BinaryCommandCreator_bytes.set(this, new ResizableUint8Array());
			_BinaryCommandCreator_resultBuffers.set(this, []);
			_BinaryCommandCreator_status.set(this, "creating");
			_BinaryCommandCreator_maxChunkLength.set(this, void 0);
			__classPrivateFieldSet$8(this, _BinaryCommandCreator_maxChunkLength, maxChunkLength, "f");
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(commandType);
		}
		addInteger(name, value) {
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(name.charCodeAt(0));
			const bytes = serializeInt(value);
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(bytes);
		}
		addUniqueSimilarIntArr(name, arr) {
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(name.charCodeAt(0));
			const bytes = serializeUniqueSimilarIntArray(arr);
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(bytes);
		}
		addString(name, string) {
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(name.charCodeAt(0));
			const bytes = serializeString(string);
			__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").push(bytes);
		}
		complete() {
			if (!__classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").length) throw new Error("Buffer is empty");
			if (__classPrivateFieldGet$9(this, _BinaryCommandCreator_status, "f") === "completed") return;
			__classPrivateFieldSet$8(this, _BinaryCommandCreator_status, "completed", "f");
			const unframedBuffer = __classPrivateFieldGet$9(this, _BinaryCommandCreator_bytes, "f").getBuffer();
			if (unframedBuffer.length + commandFramesLength <= __classPrivateFieldGet$9(this, _BinaryCommandCreator_maxChunkLength, "f")) {
				__classPrivateFieldGet$9(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(unframedBuffer, commandFrameStart, commandFrameEnd));
				return;
			}
			let chunksCount = Math.ceil(unframedBuffer.length / __classPrivateFieldGet$9(this, _BinaryCommandCreator_maxChunkLength, "f"));
			if (Math.ceil(unframedBuffer.length / chunksCount) + commandFramesLength > __classPrivateFieldGet$9(this, _BinaryCommandCreator_maxChunkLength, "f")) chunksCount++;
			for (const [i, chunk] of splitBufferToEqualChunks(unframedBuffer, chunksCount)) if (i === 0) __classPrivateFieldGet$9(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(chunk, commandFrameStart, commandDivFrameEnd));
			else if (i === chunksCount - 1) __classPrivateFieldGet$9(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(chunk, commandDivFrameStart, commandFrameEnd));
			else __classPrivateFieldGet$9(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(chunk, commandDivFrameStart, commandDivFrameEnd));
		}
		getResultBuffers() {
			if (__classPrivateFieldGet$9(this, _BinaryCommandCreator_status, "f") === "creating" || !__classPrivateFieldGet$9(this, _BinaryCommandCreator_resultBuffers, "f").length) throw new Error("Command is not complete.");
			return __classPrivateFieldGet$9(this, _BinaryCommandCreator_resultBuffers, "f");
		}
	};
	_BinaryCommandCreator_bytes = /* @__PURE__ */ new WeakMap(), _BinaryCommandCreator_resultBuffers = /* @__PURE__ */ new WeakMap(), _BinaryCommandCreator_status = /* @__PURE__ */ new WeakMap(), _BinaryCommandCreator_maxChunkLength = /* @__PURE__ */ new WeakMap();
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
		const buffer = new Uint8Array(length !== null && length !== void 0 ? length : string.length);
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
	//#region ../p2p-media-loader-core/lib/p2p/commands/commands.js
	function serializeSegmentAnnouncementCommand(command, maxChunkSize) {
		const { c: commandCode, p: loadingByHttp, l: loaded } = command;
		const creator = new BinaryCommandCreator(commandCode, maxChunkSize);
		if (loaded === null || loaded === void 0 ? void 0 : loaded.length) creator.addUniqueSimilarIntArr("l", loaded);
		if (loadingByHttp === null || loadingByHttp === void 0 ? void 0 : loadingByHttp.length) creator.addUniqueSimilarIntArr("p", loadingByHttp);
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
	//#region ../p2p-media-loader-core/lib/p2p/commands/index.js
	var commands_exports = /* @__PURE__ */ __exportAll({
		BinaryCommandChunksJoiner: () => BinaryCommandChunksJoiner,
		BinaryCommandJoiningError: () => BinaryCommandJoiningError,
		PeerCommandType: () => PeerCommandType$1,
		deserializeCommand: () => deserializeCommand,
		isCommandChunk: () => isCommandChunk,
		serializePeerCommand: () => serializePeerCommand
	});
	//#endregion
	//#region ../p2p-media-loader-core/lib/webtorrent/utils.js
	function getRTCError(event, fallbackMessage = "RTC error") {
		var _a, _b;
		const errorEvent = event;
		if (errorEvent.error instanceof Error) return errorEvent.error;
		const msg = (_b = (_a = errorEvent.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : fallbackMessage;
		return new Error(msg);
	}
	function getRTCErrorMessage(event, fallbackMessage = "RTC error") {
		return getRTCError(event, fallbackMessage).message;
	}
	function isTerminalConnectionState(state) {
		return state === "failed" || state === "closed" || state === "disconnected";
	}
	//#endregion
	//#region ../p2p-media-loader-core/lib/webtorrent/data-channel-sender.js
	var __awaiter$8 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __classPrivateFieldGet$8 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var __classPrivateFieldSet$7 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var _DataChannelSender_currentSendContext;
	var MAX_BUFFERED_AMOUNT = 64 * 1024;
	var DataChannelSender = class {
		constructor(channel, maxMessageSize) {
			Object.defineProperty(this, "channel", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: channel
			});
			Object.defineProperty(this, "maxMessageSize", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: maxMessageSize
			});
			_DataChannelSender_currentSendContext.set(this, void 0);
		}
		sendData(data, onChunkSent) {
			return __awaiter$8(this, void 0, void 0, function* () {
				if (__classPrivateFieldGet$8(this, _DataChannelSender_currentSendContext, "f")) throw new Error("Already sending data");
				if (this.channel.readyState !== "open") throw new Error("Data channel is not open");
				this.channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT;
				const { promise, resolve, reject } = getPromiseWithResolvers();
				let offset = 0;
				let isSettled = false;
				const cleanup = () => {
					if (isSettled) return false;
					isSettled = true;
					__classPrivateFieldSet$7(this, _DataChannelSender_currentSendContext, void 0, "f");
					this.channel.removeEventListener("bufferedamountlow", sendChunks);
					this.channel.removeEventListener("closing", onClose);
					this.channel.removeEventListener("close", onClose);
					this.channel.removeEventListener("error", onError);
					return true;
				};
				__classPrivateFieldSet$7(this, _DataChannelSender_currentSendContext, { cancel: () => {
					if (cleanup()) reject(/* @__PURE__ */ new Error("Send cancelled"));
				} }, "f");
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
							onChunkSent === null || onChunkSent === void 0 || onChunkSent(bytesToSend);
							if (!__classPrivateFieldGet$8(this, _DataChannelSender_currentSendContext, "f")) return;
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
			});
		}
		cancel() {
			var _a;
			(_a = __classPrivateFieldGet$8(this, _DataChannelSender_currentSendContext, "f")) === null || _a === void 0 || _a.cancel();
		}
	};
	_DataChannelSender_currentSendContext = /* @__PURE__ */ new WeakMap();
	//#endregion
	//#region ../p2p-media-loader-core/lib/p2p/peer-protocol.js
	var __awaiter$7 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __classPrivateFieldSet$6 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet$7 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _PeerProtocol_instances;
	var _PeerProtocol_commandChunks;
	var _PeerProtocol_dataChannelSender;
	var _PeerProtocol_uploadingRequestId;
	var _PeerProtocol_onChunkDownloaded;
	var _PeerProtocol_onChunkUploaded;
	var _PeerProtocol_channel;
	var _PeerProtocol_peerConfig;
	var _PeerProtocol_eventHandlers;
	var _PeerProtocol_peerId;
	var _PeerProtocol_onMessageReceived;
	var _PeerProtocol_receivingCommandBytes;
	var logger = (0, import_browser.default)("p2pml-core:peer-protocol");
	var PeerProtocol = class {
		constructor(channel, peerConfig, eventHandlers, eventTarget, peerId) {
			_PeerProtocol_instances.add(this);
			_PeerProtocol_commandChunks.set(this, void 0);
			_PeerProtocol_dataChannelSender.set(this, void 0);
			_PeerProtocol_uploadingRequestId.set(this, void 0);
			_PeerProtocol_onChunkDownloaded.set(this, void 0);
			_PeerProtocol_onChunkUploaded.set(this, void 0);
			_PeerProtocol_channel.set(this, void 0);
			_PeerProtocol_peerConfig.set(this, void 0);
			_PeerProtocol_eventHandlers.set(this, void 0);
			_PeerProtocol_peerId.set(this, void 0);
			_PeerProtocol_onMessageReceived.set(this, (event) => {
				try {
					const data = new Uint8Array(event.data);
					if (isCommandChunk(data)) __classPrivateFieldGet$7(this, _PeerProtocol_instances, "m", _PeerProtocol_receivingCommandBytes).call(this, data);
					else {
						__classPrivateFieldGet$7(this, _PeerProtocol_eventHandlers, "f").onSegmentChunkReceived(data);
						__classPrivateFieldGet$7(this, _PeerProtocol_onChunkDownloaded, "f").call(this, data.byteLength, "p2p", __classPrivateFieldGet$7(this, _PeerProtocol_peerId, "f"), __classPrivateFieldGet$7(this, _PeerProtocol_peerConfig, "f").streamType, __classPrivateFieldGet$7(this, _PeerProtocol_peerConfig, "f").infoHash);
					}
				} catch (err) {
					logger("error handling data channel message: %O", err);
					__classPrivateFieldGet$7(this, _PeerProtocol_eventHandlers, "f").onProtocolError(err);
				}
			});
			__classPrivateFieldSet$6(this, _PeerProtocol_channel, channel, "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_peerConfig, peerConfig, "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_eventHandlers, eventHandlers, "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_peerId, peerId, "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_dataChannelSender, new DataChannelSender(channel, peerConfig.webRtcMaxMessageSize), "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_onChunkDownloaded, eventTarget.getEventDispatcher("onChunkDownloaded"), "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_onChunkUploaded, eventTarget.getEventDispatcher("onChunkUploaded"), "f");
			if (channel.binaryType !== "arraybuffer") throw new Error(`Expected binaryType "arraybuffer", got "${channel.binaryType}"`);
			channel.addEventListener("message", __classPrivateFieldGet$7(this, _PeerProtocol_onMessageReceived, "f"));
		}
		sendCommand(command) {
			if (__classPrivateFieldGet$7(this, _PeerProtocol_channel, "f").readyState !== "open") throw new Error(`cannot send command ${command.c} (channel state: ${__classPrivateFieldGet$7(this, _PeerProtocol_channel, "f").readyState})`);
			const binaryCommandBuffers = serializePeerCommand(command, __classPrivateFieldGet$7(this, _PeerProtocol_peerConfig, "f").webRtcMaxMessageSize);
			for (const buffer of binaryCommandBuffers) __classPrivateFieldGet$7(this, _PeerProtocol_channel, "f").send(buffer);
		}
		stopUploadingSegmentData() {
			__classPrivateFieldGet$7(this, _PeerProtocol_dataChannelSender, "f").cancel();
			__classPrivateFieldSet$6(this, _PeerProtocol_uploadingRequestId, void 0, "f");
		}
		getUploadingRequestId() {
			return __classPrivateFieldGet$7(this, _PeerProtocol_uploadingRequestId, "f");
		}
		splitSegmentDataToChunksAndUploadAsync(data, requestId) {
			return __awaiter$7(this, void 0, void 0, function* () {
				if (__classPrivateFieldGet$7(this, _PeerProtocol_uploadingRequestId, "f") !== void 0) throw new Error(`Some segment data is already uploading.`);
				__classPrivateFieldSet$6(this, _PeerProtocol_uploadingRequestId, requestId, "f");
				try {
					yield __classPrivateFieldGet$7(this, _PeerProtocol_dataChannelSender, "f").sendData(data, (chunkSize) => {
						__classPrivateFieldGet$7(this, _PeerProtocol_onChunkUploaded, "f").call(this, chunkSize, __classPrivateFieldGet$7(this, _PeerProtocol_peerId, "f"), __classPrivateFieldGet$7(this, _PeerProtocol_peerConfig, "f").streamType, __classPrivateFieldGet$7(this, _PeerProtocol_peerConfig, "f").infoHash);
					});
				} finally {
					if (__classPrivateFieldGet$7(this, _PeerProtocol_uploadingRequestId, "f") === requestId) __classPrivateFieldSet$6(this, _PeerProtocol_uploadingRequestId, void 0, "f");
				}
			});
		}
		destroy() {
			__classPrivateFieldGet$7(this, _PeerProtocol_channel, "f").removeEventListener("message", __classPrivateFieldGet$7(this, _PeerProtocol_onMessageReceived, "f"));
			__classPrivateFieldGet$7(this, _PeerProtocol_dataChannelSender, "f").cancel();
			__classPrivateFieldSet$6(this, _PeerProtocol_commandChunks, void 0, "f");
			__classPrivateFieldSet$6(this, _PeerProtocol_uploadingRequestId, void 0, "f");
		}
	};
	_PeerProtocol_commandChunks = /* @__PURE__ */ new WeakMap(), _PeerProtocol_dataChannelSender = /* @__PURE__ */ new WeakMap(), _PeerProtocol_uploadingRequestId = /* @__PURE__ */ new WeakMap(), _PeerProtocol_onChunkDownloaded = /* @__PURE__ */ new WeakMap(), _PeerProtocol_onChunkUploaded = /* @__PURE__ */ new WeakMap(), _PeerProtocol_channel = /* @__PURE__ */ new WeakMap(), _PeerProtocol_peerConfig = /* @__PURE__ */ new WeakMap(), _PeerProtocol_eventHandlers = /* @__PURE__ */ new WeakMap(), _PeerProtocol_peerId = /* @__PURE__ */ new WeakMap(), _PeerProtocol_onMessageReceived = /* @__PURE__ */ new WeakMap(), _PeerProtocol_instances = /* @__PURE__ */ new WeakSet(), _PeerProtocol_receivingCommandBytes = function _PeerProtocol_receivingCommandBytes(buffer) {
		var _a;
		__classPrivateFieldSet$6(this, _PeerProtocol_commandChunks, (_a = __classPrivateFieldGet$7(this, _PeerProtocol_commandChunks, "f")) !== null && _a !== void 0 ? _a : new BinaryCommandChunksJoiner((commandBuffer) => {
			__classPrivateFieldSet$6(this, _PeerProtocol_commandChunks, void 0, "f");
			let command;
			try {
				command = deserializeCommand(commandBuffer);
			} catch (err) {
				logger("error deserializing command: %O", err);
				__classPrivateFieldGet$7(this, _PeerProtocol_eventHandlers, "f").onProtocolError(err);
				return;
			}
			__classPrivateFieldGet$7(this, _PeerProtocol_eventHandlers, "f").onCommandReceived(command);
		}), "f");
		try {
			__classPrivateFieldGet$7(this, _PeerProtocol_commandChunks, "f").addCommandChunk(buffer);
		} catch (err) {
			logger("error receiving command chunks: %O", err);
			__classPrivateFieldSet$6(this, _PeerProtocol_commandChunks, void 0, "f");
			__classPrivateFieldGet$7(this, _PeerProtocol_eventHandlers, "f").onProtocolError(err);
		}
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/bandwidth-calculator.js
	var MIN_TIME_DIFF_MS = 1;
	var BandwidthCalculator = class {
		constructor(clearThresholdMs = 2e4) {
			Object.defineProperty(this, "clearThresholdMs", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: clearThresholdMs
			});
			Object.defineProperty(this, "loadingsCount", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: 0
			});
			Object.defineProperty(this, "bytes", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: []
			});
			Object.defineProperty(this, "loadingOnlyTimestamps", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: []
			});
			Object.defineProperty(this, "timestamps", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: []
			});
			Object.defineProperty(this, "noLoadingsTime", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: 0
			});
			Object.defineProperty(this, "loadingsStoppedAt", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: 0
			});
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
	//#region ../p2p-media-loader-core/lib/p2p/peer.js
	var __awaiter$6 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __classPrivateFieldGet$6 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var __classPrivateFieldSet$5 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var _Peer_instances;
	var _Peer_peerProtocol;
	var _Peer_downloadingContext;
	var _Peer_loadedSegments;
	var _Peer_httpLoadingSegments;
	var _Peer_consecutiveTimeouts;
	var _Peer_bandwidthCalculator;
	var _Peer_cachedDownloadBandwidth;
	var _Peer_logger;
	var _Peer_nextRequestId;
	var _Peer_latestRequestedUploadRequestId;
	var _Peer_isDestroyed;
	var _Peer_closeConnection;
	var _Peer_eventHandlers;
	var _Peer_peerConfig;
	var _Peer_onCommandReceived;
	var _Peer_onSegmentChunkReceived;
	var _Peer_destroyOnPeerError;
	var _Peer_cancelSegmentDownloading;
	var _Peer_sendCancelSegmentRequestCommand;
	var _Peer_sendSegmentDataSendingCompletedCommand;
	var _Peer_sendCommand;
	var { PeerCommandType } = commands_exports;
	var Peer = class {
		get isDestroyed() {
			return __classPrivateFieldGet$6(this, _Peer_isDestroyed, "f");
		}
		constructor(id, channel, closeConnection, eventHandlers, peerConfig, eventTarget) {
			_Peer_instances.add(this);
			Object.defineProperty(this, "id", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: id
			});
			Object.defineProperty(this, "channel", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: channel
			});
			Object.defineProperty(this, "eventTarget", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: eventTarget
			});
			_Peer_peerProtocol.set(this, void 0);
			_Peer_downloadingContext.set(this, void 0);
			_Peer_loadedSegments.set(this, /* @__PURE__ */ new Set());
			_Peer_httpLoadingSegments.set(this, /* @__PURE__ */ new Set());
			_Peer_consecutiveTimeouts.set(this, 0);
			_Peer_bandwidthCalculator.set(this, new BandwidthCalculator());
			_Peer_cachedDownloadBandwidth.set(this, {
				value: 0,
				timestamp: 0
			});
			_Peer_logger.set(this, (0, import_browser.default)("p2pml-core:peer"));
			_Peer_nextRequestId.set(this, 0);
			_Peer_latestRequestedUploadRequestId.set(this, void 0);
			_Peer_isDestroyed.set(this, false);
			Object.defineProperty(this, "connectedAt", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: performance.now()
			});
			_Peer_closeConnection.set(this, void 0);
			_Peer_eventHandlers.set(this, void 0);
			_Peer_peerConfig.set(this, void 0);
			_Peer_onCommandReceived.set(this, (command) => __awaiter$6(this, void 0, void 0, function* () {
				var _a;
				switch (command.c) {
					case PeerCommandType.SegmentsAnnouncement:
						__classPrivateFieldSet$5(this, _Peer_loadedSegments, new Set(command.l), "f");
						__classPrivateFieldSet$5(this, _Peer_httpLoadingSegments, new Set(command.p), "f");
						__classPrivateFieldGet$6(this, _Peer_eventHandlers, "f").onSegmentsAnnouncement();
						break;
					case PeerCommandType.SegmentRequest:
						__classPrivateFieldSet$5(this, _Peer_latestRequestedUploadRequestId, command.r, "f");
						__classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").stopUploadingSegmentData();
						__classPrivateFieldGet$6(this, _Peer_eventHandlers, "f").onSegmentRequested(this, command.i, command.r, command.b);
						break;
					case PeerCommandType.SegmentData:
						{
							if (!__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) break;
							if (__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f").isSegmentDataCommandReceived) break;
							const { request, controls, requestId } = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f");
							if (request.segment.externalId !== command.i || requestId !== command.r) break;
							__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f").isSegmentDataCommandReceived = true;
							controls.firstBytesReceived();
							if (request.totalBytes === void 0) request.setTotalBytes(request.loadedBytes + command.s);
							else if (request.totalBytes - request.loadedBytes !== command.s) __classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "bytes-length-mismatch", "Peer response bytes length mismatch");
						}
						break;
					case PeerCommandType.SegmentDataSendingCompleted: {
						const downloadingContext = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f");
						if (!(downloadingContext === null || downloadingContext === void 0 ? void 0 : downloadingContext.isSegmentDataCommandReceived)) return;
						const { request, controls, requestId } = downloadingContext;
						if (request.segment.externalId !== command.i || requestId !== command.r) {
							__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "protocol-violation", "Peer protocol violation");
							return;
						}
						if (request.loadedBytes !== request.totalBytes) {
							__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "bytes-length-mismatch", "Peer response bytes length mismatch");
							return;
						}
						const isValid = yield request.validateData(__classPrivateFieldGet$6(this, _Peer_peerConfig, "f").validateP2PSegment);
						if (__classPrivateFieldGet$6(this, _Peer_isDestroyed, "f")) return;
						if (__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f") !== downloadingContext) return;
						if (!isValid) {
							__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "validation-failed", "P2P segment validation failed");
							return;
						}
						__classPrivateFieldSet$5(this, _Peer_consecutiveTimeouts, 0, "f");
						controls.completeOnSuccess();
						__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").stopLoading();
						__classPrivateFieldSet$5(this, _Peer_downloadingContext, void 0, "f");
						break;
					}
					case PeerCommandType.SegmentAbsent:
						__classPrivateFieldGet$6(this, _Peer_loadedSegments, "f").delete(command.i);
						if (((_a = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.request.segment.externalId) === command.i && __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f").requestId === command.r) __classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-segment-absent");
						break;
					case PeerCommandType.CancelSegmentRequest:
						if (__classPrivateFieldGet$6(this, _Peer_latestRequestedUploadRequestId, "f") === command.r) __classPrivateFieldSet$5(this, _Peer_latestRequestedUploadRequestId, void 0, "f");
						if (__classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").getUploadingRequestId() !== command.r) break;
						__classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").stopUploadingSegmentData();
						break;
				}
			}));
			_Peer_onSegmentChunkReceived.set(this, (chunk) => {
				var _a;
				if (!((_a = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.isSegmentDataCommandReceived)) return;
				const { request, controls } = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f");
				if (request.totalBytes !== void 0 && request.loadedBytes + chunk.byteLength > request.totalBytes) {
					__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "bytes-length-mismatch", "Peer response bytes length mismatch");
					return;
				}
				__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").addBytes(chunk.byteLength);
				__classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").timestamp = 0;
				controls.addLoadedChunk(chunk);
			});
			__classPrivateFieldSet$5(this, _Peer_closeConnection, closeConnection, "f");
			__classPrivateFieldSet$5(this, _Peer_eventHandlers, eventHandlers, "f");
			__classPrivateFieldSet$5(this, _Peer_peerConfig, peerConfig, "f");
			__classPrivateFieldSet$5(this, _Peer_peerProtocol, new PeerProtocol(channel, peerConfig, {
				onSegmentChunkReceived: __classPrivateFieldGet$6(this, _Peer_onSegmentChunkReceived, "f"),
				onCommandReceived: (command) => void __classPrivateFieldGet$6(this, _Peer_onCommandReceived, "f").call(this, command).catch((error) => {
					__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, "error processing command %O: %O", command, error);
					this.destroy(false, new PeerError("protocol-violation", error instanceof Error ? error.message : "Error processing command", error));
				}),
				onProtocolError: (error) => {
					this.destroy(false, new PeerError("protocol-violation", error instanceof Error ? error.message : "Protocol error", error));
				}
			}, eventTarget, id), "f");
		}
		get downloadingSegment() {
			var _a;
			return (_a = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.request.segment;
		}
		get isUploadingSegment() {
			return __classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").getUploadingRequestId() !== void 0;
		}
		getDownloadBandwidth() {
			const now = performance.now();
			if (now - __classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").timestamp > 1e3) {
				__classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").value = __classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").getBandwidthLoadingOnly(15);
				__classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").timestamp = now;
			}
			return __classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").value;
		}
		getSegmentStatus(segment) {
			const { externalId } = segment;
			if (__classPrivateFieldGet$6(this, _Peer_loadedSegments, "f").has(externalId)) return "loaded";
			if (__classPrivateFieldGet$6(this, _Peer_httpLoadingSegments, "f").has(externalId)) return "http-loading";
		}
		downloadSegment(segmentRequest) {
			if (__classPrivateFieldGet$6(this, _Peer_isDestroyed, "f")) return;
			if (__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) throw new Error("Some segment already is downloading");
			if (segmentRequest.tryCompleteByLoadedBytes({
				downloadSource: "p2p",
				peerId: this.id
			}, {
				notReceivingBytesTimeoutMs: __classPrivateFieldGet$6(this, _Peer_peerConfig, "f").p2pNotReceivingBytesTimeoutMs,
				onAbort: () => void 0
			}, __classPrivateFieldGet$6(this, _Peer_peerConfig, "f").validateP2PSegment, "p2p-segment-validation-failed")) return;
			__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").startLoading();
			__classPrivateFieldSet$5(this, _Peer_nextRequestId, (__classPrivateFieldGet$6(this, _Peer_nextRequestId, "f") + 1) % 1e9, "f");
			__classPrivateFieldSet$5(this, _Peer_downloadingContext, {
				request: segmentRequest,
				requestId: __classPrivateFieldGet$6(this, _Peer_nextRequestId, "f"),
				isSegmentDataCommandReceived: false,
				controls: segmentRequest.start({
					downloadSource: "p2p",
					peerId: this.id
				}, {
					notReceivingBytesTimeoutMs: __classPrivateFieldGet$6(this, _Peer_peerConfig, "f").p2pNotReceivingBytesTimeoutMs,
					onAbort: (error) => {
						var _a;
						if (!__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f") || __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f").request !== segmentRequest) return;
						const { request, requestId } = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f");
						__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCancelSegmentRequestCommand).call(this, request.segment, requestId);
						__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").stopLoading();
						if (error.type !== "abort") {
							__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").clear();
							__classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").timestamp = 0;
							__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `cleared bandwidth history due to ${error.type}`);
						}
						__classPrivateFieldSet$5(this, _Peer_downloadingContext, void 0, "f");
						if (error.type === "bytes-receiving-timeout") __classPrivateFieldSet$5(this, _Peer_consecutiveTimeouts, (_a = __classPrivateFieldGet$6(this, _Peer_consecutiveTimeouts, "f"), _a++, _a), "f");
						if (__classPrivateFieldGet$6(this, _Peer_consecutiveTimeouts, "f") >= __classPrivateFieldGet$6(this, _Peer_peerConfig, "f").p2pErrorRetries) this.destroy(false, new PeerError("timeout", "Too many timeout errors"));
						else if (error.type === "bytes-receiving-timeout") __classPrivateFieldGet$6(this, _Peer_eventHandlers, "f").onWarning(new PeerWarning("timeout-strike", `Timeout strike ${__classPrivateFieldGet$6(this, _Peer_consecutiveTimeouts, "f")}/${__classPrivateFieldGet$6(this, _Peer_peerConfig, "f").p2pErrorRetries}`));
					}
				})
			}, "f");
			const command = {
				c: PeerCommandType.SegmentRequest,
				r: __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f").requestId,
				i: segmentRequest.segment.externalId
			};
			if (segmentRequest.loadedBytes) command.b = segmentRequest.loadedBytes;
			if (!__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCommand).call(this, command)) __classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-closed");
		}
		uploadSegmentData(segment, requestId, data) {
			return __awaiter$6(this, void 0, void 0, function* () {
				if (__classPrivateFieldGet$6(this, _Peer_isDestroyed, "f")) return;
				if (requestId !== __classPrivateFieldGet$6(this, _Peer_latestRequestedUploadRequestId, "f")) {
					__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `discarding obsolete upload request ${requestId} for segment ${segment.externalId}`);
					return;
				}
				const { externalId } = segment;
				__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `send segment ${segment.externalId} to ${this.id} (byteLength: ${data.byteLength})`);
				const command = {
					c: PeerCommandType.SegmentData,
					i: externalId,
					r: requestId,
					s: data.byteLength
				};
				if (!__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCommand).call(this, command)) return;
				try {
					yield __classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").splitSegmentDataToChunksAndUploadAsync(data, requestId);
					if (this.isDestroyed || requestId !== __classPrivateFieldGet$6(this, _Peer_latestRequestedUploadRequestId, "f")) return;
					__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendSegmentDataSendingCompletedCommand).call(this, segment, requestId);
					__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `segment ${externalId} has been sent to ${this.id}`);
				} catch (error) {
					__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `cancel segment uploading ${externalId}: %O`, error);
				}
			});
		}
		sendSegmentsAnnouncementCommand(loadedSegmentsIds, httpLoadingSegmentsIds) {
			const command = {
				c: PeerCommandType.SegmentsAnnouncement,
				p: httpLoadingSegmentsIds,
				l: loadedSegmentsIds
			};
			__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCommand).call(this, command);
		}
		sendSegmentAbsentCommand(segmentExternalId, requestId) {
			__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCommand).call(this, {
				c: PeerCommandType.SegmentAbsent,
				i: segmentExternalId,
				r: requestId
			});
		}
		destroy(isConnectionClosed = false, error) {
			if (__classPrivateFieldGet$6(this, _Peer_isDestroyed, "f")) return;
			__classPrivateFieldSet$5(this, _Peer_isDestroyed, true, "f");
			__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-closed", error);
			__classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").destroy();
			if (!isConnectionClosed) __classPrivateFieldGet$6(this, _Peer_closeConnection, "f").call(this, error);
			__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `peer closed ${this.id}`);
		}
	};
	_Peer_peerProtocol = /* @__PURE__ */ new WeakMap(), _Peer_downloadingContext = /* @__PURE__ */ new WeakMap(), _Peer_loadedSegments = /* @__PURE__ */ new WeakMap(), _Peer_httpLoadingSegments = /* @__PURE__ */ new WeakMap(), _Peer_consecutiveTimeouts = /* @__PURE__ */ new WeakMap(), _Peer_bandwidthCalculator = /* @__PURE__ */ new WeakMap(), _Peer_cachedDownloadBandwidth = /* @__PURE__ */ new WeakMap(), _Peer_logger = /* @__PURE__ */ new WeakMap(), _Peer_nextRequestId = /* @__PURE__ */ new WeakMap(), _Peer_latestRequestedUploadRequestId = /* @__PURE__ */ new WeakMap(), _Peer_isDestroyed = /* @__PURE__ */ new WeakMap(), _Peer_closeConnection = /* @__PURE__ */ new WeakMap(), _Peer_eventHandlers = /* @__PURE__ */ new WeakMap(), _Peer_peerConfig = /* @__PURE__ */ new WeakMap(), _Peer_onCommandReceived = /* @__PURE__ */ new WeakMap(), _Peer_onSegmentChunkReceived = /* @__PURE__ */ new WeakMap(), _Peer_instances = /* @__PURE__ */ new WeakSet(), _Peer_destroyOnPeerError = function _Peer_destroyOnPeerError(type, message) {
		var _a;
		(_a = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) === null || _a === void 0 || _a.request.clearLoadedBytes();
		const error = new PeerError(type, message);
		__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-closed", error);
		this.destroy(false, error);
	}, _Peer_cancelSegmentDownloading = function _Peer_cancelSegmentDownloading(type, cause) {
		if (!__classPrivateFieldGet$6(this, _Peer_downloadingContext, "f")) return;
		const { request, controls } = __classPrivateFieldGet$6(this, _Peer_downloadingContext, "f");
		const { segment } = request;
		__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `cancel segment request ${segment.externalId} (${type})`);
		const error = new RequestError(type, void 0, cause);
		controls.failWithError(error);
		__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").stopLoading();
		if (type !== "peer-segment-absent") {
			__classPrivateFieldGet$6(this, _Peer_bandwidthCalculator, "f").clear();
			__classPrivateFieldGet$6(this, _Peer_cachedDownloadBandwidth, "f").timestamp = 0;
			__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, `cleared bandwidth history due to ${error.type}`);
		}
		__classPrivateFieldSet$5(this, _Peer_downloadingContext, void 0, "f");
	}, _Peer_sendCancelSegmentRequestCommand = function _Peer_sendCancelSegmentRequestCommand(segment, requestId) {
		__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCommand).call(this, {
			c: PeerCommandType.CancelSegmentRequest,
			i: segment.externalId,
			r: requestId
		});
	}, _Peer_sendSegmentDataSendingCompletedCommand = function _Peer_sendSegmentDataSendingCompletedCommand(segment, requestId) {
		__classPrivateFieldGet$6(this, _Peer_instances, "m", _Peer_sendCommand).call(this, {
			c: PeerCommandType.SegmentDataSendingCompleted,
			r: requestId,
			i: segment.externalId
		});
	}, _Peer_sendCommand = function _Peer_sendCommand(command) {
		if (__classPrivateFieldGet$6(this, _Peer_isDestroyed, "f")) return false;
		try {
			__classPrivateFieldGet$6(this, _Peer_peerProtocol, "f").sendCommand(command);
			return true;
		} catch (error) {
			__classPrivateFieldGet$6(this, _Peer_logger, "f").call(this, "error sending command %d: %O", command.c, error);
			return false;
		}
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/utils/event-target.js
	var EventTarget = class {
		constructor() {
			Object.defineProperty(this, "events", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: /* @__PURE__ */ new Map()
			});
		}
		dispatchEvent(eventName, a1, a2, a3, a4, a5) {
			const listeners = this.events.get(eventName);
			if (!listeners) return;
			for (const listener of listeners) try {
				listener(a1, a2, a3, a4, a5);
			} catch (_a) {}
		}
		getEventDispatcher(eventName) {
			return (a1, a2, a3, a4, a5) => {
				const listeners = this.events.get(eventName);
				if (!listeners) return;
				for (const listener of listeners) try {
					listener(a1, a2, a3, a4, a5);
				} catch (_a) {}
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
	//#region ../p2p-media-loader-core/lib/webtorrent/webtorrent-client/webrtc-utils.js
	var _a$1;
	var _b;
	var _c;
	var _d;
	var win = typeof window !== "undefined" ? window : {};
	var PeerConnection = (_b = (_a$1 = win.RTCPeerConnection) !== null && _a$1 !== void 0 ? _a$1 : win.webkitRTCPeerConnection) !== null && _b !== void 0 ? _b : win.mozRTCPeerConnection;
	var SessionDescription = (_d = (_c = win.RTCSessionDescription) !== null && _c !== void 0 ? _c : win.webkitRTCSessionDescription) !== null && _d !== void 0 ? _d : win.mozRTCSessionDescription;
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
			if (typeof (p === null || p === void 0 ? void 0 : p.then) === "function") {
				p.catch(() => {});
				return true;
			}
		} catch (_a) {} finally {
			try {
				pc === null || pc === void 0 || pc.close();
			} catch (_b) {}
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
	//#region ../p2p-media-loader-core/lib/webtorrent/webtorrent-client/index.js
	var __awaiter$5 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __classPrivateFieldGet$5 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var __classPrivateFieldSet$4 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var _WebTorrentClient_instances;
	var _a;
	var _WebTorrentClient_DEFAULT_ANNOUNCE_INTERVAL_SECONDS;
	var _WebTorrentClient_MIN_ANNOUNCE_INTERVAL_SECONDS;
	var _WebTorrentClient_config;
	var _WebTorrentClient_wsClient;
	var _WebTorrentClient_eventTarget;
	var _WebTorrentClient_pendingOffers;
	var _WebTorrentClient_negotiatingConnections;
	var _WebTorrentClient_destroyAbortController;
	var _WebTorrentClient_announceTimeoutId;
	var _WebTorrentClient_announceIntervalSeconds;
	var _WebTorrentClient_scheduleAnnounceRunId;
	var _WebTorrentClient_activeAnnouncePromise;
	var _WebTorrentClient_nextAnnounceEvent;
	var _WebTorrentClient_trackerId;
	var _WebTorrentClient_started;
	var _WebTorrentClient_isDestroyed;
	var _WebTorrentClient_throwIfDestroyed;
	var _WebTorrentClient_onWsConnected;
	var _WebTorrentClient_onWsDisconnected;
	var _WebTorrentClient_onWsMessage;
	var _WebTorrentClient_scheduleAnnounce;
	var _WebTorrentClient_clearAnnounceTimeout;
	var _WebTorrentClient_announce;
	var _WebTorrentClient_createOffer;
	var _WebTorrentClient_sendStopped;
	var _WebTorrentClient_buildAnnouncePayload;
	var _WebTorrentClient_handleIncomingOffer;
	var _WebTorrentClient_handleIncomingAnswer;
	var _WebTorrentClient_waitForIceGathering;
	var _WebTorrentClient_waitForConnection;
	var _WebTorrentClient_cleanupPendingOffer;
	var _WebTorrentClient_cleanupPendingOffers;
	var _WebTorrentClient_cleanupNegotiatingConnections;
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
	var WebTorrentClient = class {
		constructor(config) {
			var _b, _c, _d, _e, _f, _g;
			_WebTorrentClient_instances.add(this);
			_WebTorrentClient_config.set(this, void 0);
			_WebTorrentClient_wsClient.set(this, void 0);
			_WebTorrentClient_eventTarget.set(this, new EventTarget());
			_WebTorrentClient_pendingOffers.set(this, /* @__PURE__ */ new Map());
			_WebTorrentClient_negotiatingConnections.set(this, /* @__PURE__ */ new Set());
			_WebTorrentClient_destroyAbortController.set(this, new SafeAbortController());
			_WebTorrentClient_announceTimeoutId.set(this, null);
			_WebTorrentClient_announceIntervalSeconds.set(this, null);
			_WebTorrentClient_scheduleAnnounceRunId.set(this, 0);
			_WebTorrentClient_activeAnnouncePromise.set(this, null);
			_WebTorrentClient_nextAnnounceEvent.set(this, void 0);
			_WebTorrentClient_trackerId.set(this, null);
			_WebTorrentClient_started.set(this, false);
			_WebTorrentClient_onWsConnected.set(this, () => {
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_scheduleAnnounce).call(this, __classPrivateFieldGet$5(_a, _a, "f", _WebTorrentClient_DEFAULT_ANNOUNCE_INTERVAL_SECONDS));
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_announce).call(this, "started").catch((err) => {
					if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
					__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("announce-failed", `Initial announce failed: ${err instanceof Error ? err.message : String(err)}`, err));
				});
			});
			_WebTorrentClient_onWsDisconnected.set(this, () => {
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_clearAnnounceTimeout).call(this);
				__classPrivateFieldSet$4(this, _WebTorrentClient_announceIntervalSeconds, null, "f");
			});
			_WebTorrentClient_onWsMessage.set(this, (data) => {
				if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
				let msg;
				try {
					const text = typeof data === "string" ? data : new TextDecoder().decode(data);
					msg = JSON.parse(text);
				} catch (err) {
					__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("parse-error", `Failed to parse tracker message: ${err instanceof Error ? err.message : String(err)}`, err));
					return;
				}
				if (typeof msg !== "object" || msg === null || Array.isArray(msg)) return;
				const dataObject = msg;
				const infoHash = dataObject.info_hash;
				if (typeof infoHash === "string" && infoHash !== __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").infoHash) return;
				const warningMessage = dataObject["warning message"];
				if (typeof warningMessage === "string") __classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("warning", new TrackerWarning("tracker-response", warningMessage));
				const failureReason = dataObject["failure reason"];
				if (typeof failureReason === "string") {
					__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("tracker-response", failureReason));
					return;
				}
				const { interval } = dataObject;
				if (typeof interval === "number" && interval > 0) {
					const safeInterval = Math.max(__classPrivateFieldGet$5(_a, _a, "f", _WebTorrentClient_MIN_ANNOUNCE_INTERVAL_SECONDS), interval);
					if (__classPrivateFieldGet$5(this, _WebTorrentClient_announceIntervalSeconds, "f") !== safeInterval) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_scheduleAnnounce).call(this, safeInterval);
				}
				const trackerId = dataObject["tracker id"];
				if (typeof trackerId === "string") __classPrivateFieldSet$4(this, _WebTorrentClient_trackerId, trackerId, "f");
				const peerId = dataObject.peer_id;
				if (typeof peerId === "string" && peerId === __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").peerId) return;
				const offerId = dataObject.offer_id;
				if (typeof peerId !== "string" || typeof offerId !== "string") return;
				if (isSessionDescriptionInit(dataObject.offer)) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_handleIncomingOffer).call(this, {
					sdp: dataObject.offer,
					peerId,
					offerId
				}).catch((err) => {
					if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
					__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("signaling-failed", `Failed to handle offer: ${err instanceof Error ? err.message : String(err)}`, err));
				});
				else if (isSessionDescriptionInit(dataObject.answer)) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_handleIncomingAnswer).call(this, {
					sdp: dataObject.answer,
					peerId,
					offerId
				}).catch((err) => {
					if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
					__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("signaling-failed", `Failed to handle answer: ${err instanceof Error ? err.message : String(err)}`, err));
				});
			});
			__classPrivateFieldSet$4(this, _WebTorrentClient_config, {
				infoHash: config.infoHash,
				peerId: config.peerId,
				rtcConfig: config.rtcConfig,
				channelConfig: config.channelConfig,
				offerTimeout: (_b = config.offerTimeout) !== null && _b !== void 0 ? _b : (() => WEBTORRENT_DEFAULT_OFFER_TIMEOUT),
				offersCount: (_c = config.offersCount) !== null && _c !== void 0 ? _c : (() => WEBTORRENT_DEFAULT_OFFERS_COUNT),
				iceGatheringTimeout: (_d = config.iceGatheringTimeout) !== null && _d !== void 0 ? _d : (() => WEBTORRENT_DEFAULT_ICE_GATHERING_TIMEOUT),
				connectionTimeout: (_e = config.connectionTimeout) !== null && _e !== void 0 ? _e : (() => WEBTORRENT_DEFAULT_CONNECTION_TIMEOUT),
				claimPeer: (_f = config.claimPeer) !== null && _f !== void 0 ? _f : (() => true),
				shouldGenerateOffers: (_g = config.shouldGenerateOffers) !== null && _g !== void 0 ? _g : (() => true)
			}, "f");
			__classPrivateFieldSet$4(this, _WebTorrentClient_wsClient, config.wsClient, "f");
		}
		addEventListener(eventName, listener) {
			__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").addEventListener(eventName, listener);
		}
		removeEventListener(eventName, listener) {
			__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").removeEventListener(eventName, listener);
		}
		start() {
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this) || __classPrivateFieldGet$5(this, _WebTorrentClient_started, "f")) return;
			__classPrivateFieldSet$4(this, _WebTorrentClient_started, true, "f");
			__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").addEventListener("connected", __classPrivateFieldGet$5(this, _WebTorrentClient_onWsConnected, "f"));
			__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").addEventListener("disconnected", __classPrivateFieldGet$5(this, _WebTorrentClient_onWsDisconnected, "f"));
			__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").addEventListener("message", __classPrivateFieldGet$5(this, _WebTorrentClient_onWsMessage, "f"));
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").state === "connected") __classPrivateFieldGet$5(this, _WebTorrentClient_onWsConnected, "f").call(this);
		}
		destroy() {
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
			__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").abort();
			__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_clearAnnounceTimeout).call(this);
			__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_sendStopped).call(this);
			__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffers).call(this);
			__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupNegotiatingConnections).call(this);
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_started, "f")) {
				__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").removeEventListener("connected", __classPrivateFieldGet$5(this, _WebTorrentClient_onWsConnected, "f"));
				__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").removeEventListener("disconnected", __classPrivateFieldGet$5(this, _WebTorrentClient_onWsDisconnected, "f"));
				__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").removeEventListener("message", __classPrivateFieldGet$5(this, _WebTorrentClient_onWsMessage, "f"));
			}
			__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").clear();
		}
	};
	_a = WebTorrentClient, _WebTorrentClient_config = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_wsClient = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_eventTarget = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_pendingOffers = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_negotiatingConnections = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_destroyAbortController = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_announceTimeoutId = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_announceIntervalSeconds = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_scheduleAnnounceRunId = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_activeAnnouncePromise = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_nextAnnounceEvent = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_trackerId = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_started = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_onWsConnected = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_onWsDisconnected = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_onWsMessage = /* @__PURE__ */ new WeakMap(), _WebTorrentClient_instances = /* @__PURE__ */ new WeakSet(), _WebTorrentClient_isDestroyed = function _WebTorrentClient_isDestroyed() {
		return __classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted;
	}, _WebTorrentClient_throwIfDestroyed = function _WebTorrentClient_throwIfDestroyed() {
		if (__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted) throw new Error("Client destroyed");
	}, _WebTorrentClient_scheduleAnnounce = function _WebTorrentClient_scheduleAnnounce(intervalSeconds) {
		var _b;
		__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_clearAnnounceTimeout).call(this);
		__classPrivateFieldSet$4(this, _WebTorrentClient_announceIntervalSeconds, intervalSeconds, "f");
		const runId = __classPrivateFieldSet$4(this, _WebTorrentClient_scheduleAnnounceRunId, (_b = __classPrivateFieldGet$5(this, _WebTorrentClient_scheduleAnnounceRunId, "f"), ++_b), "f");
		const run = () => __awaiter$5(this, void 0, void 0, function* () {
			try {
				yield __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_announce).call(this);
			} catch (err) {
				if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
				__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("announce-failed", `Announce failed: ${err instanceof Error ? err.message : String(err)}`, err));
			}
			if (!__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this) && __classPrivateFieldGet$5(this, _WebTorrentClient_announceIntervalSeconds, "f") !== null && __classPrivateFieldGet$5(this, _WebTorrentClient_scheduleAnnounceRunId, "f") === runId) __classPrivateFieldSet$4(this, _WebTorrentClient_announceTimeoutId, setTimeout(run, __classPrivateFieldGet$5(this, _WebTorrentClient_announceIntervalSeconds, "f") * 1e3), "f");
		});
		__classPrivateFieldSet$4(this, _WebTorrentClient_announceTimeoutId, setTimeout(run, intervalSeconds * 1e3), "f");
	}, _WebTorrentClient_clearAnnounceTimeout = function _WebTorrentClient_clearAnnounceTimeout() {
		if (__classPrivateFieldGet$5(this, _WebTorrentClient_announceTimeoutId, "f") !== null) {
			clearTimeout(__classPrivateFieldGet$5(this, _WebTorrentClient_announceTimeoutId, "f"));
			__classPrivateFieldSet$4(this, _WebTorrentClient_announceTimeoutId, null, "f");
		}
	}, _WebTorrentClient_announce = function _WebTorrentClient_announce(event) {
		return __awaiter$5(this, void 0, void 0, function* () {
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this) || __classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").state !== "connected") return;
			if (event) __classPrivateFieldSet$4(this, _WebTorrentClient_nextAnnounceEvent, event, "f");
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_activeAnnouncePromise, "f")) return __classPrivateFieldGet$5(this, _WebTorrentClient_activeAnnouncePromise, "f");
			const promise = (() => __awaiter$5(this, void 0, void 0, function* () {
				const offersCount = __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").shouldGenerateOffers() ? __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").offersCount() : 0;
				const results = yield Promise.all(Array.from({ length: offersCount }, () => __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_createOffer).call(this)));
				if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) {
					for (const result of results) if (result) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, result.offer_id);
					return;
				}
				const offers = [];
				for (const result of results) if (result) offers.push(result);
				const currentEvent = __classPrivateFieldGet$5(this, _WebTorrentClient_nextAnnounceEvent, "f");
				__classPrivateFieldSet$4(this, _WebTorrentClient_nextAnnounceEvent, void 0, "f");
				const payload = __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_buildAnnouncePayload).call(this, {
					numwant: offers.length,
					offers,
					event: currentEvent
				});
				if (__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").state !== "connected") {
					for (const offer of offers) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offer.offer_id);
					return;
				}
				try {
					__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").send(JSON.stringify(payload));
				} catch (err) {
					for (const offer of offers) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offer.offer_id);
					throw err;
				}
			}))();
			__classPrivateFieldSet$4(this, _WebTorrentClient_activeAnnouncePromise, promise, "f");
			try {
				yield promise;
			} finally {
				if (__classPrivateFieldGet$5(this, _WebTorrentClient_activeAnnouncePromise, "f") === promise) __classPrivateFieldSet$4(this, _WebTorrentClient_activeAnnouncePromise, null, "f");
			}
		});
	}, _WebTorrentClient_createOffer = function _WebTorrentClient_createOffer() {
		return __awaiter$5(this, void 0, void 0, function* () {
			var _b, _c;
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return void 0;
			let pc;
			try {
				pc = new PeerConnection((_c = (_b = __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f")).rtcConfig) === null || _c === void 0 ? void 0 : _c.call(_b));
				__classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").add(pc);
				const channel = pc.createDataChannel("webtorrent", __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").channelConfig);
				const offer = yield safeCreateOffer(pc);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				yield safeSetLocalDescription(pc, offer);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				yield __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForIceGathering).call(this, pc);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				const sdp = pc.localDescription;
				if (!(sdp === null || sdp === void 0 ? void 0 : sdp.sdp)) {
					pc.close();
					return;
				}
				const offerId = generateOfferId();
				__classPrivateFieldGet$5(this, _WebTorrentClient_pendingOffers, "f").set(offerId, {
					connection: pc,
					channel,
					timeoutId: setTimeout(() => {
						__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offerId);
					}, __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").offerTimeout())
				});
				return {
					offer: {
						type: sdp.type,
						sdp: sdp.sdp
					},
					offer_id: offerId
				};
			} catch (err) {
				pc === null || pc === void 0 || pc.close();
				if (!__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) __classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("warning", new TrackerWarning("offer-failed", `Failed to create offer: ${err instanceof Error ? err.message : String(err)}`, err));
			} finally {
				if (pc) __classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").delete(pc);
			}
		});
	}, _WebTorrentClient_sendStopped = function _WebTorrentClient_sendStopped() {
		if (__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").state !== "connected") return;
		const payload = __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_buildAnnouncePayload).call(this, {
			numwant: 0,
			offers: [],
			event: "stopped"
		});
		try {
			__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").send(JSON.stringify(payload));
		} catch (_b) {}
	}, _WebTorrentClient_buildAnnouncePayload = function _WebTorrentClient_buildAnnouncePayload({ numwant, offers, event }) {
		const payload = {
			action: "announce",
			info_hash: __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").infoHash,
			peer_id: __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").peerId,
			numwant,
			uploaded: 0,
			downloaded: 0,
			offers
		};
		if (event) payload.event = event;
		if (__classPrivateFieldGet$5(this, _WebTorrentClient_trackerId, "f")) payload.trackerid = __classPrivateFieldGet$5(this, _WebTorrentClient_trackerId, "f");
		return payload;
	}, _WebTorrentClient_handleIncomingOffer = function _WebTorrentClient_handleIncomingOffer(_b) {
		return __awaiter$5(this, arguments, void 0, function* ({ sdp: offerSdp, peerId: remotePeerId, offerId: remoteOfferId }) {
			var _c, _d;
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
			if (!__classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").claimPeer(remotePeerId)) return;
			let pc;
			try {
				pc = new PeerConnection((_d = (_c = __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f")).rtcConfig) === null || _d === void 0 ? void 0 : _d.call(_c));
				__classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").add(pc);
				yield safeSetRemoteDescription(pc, new SessionDescription(offerSdp));
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				const answer = yield safeCreateAnswer(pc);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				yield safeSetLocalDescription(pc, answer);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				yield __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForIceGathering).call(this, pc);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				const sdp = pc.localDescription;
				if (!sdp) throw new Error("Failed to get local description after ICE gathering");
				const payload = {
					action: "announce",
					info_hash: __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").infoHash,
					peer_id: __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").peerId,
					to_peer_id: remotePeerId,
					offer_id: remoteOfferId,
					answer: {
						type: sdp.type,
						sdp: sdp.sdp
					}
				};
				__classPrivateFieldGet$5(this, _WebTorrentClient_wsClient, "f").send(JSON.stringify(payload));
				const channel = yield __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForConnection).call(this, pc);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnected", {
					peerId: remotePeerId,
					connection: pc,
					channel
				});
			} catch (err) {
				pc === null || pc === void 0 || pc.close();
				__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnectFailed", {
					peerId: remotePeerId,
					error: new PeerConnectError("connection-failed", err instanceof Error ? err.message : String(err), err)
				});
			} finally {
				if (pc) __classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").delete(pc);
			}
		});
	}, _WebTorrentClient_handleIncomingAnswer = function _WebTorrentClient_handleIncomingAnswer(_b) {
		return __awaiter$5(this, arguments, void 0, function* ({ sdp: answerSdp, peerId: remotePeerId, offerId: ourOfferId }) {
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) return;
			const pending = __classPrivateFieldGet$5(this, _WebTorrentClient_pendingOffers, "f").get(ourOfferId);
			if (!pending) return;
			__classPrivateFieldGet$5(this, _WebTorrentClient_pendingOffers, "f").delete(ourOfferId);
			clearTimeout(pending.timeoutId);
			if (!__classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").claimPeer(remotePeerId)) {
				pending.connection.close();
				return;
			}
			__classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").add(pending.connection);
			try {
				yield safeSetRemoteDescription(pending.connection, new SessionDescription(answerSdp));
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				const channel = yield __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForConnection).call(this, pending.connection, pending.channel);
				__classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
				__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnected", {
					peerId: remotePeerId,
					connection: pending.connection,
					channel
				});
			} catch (err) {
				pending.connection.close();
				__classPrivateFieldGet$5(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnectFailed", {
					peerId: remotePeerId,
					error: new PeerConnectError("connection-failed", err instanceof Error ? err.message : String(err), err)
				});
			} finally {
				__classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").delete(pending.connection);
			}
		});
	}, _WebTorrentClient_waitForIceGathering = function _WebTorrentClient_waitForIceGathering(pc) {
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
				__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.removeEventListener("abort", onAbort);
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
			if (__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted) {
				onAbort();
				return;
			}
			timeoutId = setTimeout(() => {
				cleanup();
				resolve();
			}, __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").iceGatheringTimeout());
			pc.addEventListener("icegatheringstatechange", onGatheringChange);
			pc.addEventListener("icecandidate", onIceCandidate);
			pc.addEventListener("signalingstatechange", onSignalingChange);
			__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.addEventListener("abort", onAbort);
		});
	}, _WebTorrentClient_waitForConnection = function _WebTorrentClient_waitForConnection(pc, channel) {
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
			__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.removeEventListener("abort", onAbort);
		};
		if (__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted) {
			onAbort();
			return promise;
		}
		if (rejectIfTerminalState()) return promise;
		timeoutId = setTimeout(() => {
			cleanup();
			reject(/* @__PURE__ */ new Error("Data channel open timeout"));
		}, __classPrivateFieldGet$5(this, _WebTorrentClient_config, "f").connectionTimeout());
		pc.addEventListener("iceconnectionstatechange", rejectIfTerminalState);
		__classPrivateFieldGet$5(this, _WebTorrentClient_destroyAbortController, "f").signal.addEventListener("abort", onAbort);
		if (boundChannel) bindDataChannel(boundChannel);
		else pc.addEventListener("datachannel", onDataChannel);
		return promise;
	}, _WebTorrentClient_cleanupPendingOffer = function _WebTorrentClient_cleanupPendingOffer(offerId, pending) {
		const entry = pending !== null && pending !== void 0 ? pending : __classPrivateFieldGet$5(this, _WebTorrentClient_pendingOffers, "f").get(offerId);
		if (entry) {
			clearTimeout(entry.timeoutId);
			entry.connection.close();
			__classPrivateFieldGet$5(this, _WebTorrentClient_pendingOffers, "f").delete(offerId);
		}
	}, _WebTorrentClient_cleanupPendingOffers = function _WebTorrentClient_cleanupPendingOffers() {
		for (const [offerId, pending] of __classPrivateFieldGet$5(this, _WebTorrentClient_pendingOffers, "f")) __classPrivateFieldGet$5(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offerId, pending);
	}, _WebTorrentClient_cleanupNegotiatingConnections = function _WebTorrentClient_cleanupNegotiatingConnections() {
		for (const pc of __classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f")) pc.close();
		__classPrivateFieldGet$5(this, _WebTorrentClient_negotiatingConnections, "f").clear();
	};
	_WebTorrentClient_DEFAULT_ANNOUNCE_INTERVAL_SECONDS = { value: 120 };
	_WebTorrentClient_MIN_ANNOUNCE_INTERVAL_SECONDS = { value: 20 };
	//#endregion
	//#region ../p2p-media-loader-core/lib/webtorrent/webtorrent-manager/index.js
	var __classPrivateFieldSet$3 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet$4 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _WebTorrentManager_instances;
	var _WebTorrentManager_config;
	var _WebTorrentManager_eventTarget;
	var _WebTorrentManager_connectingPeers;
	var _WebTorrentManager_connectedPeers;
	var _WebTorrentManager_clients;
	var _WebTorrentManager_destroyed;
	var _WebTorrentManager_started;
	var _WebTorrentManager_claimPeer;
	var _WebTorrentManager_closePeer;
	var _WebTorrentManager_addConnectedPeer;
	var WEBTORRENT_DEFAULT_MAX_PEERS = 50;
	var WEBTORRENT_DEFAULT_MAX_PEERS_MULTIPLIER = 1.5;
	var WebTorrentManager = class {
		constructor(config) {
			var _a, _b;
			_WebTorrentManager_instances.add(this);
			_WebTorrentManager_config.set(this, void 0);
			_WebTorrentManager_eventTarget.set(this, new EventTarget());
			_WebTorrentManager_connectingPeers.set(this, /* @__PURE__ */ new Set());
			_WebTorrentManager_connectedPeers.set(this, /* @__PURE__ */ new Map());
			_WebTorrentManager_clients.set(this, /* @__PURE__ */ new Set());
			_WebTorrentManager_destroyed.set(this, false);
			_WebTorrentManager_started.set(this, false);
			_WebTorrentManager_claimPeer.set(this, (remotePeerId) => {
				if (__classPrivateFieldGet$4(this, _WebTorrentManager_destroyed, "f")) return false;
				if (__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").has(remotePeerId) || __classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").has(remotePeerId)) return false;
				const hardLimit = Math.floor(__classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").maxPeers() * Math.max(1, __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").maxPeersMultiplier()));
				if (__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").size + __classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").size >= hardLimit) return false;
				__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").add(remotePeerId);
				return true;
			});
			__classPrivateFieldSet$3(this, _WebTorrentManager_config, Object.assign(Object.assign({}, config), {
				maxPeers: (_a = config.maxPeers) !== null && _a !== void 0 ? _a : (() => WEBTORRENT_DEFAULT_MAX_PEERS),
				maxPeersMultiplier: (_b = config.maxPeersMultiplier) !== null && _b !== void 0 ? _b : (() => WEBTORRENT_DEFAULT_MAX_PEERS_MULTIPLIER)
			}), "f");
		}
		addEventListener(eventName, listener) {
			__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").addEventListener(eventName, listener);
		}
		removeEventListener(eventName, listener) {
			__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").removeEventListener(eventName, listener);
		}
		start() {
			if (__classPrivateFieldGet$4(this, _WebTorrentManager_destroyed, "f") || __classPrivateFieldGet$4(this, _WebTorrentManager_started, "f")) return;
			__classPrivateFieldSet$3(this, _WebTorrentManager_started, true, "f");
			try {
				for (const url of __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").trackerUrls) {
					const { client: wsClient, release } = __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").socketPool.acquire(url);
					let addedToClients = false;
					try {
						const client = new WebTorrentClient({
							infoHash: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").infoHash,
							peerId: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").peerId,
							wsClient,
							rtcConfig: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").rtcConfig,
							channelConfig: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").channelConfig,
							claimPeer: __classPrivateFieldGet$4(this, _WebTorrentManager_claimPeer, "f"),
							offersCount: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").offersCount,
							offerTimeout: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").offerTimeout,
							iceGatheringTimeout: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").iceGatheringTimeout,
							connectionTimeout: __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").connectionTimeout,
							shouldGenerateOffers: () => __classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").size + __classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").size < __classPrivateFieldGet$4(this, _WebTorrentManager_config, "f").maxPeers()
						});
						const onPeerConnected = (event) => {
							__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").delete(event.peerId);
							__classPrivateFieldGet$4(this, _WebTorrentManager_instances, "m", _WebTorrentManager_addConnectedPeer).call(this, event.peerId, event.connection, event.channel, url);
						};
						const onPeerConnectFailed = (event) => {
							if (__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").has(event.peerId)) {
								__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").delete(event.peerId);
								__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerConnectFailed", {
									peerId: event.peerId,
									trackerUrl: url,
									error: event.error
								});
							}
						};
						const onWarning = (warning) => {
							__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("warning", {
								trackerUrl: url,
								warning
							});
						};
						const onError = (error) => {
							__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("error", {
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
						__classPrivateFieldGet$4(this, _WebTorrentManager_clients, "f").add({
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
			if (__classPrivateFieldGet$4(this, _WebTorrentManager_destroyed, "f")) return;
			__classPrivateFieldSet$3(this, _WebTorrentManager_destroyed, true, "f");
			for (const { client, releaseSocket, cleanupListeners } of __classPrivateFieldGet$4(this, _WebTorrentManager_clients, "f")) {
				cleanupListeners();
				client.destroy();
				releaseSocket();
			}
			__classPrivateFieldGet$4(this, _WebTorrentManager_clients, "f").clear();
			__classPrivateFieldGet$4(this, _WebTorrentManager_connectingPeers, "f").clear();
			const connectedSnapshot = [...__classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").entries()];
			__classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").clear();
			for (const [peerId, peer] of connectedSnapshot) {
				peer.cleanup();
				try {
					peer.channel.close();
				} catch (_a) {}
				try {
					peer.connection.close();
				} catch (_b) {}
				__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerDisconnected", {
					peerId,
					trackerUrl: peer.trackerUrl,
					disconnectReason: "Manager destroyed"
				});
			}
			__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").clear();
		}
	};
	_WebTorrentManager_config = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_eventTarget = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_connectingPeers = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_connectedPeers = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_clients = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_destroyed = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_started = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_claimPeer = /* @__PURE__ */ new WeakMap(), _WebTorrentManager_instances = /* @__PURE__ */ new WeakSet(), _WebTorrentManager_closePeer = function _WebTorrentManager_closePeer(peerId, cause) {
		if (__classPrivateFieldGet$4(this, _WebTorrentManager_destroyed, "f")) return;
		const connected = __classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").get(peerId);
		if (!connected) return;
		__classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").delete(peerId);
		connected.cleanup();
		try {
			connected.channel.close();
		} catch (_a) {}
		try {
			connected.connection.close();
		} catch (_b) {}
		__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerDisconnected", Object.assign({
			peerId,
			trackerUrl: connected.trackerUrl
		}, cause));
	}, _WebTorrentManager_addConnectedPeer = function _WebTorrentManager_addConnectedPeer(peerId, connection, channel, trackerUrl) {
		if (isTerminalConnectionState(connection.iceConnectionState)) {
			try {
				connection.close();
			} catch (_a) {}
			__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerConnectFailed", {
				peerId,
				trackerUrl,
				error: new PeerConnectError("connection-failed", "Connection failed during promotion")
			});
			return;
		}
		const onDisconnect = (cause) => __classPrivateFieldGet$4(this, _WebTorrentManager_instances, "m", _WebTorrentManager_closePeer).call(this, peerId, cause);
		const onIceConnectionStateChange = () => {
			if (isTerminalConnectionState(connection.iceConnectionState)) onDisconnect({ error: new PeerError("connection-lost", `ICE connection state became ${connection.iceConnectionState}`) });
		};
		const onChannelClose = () => onDisconnect({ disconnectReason: "Data channel closed" });
		const onChannelClosing = () => onDisconnect({ disconnectReason: "Data channel closing" });
		const onChannelError = (event) => {
			const msg = getRTCErrorMessage(event, "Data channel error");
			onDisconnect({ error: new PeerError("transport-error", `Data channel error: ${msg}`) });
		};
		let closeRef = (error) => __classPrivateFieldGet$4(this, _WebTorrentManager_instances, "m", _WebTorrentManager_closePeer).call(this, peerId, error ? { error } : { disconnectReason: "Closed by consumer" });
		const cleanup = () => {
			closeRef = null;
			connection.removeEventListener("iceconnectionstatechange", onIceConnectionStateChange);
			channel.removeEventListener("close", onChannelClose);
			channel.removeEventListener("closing", onChannelClosing);
			channel.removeEventListener("error", onChannelError);
		};
		__classPrivateFieldGet$4(this, _WebTorrentManager_connectedPeers, "f").set(peerId, {
			connection,
			channel,
			trackerUrl,
			cleanup
		});
		connection.addEventListener("iceconnectionstatechange", onIceConnectionStateChange);
		channel.addEventListener("close", onChannelClose);
		channel.addEventListener("closing", onChannelClosing);
		channel.addEventListener("error", onChannelError);
		__classPrivateFieldGet$4(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerConnected", {
			peerId,
			connection,
			channel,
			trackerUrl,
			close: (error) => closeRef === null || closeRef === void 0 ? void 0 : closeRef(error)
		});
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/utils/stream.js
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
	//#region ../p2p-media-loader-core/lib/p2p/loader.js
	var __awaiter$4 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __classPrivateFieldSet$2 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet$3 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _P2PLoader_instances;
	var _P2PLoader_webtorrentManager;
	var _P2PLoader_peersMap;
	var _P2PLoader_isAnnounceMicrotaskCreated;
	var _P2PLoader_webtorrentManagerLogger;
	var _P2PLoader_churnLogger;
	var _P2PLoader_stream;
	var _P2PLoader_requests;
	var _P2PLoader_segmentStorage;
	var _P2PLoader_config;
	var _P2PLoader_webTorrentSocketPool;
	var _P2PLoader_eventTarget;
	var _P2PLoader_onSegmentAnnouncement;
	var _P2PLoader_churnCleanupTimeoutId;
	var _P2PLoader_onPeerConnect;
	var _P2PLoader_onPeerConnectError;
	var _P2PLoader_onPeerClose;
	var _P2PLoader_onPeerError;
	var _P2PLoader_onPeerWarning;
	var _P2PLoader_onTrackerWarning;
	var _P2PLoader_onTrackerError;
	var _P2PLoader_churnCleanup;
	var _P2PLoader_getSegmentsAnnouncement;
	var _P2PLoader_onPeerConnectedWebTorrent;
	var _P2PLoader_onPeerDisconnectedWebTorrent;
	var _P2PLoader_sendSegmentsAnnouncement;
	var _P2PLoader_onSegmentRequested;
	var MIN_CHURN_CLEANUP_INTERVAL_MS = 1e3;
	var P2PLoader = class {
		constructor(stream, requests, segmentStorage, config, webTorrentSocketPool, eventTarget, peerId, onSegmentAnnouncement) {
			_P2PLoader_instances.add(this);
			_P2PLoader_webtorrentManager.set(this, void 0);
			_P2PLoader_peersMap.set(this, /* @__PURE__ */ new Map());
			_P2PLoader_isAnnounceMicrotaskCreated.set(this, false);
			_P2PLoader_webtorrentManagerLogger.set(this, (0, import_browser.default)("p2pml-core:webtorrent-manager"));
			_P2PLoader_churnLogger.set(this, (0, import_browser.default)("p2pml-core:churn-cleanup"));
			_P2PLoader_stream.set(this, void 0);
			_P2PLoader_requests.set(this, void 0);
			_P2PLoader_segmentStorage.set(this, void 0);
			_P2PLoader_config.set(this, void 0);
			_P2PLoader_webTorrentSocketPool.set(this, void 0);
			_P2PLoader_eventTarget.set(this, void 0);
			_P2PLoader_onSegmentAnnouncement.set(this, void 0);
			_P2PLoader_churnCleanupTimeoutId.set(this, void 0);
			_P2PLoader_onPeerConnect.set(this, void 0);
			_P2PLoader_onPeerConnectError.set(this, void 0);
			_P2PLoader_onPeerClose.set(this, void 0);
			_P2PLoader_onPeerError.set(this, void 0);
			_P2PLoader_onPeerWarning.set(this, void 0);
			_P2PLoader_onTrackerWarning.set(this, void 0);
			_P2PLoader_onTrackerError.set(this, void 0);
			_P2PLoader_churnCleanup.set(this, () => {
				__classPrivateFieldSet$2(this, _P2PLoader_churnCleanupTimeoutId, setTimeout(__classPrivateFieldGet$3(this, _P2PLoader_churnCleanup, "f"), Math.max(MIN_CHURN_CLEANUP_INTERVAL_MS, __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pChurnCleanupIntervalMs)), "f");
				const excessPeersCount = __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").size - __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pMaxPeers;
				if (excessPeersCount <= 0) return;
				const eligiblePeers = [];
				const now = performance.now();
				for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) {
					if (peer.downloadingSegment || peer.isUploadingSegment) continue;
					if (now - peer.connectedAt < __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pChurnGracePeriodMs) continue;
					eligiblePeers.push(peer);
				}
				if (eligiblePeers.length === 0) return;
				eligiblePeers.sort((a, b) => {
					return a.getDownloadBandwidth() - b.getDownloadBandwidth() || a.connectedAt - b.connectedAt;
				});
				const peersToDrop = eligiblePeers.slice(0, excessPeersCount);
				__classPrivateFieldGet$3(this, _P2PLoader_churnLogger, "f").call(this, `Background churn cleanup: dropping ${peersToDrop.length} excess peers (total: ${__classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").size}, target: ${__classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pMaxPeers}, eligible: ${eligiblePeers.length})`);
				for (const peer of peersToDrop) {
					__classPrivateFieldGet$3(this, _P2PLoader_churnLogger, "f").call(this, `dropping excess peer ${peer.id} with bandwidth ${peer.getDownloadBandwidth()}`);
					peer.destroy();
				}
			});
			_P2PLoader_onPeerConnectedWebTorrent.set(this, (event) => {
				__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `peerConnected: peerId=${event.peerId}`);
				if (__classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").has(event.peerId)) {
					event.close();
					return;
				}
				const peer = new Peer(event.peerId, event.channel, event.close, {
					onSegmentRequested: (peer, segmentExternalId, requestId, byteFrom) => {
						__classPrivateFieldGet$3(this, _P2PLoader_onSegmentRequested, "f").call(this, peer, segmentExternalId, requestId, byteFrom).catch((error) => {
							__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Error in onSegmentRequested ${segmentExternalId} for peer ${peer.id}:`, error);
						});
					},
					onSegmentsAnnouncement: __classPrivateFieldGet$3(this, _P2PLoader_onSegmentAnnouncement, "f"),
					onWarning: (warning) => {
						__classPrivateFieldGet$3(this, _P2PLoader_onPeerWarning, "f").call(this, {
							peerId: peer.id,
							infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
							streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
							trackerUrl: event.trackerUrl,
							warning
						});
					}
				}, {
					p2pNotReceivingBytesTimeoutMs: __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pNotReceivingBytesTimeoutMs,
					webRtcMaxMessageSize: __classPrivateFieldGet$3(this, _P2PLoader_config, "f").webRtcMaxMessageSize,
					p2pErrorRetries: __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pErrorRetries,
					validateP2PSegment: __classPrivateFieldGet$3(this, _P2PLoader_config, "f").validateP2PSegment,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash
				}, __classPrivateFieldGet$3(this, _P2PLoader_eventTarget, "f"));
				__classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").set(event.peerId, peer);
				__classPrivateFieldGet$3(this, _P2PLoader_onPeerConnect, "f").call(this, {
					peerId: event.peerId,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					trackerUrl: event.trackerUrl
				});
				if (__classPrivateFieldGet$3(this, _P2PLoader_config, "f").isP2PUploadDisabled) return;
				const { httpLoading, loaded } = __classPrivateFieldGet$3(this, _P2PLoader_instances, "m", _P2PLoader_getSegmentsAnnouncement).call(this);
				peer.sendSegmentsAnnouncementCommand(loaded, httpLoading);
			});
			_P2PLoader_onPeerDisconnectedWebTorrent.set(this, (event) => {
				var _a;
				__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, "peerDisconnected: peerId=%s error=%s reason=%s", event.peerId, (_a = event.error) === null || _a === void 0 ? void 0 : _a.message, event.disconnectReason);
				const peer = __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").get(event.peerId);
				if (!peer) return;
				__classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").delete(event.peerId);
				peer.destroy(true);
				if (event.error) __classPrivateFieldGet$3(this, _P2PLoader_onPeerError, "f").call(this, {
					peerId: event.peerId,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					trackerUrl: event.trackerUrl,
					error: event.error
				});
				__classPrivateFieldGet$3(this, _P2PLoader_onPeerClose, "f").call(this, {
					peerId: peer.id,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					trackerUrl: event.trackerUrl
				});
			});
			Object.defineProperty(this, "broadcastAnnouncement", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (sendEmptyAnnouncement = false) => {
					if (sendEmptyAnnouncement) {
						__classPrivateFieldGet$3(this, _P2PLoader_sendSegmentsAnnouncement, "f").call(this, sendEmptyAnnouncement);
						return;
					}
					if (__classPrivateFieldGet$3(this, _P2PLoader_isAnnounceMicrotaskCreated, "f") || __classPrivateFieldGet$3(this, _P2PLoader_config, "f").isP2PUploadDisabled) return;
					__classPrivateFieldGet$3(this, _P2PLoader_sendSegmentsAnnouncement, "f").call(this);
				}
			});
			_P2PLoader_sendSegmentsAnnouncement.set(this, (sendEmptyAnnouncement = false) => {
				__classPrivateFieldSet$2(this, _P2PLoader_isAnnounceMicrotaskCreated, true, "f");
				queueMicrotask(() => {
					const { loaded = [], httpLoading = [] } = sendEmptyAnnouncement ? {} : __classPrivateFieldGet$3(this, _P2PLoader_instances, "m", _P2PLoader_getSegmentsAnnouncement).call(this);
					for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) peer.sendSegmentsAnnouncementCommand(loaded, httpLoading);
					__classPrivateFieldSet$2(this, _P2PLoader_isAnnounceMicrotaskCreated, false, "f");
				});
			});
			_P2PLoader_onSegmentRequested.set(this, (peer, segmentExternalId, requestId, byteFrom) => __awaiter$4(this, void 0, void 0, function* () {
				const segment = getSegmentFromStreamByExternalId(__classPrivateFieldGet$3(this, _P2PLoader_stream, "f"), segmentExternalId);
				if (!segment) return;
				if (__classPrivateFieldGet$3(this, _P2PLoader_config, "f").isP2PUploadDisabled) {
					peer.sendSegmentAbsentCommand(segmentExternalId, requestId);
					return;
				}
				let segmentData;
				try {
					segmentData = yield __classPrivateFieldGet$3(this, _P2PLoader_segmentStorage, "f").getSegmentData(__classPrivateFieldGet$3(this, _P2PLoader_stream, "f").swarmId, __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").streamSwarmId, segment.externalId);
				} catch (error) {
					__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Storage error for segment ${segmentExternalId} requested by peer ${peer.id}:`, error);
				}
				if (!__classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").has(peer.id)) return;
				if (!segmentData) {
					peer.sendSegmentAbsentCommand(segmentExternalId, requestId);
					return;
				}
				yield peer.uploadSegmentData(segment, requestId, byteFrom !== void 0 ? new Uint8Array(segmentData).subarray(byteFrom) : segmentData);
			}));
			__classPrivateFieldSet$2(this, _P2PLoader_stream, stream, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_requests, requests, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_segmentStorage, segmentStorage, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_config, config, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_webTorrentSocketPool, webTorrentSocketPool, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_eventTarget, eventTarget, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onSegmentAnnouncement, onSegmentAnnouncement, "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onPeerConnect, eventTarget.getEventDispatcher("onPeerConnect"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onPeerConnectError, eventTarget.getEventDispatcher("onPeerConnectError"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onPeerClose, eventTarget.getEventDispatcher("onPeerClose"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onPeerError, eventTarget.getEventDispatcher("onPeerError"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onPeerWarning, eventTarget.getEventDispatcher("onPeerWarning"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onTrackerWarning, eventTarget.getEventDispatcher("onTrackerWarning"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_onTrackerError, eventTarget.getEventDispatcher("onTrackerError"), "f");
			__classPrivateFieldSet$2(this, _P2PLoader_webtorrentManager, new WebTorrentManager({
				infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
				peerId,
				trackerUrls: __classPrivateFieldGet$3(this, _P2PLoader_config, "f").announceTrackers,
				rtcConfig: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").rtcConfig,
				socketPool: __classPrivateFieldGet$3(this, _P2PLoader_webTorrentSocketPool, "f"),
				maxPeers: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pMaxPeers,
				maxPeersMultiplier: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pChurnMaxPeersMultiplier,
				offersCount: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").webRtcOffersCount,
				offerTimeout: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").webRtcOfferTimeoutMs,
				iceGatheringTimeout: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").webRtcIceGatheringTimeoutMs,
				connectionTimeout: () => __classPrivateFieldGet$3(this, _P2PLoader_config, "f").webRtcConnectionTimeoutMs
			}), "f");
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").addEventListener("peerConnected", __classPrivateFieldGet$3(this, _P2PLoader_onPeerConnectedWebTorrent, "f"));
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").addEventListener("peerDisconnected", __classPrivateFieldGet$3(this, _P2PLoader_onPeerDisconnectedWebTorrent, "f"));
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").addEventListener("peerConnectFailed", (event) => {
				__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Peer connection failed (${event.peerId}) from tracker ${event.trackerUrl}:`, event.error);
				__classPrivateFieldGet$3(this, _P2PLoader_onPeerConnectError, "f").call(this, {
					peerId: event.peerId,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					trackerUrl: event.trackerUrl,
					error: event.error
				});
			});
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").addEventListener("warning", (event) => {
				__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Tracker warning (${event.trackerUrl}):`, event.warning);
				__classPrivateFieldGet$3(this, _P2PLoader_onTrackerWarning, "f").call(this, {
					trackerUrl: event.trackerUrl,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					warning: event.warning
				});
			});
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").addEventListener("error", (event) => {
				__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Tracker error (${event.trackerUrl}):`, event.error);
				__classPrivateFieldGet$3(this, _P2PLoader_onTrackerError, "f").call(this, {
					trackerUrl: event.trackerUrl,
					infoHash: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").infoHash,
					streamType: __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").type,
					error: event.error
				});
			});
			__classPrivateFieldGet$3(this, _P2PLoader_eventTarget, "f").addEventListener(`onStorageUpdated-${__classPrivateFieldGet$3(this, _P2PLoader_stream, "f").streamSwarmId}`, this.broadcastAnnouncement);
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").start();
			__classPrivateFieldSet$2(this, _P2PLoader_churnCleanupTimeoutId, setTimeout(__classPrivateFieldGet$3(this, _P2PLoader_churnCleanup, "f"), Math.max(MIN_CHURN_CLEANUP_INTERVAL_MS, __classPrivateFieldGet$3(this, _P2PLoader_config, "f").p2pChurnCleanupIntervalMs)), "f");
		}
		downloadSegment(segment) {
			const peersWithSegment = [];
			for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) if (!peer.downloadingSegment && peer.getSegmentStatus(segment) === "loaded") peersWithSegment.push(peer);
			if (peersWithSegment.length === 0) return;
			const selectedPeer = selectPeerForDownload(peersWithSegment);
			const request = __classPrivateFieldGet$3(this, _P2PLoader_requests, "f").getOrCreateRequest(segment);
			selectedPeer.downloadSegment(request);
		}
		isSegmentLoadingOrLoadedBySomeone(segment) {
			for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) if (peer.getSegmentStatus(segment)) return true;
			return false;
		}
		isSegmentLoadedBySomeone(segment) {
			for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) if (peer.getSegmentStatus(segment) === "loaded") return true;
			return false;
		}
		get connectedPeerCount() {
			return __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").size;
		}
		*peers() {
			for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) yield peer;
		}
		destroy() {
			clearTimeout(__classPrivateFieldGet$3(this, _P2PLoader_churnCleanupTimeoutId, "f"));
			__classPrivateFieldSet$2(this, _P2PLoader_churnCleanupTimeoutId, void 0, "f");
			__classPrivateFieldGet$3(this, _P2PLoader_eventTarget, "f").removeEventListener(`onStorageUpdated-${__classPrivateFieldGet$3(this, _P2PLoader_stream, "f").streamSwarmId}`, this.broadcastAnnouncement);
			__classPrivateFieldGet$3(this, _P2PLoader_webtorrentManager, "f").destroy();
			for (const peer of __classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").values()) peer.destroy();
			__classPrivateFieldGet$3(this, _P2PLoader_peersMap, "f").clear();
		}
	};
	_P2PLoader_webtorrentManager = /* @__PURE__ */ new WeakMap(), _P2PLoader_peersMap = /* @__PURE__ */ new WeakMap(), _P2PLoader_isAnnounceMicrotaskCreated = /* @__PURE__ */ new WeakMap(), _P2PLoader_webtorrentManagerLogger = /* @__PURE__ */ new WeakMap(), _P2PLoader_churnLogger = /* @__PURE__ */ new WeakMap(), _P2PLoader_stream = /* @__PURE__ */ new WeakMap(), _P2PLoader_requests = /* @__PURE__ */ new WeakMap(), _P2PLoader_segmentStorage = /* @__PURE__ */ new WeakMap(), _P2PLoader_config = /* @__PURE__ */ new WeakMap(), _P2PLoader_webTorrentSocketPool = /* @__PURE__ */ new WeakMap(), _P2PLoader_eventTarget = /* @__PURE__ */ new WeakMap(), _P2PLoader_onSegmentAnnouncement = /* @__PURE__ */ new WeakMap(), _P2PLoader_churnCleanupTimeoutId = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerConnect = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerConnectError = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerClose = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerError = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerWarning = /* @__PURE__ */ new WeakMap(), _P2PLoader_onTrackerWarning = /* @__PURE__ */ new WeakMap(), _P2PLoader_onTrackerError = /* @__PURE__ */ new WeakMap(), _P2PLoader_churnCleanup = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerConnectedWebTorrent = /* @__PURE__ */ new WeakMap(), _P2PLoader_onPeerDisconnectedWebTorrent = /* @__PURE__ */ new WeakMap(), _P2PLoader_sendSegmentsAnnouncement = /* @__PURE__ */ new WeakMap(), _P2PLoader_onSegmentRequested = /* @__PURE__ */ new WeakMap(), _P2PLoader_instances = /* @__PURE__ */ new WeakSet(), _P2PLoader_getSegmentsAnnouncement = function _P2PLoader_getSegmentsAnnouncement() {
		const loaded = __classPrivateFieldGet$3(this, _P2PLoader_segmentStorage, "f").getStoredSegmentIds(__classPrivateFieldGet$3(this, _P2PLoader_stream, "f").swarmId, __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").streamSwarmId);
		const httpLoading = [];
		for (const request of __classPrivateFieldGet$3(this, _P2PLoader_requests, "f").httpRequests()) {
			const segment = __classPrivateFieldGet$3(this, _P2PLoader_stream, "f").segments.get(request.segment.runtimeId);
			if (!segment) continue;
			httpLoading.push(segment.externalId);
		}
		return {
			loaded,
			httpLoading
		};
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
	//#region ../p2p-media-loader-core/lib/utils/logger.js
	function getStreamString(stream) {
		return `${stream.type}-${stream.identityHash}`;
	}
	function getSegmentString(segment) {
		const { externalId } = segment;
		return `(${getStreamString(segment.stream)} | ${externalId})`;
	}
	//#endregion
	//#region ../p2p-media-loader-core/lib/p2p/loaders-container.js
	var __classPrivateFieldSet$1 = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet$2 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _P2PLoadersContainer_instances;
	var _P2PLoadersContainer_loaders;
	var _P2PLoadersContainer_currentLoaderItem;
	var _P2PLoadersContainer_logger;
	var _P2PLoadersContainer_requests;
	var _P2PLoadersContainer_segmentStorage;
	var _P2PLoadersContainer_config;
	var _P2PLoadersContainer_webTorrentSocketPool;
	var _P2PLoadersContainer_eventTarget;
	var _P2PLoadersContainer_peerId;
	var _P2PLoadersContainer_onSegmentAnnouncement;
	var _P2PLoadersContainer_createLoader;
	var _P2PLoadersContainer_findOrCreateLoaderForStream;
	var _P2PLoadersContainer_setLoaderDestroyTimeout;
	var _P2PLoadersContainer_destroyAndRemoveLoader;
	var P2PLoadersContainer = class {
		constructor(stream, requests, segmentStorage, config, webTorrentSocketPool, eventTarget, peerId, onSegmentAnnouncement) {
			_P2PLoadersContainer_instances.add(this);
			_P2PLoadersContainer_loaders.set(this, /* @__PURE__ */ new Map());
			_P2PLoadersContainer_currentLoaderItem.set(this, void 0);
			_P2PLoadersContainer_logger.set(this, (0, import_browser.default)("p2pml-core:p2p-loaders-container"));
			_P2PLoadersContainer_requests.set(this, void 0);
			_P2PLoadersContainer_segmentStorage.set(this, void 0);
			_P2PLoadersContainer_config.set(this, void 0);
			_P2PLoadersContainer_webTorrentSocketPool.set(this, void 0);
			_P2PLoadersContainer_eventTarget.set(this, void 0);
			_P2PLoadersContainer_peerId.set(this, void 0);
			_P2PLoadersContainer_onSegmentAnnouncement.set(this, void 0);
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_requests, requests, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_segmentStorage, segmentStorage, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_config, config, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_webTorrentSocketPool, webTorrentSocketPool, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_eventTarget, eventTarget, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_peerId, peerId, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_onSegmentAnnouncement, onSegmentAnnouncement, "f");
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_currentLoaderItem, __classPrivateFieldGet$2(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_findOrCreateLoaderForStream).call(this, stream), "f");
			__classPrivateFieldGet$2(this, _P2PLoadersContainer_logger, "f").call(this, `set current p2p loader: ${getStreamString(stream)}`);
		}
		changeCurrentLoader(stream) {
			const currentStream = __classPrivateFieldGet$2(this, _P2PLoadersContainer_currentLoaderItem, "f").stream;
			if (!__classPrivateFieldGet$2(this, _P2PLoadersContainer_segmentStorage, "f").getStoredSegmentIds(currentStream.swarmId, currentStream.streamSwarmId).length) __classPrivateFieldGet$2(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_destroyAndRemoveLoader).call(this, __classPrivateFieldGet$2(this, _P2PLoadersContainer_currentLoaderItem, "f"));
			else __classPrivateFieldGet$2(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_setLoaderDestroyTimeout).call(this, __classPrivateFieldGet$2(this, _P2PLoadersContainer_currentLoaderItem, "f"));
			__classPrivateFieldSet$1(this, _P2PLoadersContainer_currentLoaderItem, __classPrivateFieldGet$2(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_findOrCreateLoaderForStream).call(this, stream), "f");
			__classPrivateFieldGet$2(this, _P2PLoadersContainer_logger, "f").call(this, `change current p2p loader: ${getStreamString(stream)}`);
		}
		get currentLoader() {
			return __classPrivateFieldGet$2(this, _P2PLoadersContainer_currentLoaderItem, "f").loader;
		}
		destroy() {
			for (const { loader, destroyTimeoutId } of __classPrivateFieldGet$2(this, _P2PLoadersContainer_loaders, "f").values()) {
				loader.destroy();
				clearTimeout(destroyTimeoutId);
			}
			__classPrivateFieldGet$2(this, _P2PLoadersContainer_loaders, "f").clear();
		}
	};
	_P2PLoadersContainer_loaders = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_currentLoaderItem = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_logger = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_requests = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_segmentStorage = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_config = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_webTorrentSocketPool = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_eventTarget = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_peerId = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_onSegmentAnnouncement = /* @__PURE__ */ new WeakMap(), _P2PLoadersContainer_instances = /* @__PURE__ */ new WeakSet(), _P2PLoadersContainer_createLoader = function _P2PLoadersContainer_createLoader(stream) {
		if (__classPrivateFieldGet$2(this, _P2PLoadersContainer_loaders, "f").has(stream.runtimeId)) throw new Error("Loader for this stream already exists");
		const loader = new P2PLoader(stream, __classPrivateFieldGet$2(this, _P2PLoadersContainer_requests, "f"), __classPrivateFieldGet$2(this, _P2PLoadersContainer_segmentStorage, "f"), __classPrivateFieldGet$2(this, _P2PLoadersContainer_config, "f"), __classPrivateFieldGet$2(this, _P2PLoadersContainer_webTorrentSocketPool, "f"), __classPrivateFieldGet$2(this, _P2PLoadersContainer_eventTarget, "f"), __classPrivateFieldGet$2(this, _P2PLoadersContainer_peerId, "f"), () => {
			if (__classPrivateFieldGet$2(this, _P2PLoadersContainer_currentLoaderItem, "f").loader === loader) __classPrivateFieldGet$2(this, _P2PLoadersContainer_onSegmentAnnouncement, "f").call(this);
		});
		const loggerInfo = getStreamString(stream);
		__classPrivateFieldGet$2(this, _P2PLoadersContainer_logger, "f").call(this, `created new loader: ${loggerInfo}`);
		return {
			loader,
			stream,
			loggerInfo
		};
	}, _P2PLoadersContainer_findOrCreateLoaderForStream = function _P2PLoadersContainer_findOrCreateLoaderForStream(stream) {
		const loaderItem = __classPrivateFieldGet$2(this, _P2PLoadersContainer_loaders, "f").get(stream.runtimeId);
		if (loaderItem) {
			clearTimeout(loaderItem.destroyTimeoutId);
			loaderItem.destroyTimeoutId = void 0;
			return loaderItem;
		} else {
			const loader = __classPrivateFieldGet$2(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_createLoader).call(this, stream);
			__classPrivateFieldGet$2(this, _P2PLoadersContainer_loaders, "f").set(stream.runtimeId, loader);
			return loader;
		}
	}, _P2PLoadersContainer_setLoaderDestroyTimeout = function _P2PLoadersContainer_setLoaderDestroyTimeout(item) {
		item.destroyTimeoutId = window.setTimeout(() => __classPrivateFieldGet$2(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_destroyAndRemoveLoader).call(this, item), __classPrivateFieldGet$2(this, _P2PLoadersContainer_config, "f").p2pInactiveLoaderDestroyTimeoutMs);
	}, _P2PLoadersContainer_destroyAndRemoveLoader = function _P2PLoadersContainer_destroyAndRemoveLoader(item) {
		item.loader.destroy();
		__classPrivateFieldGet$2(this, _P2PLoadersContainer_loaders, "f").delete(item.stream.runtimeId);
		__classPrivateFieldGet$2(this, _P2PLoadersContainer_logger, "f").call(this, `destroy p2p loader: `, item.loggerInfo);
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/requests/request.js
	var __awaiter$3 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	function mapSegmentWithStreamToSegment(segment) {
		return {
			runtimeId: segment.runtimeId,
			externalId: segment.externalId,
			url: segment.url,
			byteRange: segment.byteRange && Object.assign({}, segment.byteRange),
			startTime: segment.startTime,
			endTime: segment.endTime
		};
	}
	var Request$1 = class {
		constructor(segment, requestProcessQueueCallback, bandwidthCalculators, playback, playbackConfig, eventTarget, infoHash) {
			Object.defineProperty(this, "segment", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: segment
			});
			Object.defineProperty(this, "requestProcessQueueCallback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: requestProcessQueueCallback
			});
			Object.defineProperty(this, "bandwidthCalculators", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: bandwidthCalculators
			});
			Object.defineProperty(this, "playback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: playback
			});
			Object.defineProperty(this, "playbackConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: playbackConfig
			});
			Object.defineProperty(this, "infoHash", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: infoHash
			});
			Object.defineProperty(this, "currentAttempt", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "_failedAttempts", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: new FailedRequestAttempts()
			});
			Object.defineProperty(this, "finalData", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "bytes", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: []
			});
			Object.defineProperty(this, "_loadedBytes", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: 0
			});
			Object.defineProperty(this, "_totalBytes", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "_status", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "not-started"
			});
			Object.defineProperty(this, "progress", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "notReceivingBytesTimeout", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "_onAbortCallback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "notReceivingBytesTimeoutMs", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "_logger", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "_isHandledByProcessQueue", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: false
			});
			Object.defineProperty(this, "onSegmentError", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "onSegmentAbort", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "onSegmentStart", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "onSegmentLoaded", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "abortOnTimeout", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: () => {
					var _a, _b;
					this.throwErrorIfNotLoadingStatus();
					if (!this.currentAttempt || !this.progress || this.notReceivingBytesTimeoutMs === void 0) return;
					const msSinceLastActive = performance.now() - ((_a = this.progress.lastLoadedChunkTimestamp) !== null && _a !== void 0 ? _a : this.progress.startTimestamp);
					if (msSinceLastActive < this.notReceivingBytesTimeoutMs) {
						this.notReceivingBytesTimeout.restart(this.notReceivingBytesTimeoutMs - msSinceLastActive);
						return;
					}
					const error = new RequestError("bytes-receiving-timeout");
					(_b = this._onAbortCallback) === null || _b === void 0 || _b.call(this, error);
					this.handleFailure(error);
				}
			});
			Object.defineProperty(this, "failWithError", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (error) => {
					this.throwErrorIfNotLoadingStatus();
					if (!this.currentAttempt) return;
					this.handleFailure(error);
				}
			});
			Object.defineProperty(this, "handleFailure", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (error) => {
					if (!this.currentAttempt) return;
					this.setStatus("failed");
					this.logger(`${this.downloadSource} ${this.segment.externalId} failed ${error.type}`);
					this._failedAttempts.add(Object.assign(Object.assign({}, this.currentAttempt), { error }));
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
				}
			});
			Object.defineProperty(this, "completeOnSuccess", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: () => {
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
				}
			});
			Object.defineProperty(this, "addLoadedChunk", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (chunk) => {
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
				}
			});
			Object.defineProperty(this, "firstBytesReceived", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: () => {
					this.throwErrorIfNotLoadingStatus();
				}
			});
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
			var _a;
			return (_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource;
		}
		get loadedBytes() {
			return this._loadedBytes;
		}
		get totalBytes() {
			return this._totalBytes;
		}
		get data() {
			var _a;
			(_a = this.finalData) !== null && _a !== void 0 || (this.finalData = joinChunks(this.bytes).buffer);
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
		validateData(validate) {
			return __awaiter$3(this, void 0, void 0, function* () {
				if (!validate) return true;
				try {
					return yield validate(this.segment.url, this.segment.byteRange, this.data);
				} catch (err) {
					this.logger(`validation threw an error: ${String(err)}`);
					return false;
				}
			});
		}
		validateAndComplete(downloadSource, requestControls, validate, validationErrorType) {
			return __awaiter$3(this, void 0, void 0, function* () {
				const isValid = yield this.validateData(validate);
				if (this._status !== "loading") return;
				if (!isValid) {
					this.logger(`${downloadSource} ${this.segment.externalId} validation failed for already-loaded bytes, clearing`);
					this.clearLoadedBytes();
					requestControls.failWithError(new RequestError(validationErrorType));
					return;
				}
				this.logger(`${downloadSource} ${this.segment.externalId} validation passed for already-loaded bytes`);
				requestControls.completeOnSuccess();
			});
		}
		start(requestData, controls) {
			if (this._status === "succeed") throw new Error(`Request ${this.segment.externalId} has been already succeed.`);
			if (this._status === "loading") throw new Error(`Request ${this.segment.externalId} has been already started.`);
			this.setStatus("loading");
			this.currentAttempt = Object.assign({}, requestData);
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
			var _a, _b, _c, _d;
			this.throwErrorIfNotLoadingStatus();
			this.setStatus("aborted");
			this.logger(`${(_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource} ${this.segment.externalId} aborted`);
			(_b = this._onAbortCallback) === null || _b === void 0 || _b.call(this, new RequestError("abort"));
			this.onSegmentAbort({
				segment: mapSegmentWithStreamToSegment(this.segment),
				downloadSource: (_c = this.currentAttempt) === null || _c === void 0 ? void 0 : _c.downloadSource,
				peerId: ((_d = this.currentAttempt) === null || _d === void 0 ? void 0 : _d.downloadSource) === "p2p" ? this.currentAttempt.peerId : void 0,
				infoHash: this.infoHash,
				streamType: this.segment.stream.type
			});
			this._onAbortCallback = void 0;
			this.manageBandwidthCalculatorsState("stop");
			this.notReceivingBytesTimeout.clear();
		}
		throwErrorIfNotLoadingStatus() {
			if (this._status !== "loading") throw new Error(`Request has been already ${this.status}.`);
		}
		logger(message) {
			var _a;
			this._logger.color = ((_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource) === "http" ? "green" : "red";
			this._logger(message);
			this._logger.color = "";
		}
		manageBandwidthCalculatorsState(state) {
			var _a;
			const { all, http } = this.bandwidthCalculators;
			const method = state === "start" ? "startLoading" : "stopLoading";
			if (((_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource) === "http") http[method]();
			all[method]();
		}
	};
	var FailedRequestAttempts = class {
		constructor() {
			Object.defineProperty(this, "attempts", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: []
			});
		}
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
		constructor(action) {
			Object.defineProperty(this, "action", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: action
			});
			Object.defineProperty(this, "timeoutId", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "ms", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
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
	//#region ../p2p-media-loader-core/lib/requests/request-container.js
	var RequestsContainer = class {
		constructor(requestProcessQueueCallback, bandwidthCalculators, playback, config, eventTarget) {
			Object.defineProperty(this, "requestProcessQueueCallback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: requestProcessQueueCallback
			});
			Object.defineProperty(this, "bandwidthCalculators", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: bandwidthCalculators
			});
			Object.defineProperty(this, "playback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: playback
			});
			Object.defineProperty(this, "config", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: config
			});
			Object.defineProperty(this, "eventTarget", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: eventTarget
			});
			Object.defineProperty(this, "requests", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: /* @__PURE__ */ new Map()
			});
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
	//#region ../p2p-media-loader-core/lib/requests/engine-request.js
	var EngineRequest = class {
		constructor(segment, engineCallbacks) {
			Object.defineProperty(this, "segment", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: segment
			});
			Object.defineProperty(this, "engineCallbacks", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: engineCallbacks
			});
			Object.defineProperty(this, "_status", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: "pending"
			});
			Object.defineProperty(this, "_shouldBeStartedImmediately", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: false
			});
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
	//#region ../p2p-media-loader-core/lib/utils/queue.js
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
	//#region ../p2p-media-loader-core/lib/hybrid-loader.js
	var __awaiter$2 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var FAILED_ATTEMPTS_CLEAR_INTERVAL = 6e4;
	var PEER_UPDATE_LATENCY = 1e3;
	var HybridLoader = class {
		constructor(lastRequestedSegment, streamDetails, config, bandwidthCalculators, segmentStorage, webTorrentSocketPool, eventTarget, peerId) {
			Object.defineProperty(this, "lastRequestedSegment", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: lastRequestedSegment
			});
			Object.defineProperty(this, "streamDetails", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: streamDetails
			});
			Object.defineProperty(this, "config", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: config
			});
			Object.defineProperty(this, "bandwidthCalculators", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: bandwidthCalculators
			});
			Object.defineProperty(this, "segmentStorage", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: segmentStorage
			});
			Object.defineProperty(this, "webTorrentSocketPool", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: webTorrentSocketPool
			});
			Object.defineProperty(this, "eventTarget", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: eventTarget
			});
			Object.defineProperty(this, "peerId", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: peerId
			});
			Object.defineProperty(this, "requests", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "engineRequest", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "p2pLoaders", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "playback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "segmentAvgDuration", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "logger", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "levelChangedTimestamp", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "lastQueueProcessingTimeStamp", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "randomHttpDownloadTimeout", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "initialHttpDelayTimeoutId", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "isProcessQueueMicrotaskCreated", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: false
			});
			Object.defineProperty(this, "createdAt", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: performance.now()
			});
			Object.defineProperty(this, "requestProcessQueueMicrotask", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (force = true) => {
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
				}
			});
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
		loadSegment(segment, callbacks) {
			return __awaiter$2(this, void 0, void 0, function* () {
				var _a;
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
						const data = yield this.segmentStorage.getSegmentData(stream.swarmId, stream.streamSwarmId, segment.externalId);
						if (data) {
							const { queueDownloadRatio } = this.generateQueue();
							engineRequest.resolve(data, this.getBandwidth(queueDownloadRatio));
							return;
						}
					}
					(_a = this.engineRequest) === null || _a === void 0 || _a.abort();
					this.engineRequest = engineRequest;
					const request = this.requests.get(segment);
					if ((request === null || request === void 0 ? void 0 : request.status) === "failed") request.failedAttempts.clear();
				} catch (error) {
					this.logger(`request failed for ${getSegmentString(segment)} in ${getStreamString(stream)}`, error);
					engineRequest.reject();
				} finally {
					this.requestProcessQueueMicrotask();
				}
			});
		}
		processRequests(queueSegmentIds, queueDownloadRatio) {
			var _a;
			const { stream } = this.lastRequestedSegment;
			const { httpErrorRetries } = this.config;
			const now = performance.now();
			for (const request of this.requests.items()) {
				const { downloadSource: type, status, segment, isHandledByProcessQueue } = request;
				const engineRequest = ((_a = this.engineRequest) === null || _a === void 0 ? void 0 : _a.segment) === segment ? this.engineRequest : void 0;
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
			var _a, _b, _c;
			const { queue, queueSegmentIds, queueDownloadRatio } = this.generateQueue();
			this.processRequests(queueSegmentIds, queueDownloadRatio);
			const { simultaneousHttpDownloads, simultaneousP2PDownloads, httpErrorRetries, httpDownloadInitialTimeoutMs } = this.config;
			const timeSinceStart = performance.now() - this.createdAt;
			const isInitialHttpWait = httpDownloadInitialTimeoutMs > 0 && timeSinceStart < httpDownloadInitialTimeoutMs;
			if (isInitialHttpWait) (_a = this.initialHttpDelayTimeoutId) !== null && _a !== void 0 || (this.initialHttpDelayTimeoutId = window.setTimeout(() => {
				this.initialHttpDelayTimeoutId = void 0;
				this.requestProcessQueueMicrotask();
			}, httpDownloadInitialTimeoutMs - timeSinceStart));
			const { engineRequest } = this;
			if (engineRequest) {
				const { segment } = engineRequest;
				const request = this.requests.get(segment);
				if (engineRequest.shouldBeStartedImmediately && engineRequest.status === "pending" && (!request || request.status === "not-started" || request.status === "failed" || request.status === "aborted")) {
					if (!isInitialHttpWait && ((_b = request === null || request === void 0 ? void 0 : request.failedAttempts.httpAttemptsCount) !== null && _b !== void 0 ? _b : 0) < httpErrorRetries && this.requests.executingHttpCount < simultaneousHttpDownloads) this.loadThroughHttp(segment);
					else if (this.p2pLoaders.currentLoader.isSegmentLoadedBySomeone(segment) && this.requests.executingP2PCount < simultaneousP2PDownloads) this.loadThroughP2P(segment);
				}
			}
			for (const item of queue) {
				const { statuses, segment } = item;
				const request = this.requests.get(segment);
				if ((request === null || request === void 0 ? void 0 : request.status) === "succeed") continue;
				if (statuses.isHighDemand) {
					const canLoadThroughHttp = !isInitialHttpWait && ((_c = request === null || request === void 0 ? void 0 : request.failedAttempts.httpAttemptsCount) !== null && _c !== void 0 ? _c : 0) < httpErrorRetries;
					if ((request === null || request === void 0 ? void 0 : request.status) === "loading") {
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
				} else if (statuses.isP2PDownloadable && (request === null || request === void 0 ? void 0 : request.status) !== "loading" && this.requests.executingP2PCount < simultaneousP2PDownloads) this.loadThroughP2P(segment);
			}
		}
		abortSegmentRequest(segmentRuntimeId) {
			var _a;
			if (((_a = this.engineRequest) === null || _a === void 0 ? void 0 : _a.segment.runtimeId) !== segmentRuntimeId) return;
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
				if ((request === null || request === void 0 ? void 0 : request.downloadSource) === "http" && request.status === "loading") {
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
				if ((request === null || request === void 0 ? void 0 : request.downloadSource) === "p2p" && request.status === "loading") {
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
			var _a;
			const queue = [];
			const queueSegmentIds = /* @__PURE__ */ new Set();
			let maxPossibleLength = 0;
			let alreadyLoadedCount = 0;
			const availableStorageCapacityPercent = this.getAvailableStorageCapacityPercent();
			for (const item of generateQueue(this.lastRequestedSegment, this.playback, this.config, this.p2pLoaders.currentLoader, availableStorageCapacityPercent)) {
				maxPossibleLength++;
				const { segment } = item;
				if (this.segmentStorage.hasSegment(segment.stream.swarmId, segment.stream.streamSwarmId, segment.externalId) || ((_a = this.requests.get(segment)) === null || _a === void 0 ? void 0 : _a.status) === "succeed") {
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
			var _a;
			const isRateChanged = this.playback.rate !== rate;
			const isPositionChanged = this.playback.position !== position;
			if (!isRateChanged && !isPositionChanged) return;
			const isPositionSignificantlyChanged = Math.abs(position - this.playback.position) / this.segmentAvgDuration > .5;
			if (isPositionChanged) this.playback.position = position;
			if (isRateChanged && rate !== 0) this.playback.rate = rate;
			if (isPositionSignificantlyChanged) {
				this.logger("position significantly changed");
				(_a = this.engineRequest) === null || _a === void 0 || _a.markAsShouldBeStartedImmediately();
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
			var _a;
			clearTimeout(this.randomHttpDownloadTimeout);
			clearTimeout(this.initialHttpDelayTimeoutId);
			(_a = this.engineRequest) === null || _a === void 0 || _a.abort();
			this.requests.destroy();
			this.p2pLoaders.destroy();
		}
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/utils/hash.js
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
		const str = `${bitrate !== null && bitrate !== void 0 ? bitrate : 0}-${normalizedCodecs}-${width !== null && width !== void 0 ? width : ""}-${height !== null && height !== void 0 ? height : ""}-${normalizedLanguage}-${normalizedChannels}-${normalizedName}-${normalizedFrameRate}-${normalizedVideoRange}`;
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
	//#region ../p2p-media-loader-core/lib/segment-storage/utils.js
	var getStorageItemId = (streamId, segmentId) => `${streamId}|${segmentId}`;
	var isAndroid = (userAgent) => /Android/i.test(userAgent);
	var isIPadOrIPhone = (userAgent) => /iPad|iPhone/i.test(userAgent);
	var isAndroidWebview = (userAgent) => /Android/i.test(userAgent) && (/; wv\)/i.test(userAgent) || !/Chrome|Firefox/i.test(userAgent));
	//#endregion
	//#region ../p2p-media-loader-core/lib/segment-storage/segment-memory-storage.js
	var __awaiter$1 = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var BYTES_PER_MiB = 1048576;
	var SegmentMemoryStorage = class {
		constructor() {
			Object.defineProperty(this, "userAgent", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: navigator.userAgent
			});
			Object.defineProperty(this, "segmentMemoryStorageLimit", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: 4 * 1024
			});
			Object.defineProperty(this, "currentStorageUsage", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: 0
			});
			Object.defineProperty(this, "cache", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: /* @__PURE__ */ new Map()
			});
			Object.defineProperty(this, "logger", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "coreConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "mainStreamConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "secondaryStreamConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "currentPlayback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "lastRequestedSegment", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "segmentChangeCallback", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			this.logger = (0, import_browser.default)("p2pml-core:segment-memory-storage");
			this.logger.color = "RebeccaPurple";
		}
		initialize(coreConfig, mainStreamConfig, secondaryStreamConfig) {
			return __awaiter$1(this, void 0, void 0, function* () {
				this.coreConfig = coreConfig;
				this.mainStreamConfig = mainStreamConfig;
				this.secondaryStreamConfig = secondaryStreamConfig;
				this.setMemoryStorageLimit();
				this.logger("initialized");
			});
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
		storeSegment(_swarmId, streamSwarmId, segmentId, data, startTime, endTime, streamType, isLiveStream) {
			return __awaiter$1(this, void 0, void 0, function* () {
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
			});
		}
		getSegmentData(_swarmId, streamSwarmId, segmentId) {
			return __awaiter$1(this, void 0, void 0, function* () {
				const segmentStorageId = getStorageItemId(streamSwarmId, segmentId);
				const dataItem = this.cache.get(segmentStorageId);
				if (dataItem === void 0) return void 0;
				return dataItem.data;
			});
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
			var _a;
			if ((_a = this.coreConfig) === null || _a === void 0 ? void 0 : _a.segmentMemoryStorageLimit) {
				this.segmentMemoryStorageLimit = this.coreConfig.segmentMemoryStorageLimit;
				return;
			}
			if (isAndroidWebview(this.userAgent) || isIPadOrIPhone(this.userAgent)) this.segmentMemoryStorageLimit = 1024;
			else if (isAndroid(this.userAgent)) this.segmentMemoryStorageLimit = 2 * 1024;
		}
		getStreamTimeWindow(streamType, configKey) {
			var _a;
			const config = streamType === "main" ? this.mainStreamConfig : this.secondaryStreamConfig;
			return (_a = config === null || config === void 0 ? void 0 : config[configKey]) !== null && _a !== void 0 ? _a : 0;
		}
		destroy() {
			this.cache.clear();
			this.segmentChangeCallback = void 0;
		}
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/utils/peer.js
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
	//#region ../p2p-media-loader-core/lib/webtorrent/websocket-client/index.js
	var __classPrivateFieldSet = function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet$1 = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _WebSocketClient_instances;
	var _WebSocketClient_config;
	var _WebSocketClient_state;
	var _WebSocketClient_ws;
	var _WebSocketClient_backoffCount;
	var _WebSocketClient_reconnectTimeoutId;
	var _WebSocketClient_eventTarget;
	var _WebSocketClient_onOpen;
	var _WebSocketClient_onClose;
	var _WebSocketClient_onError;
	var _WebSocketClient_onMessage;
	var _WebSocketClient_scheduleReconnect;
	var _WebSocketClient_clearReconnectTimeout;
	var WebSocketClient = class {
		constructor(config) {
			var _a, _b, _c;
			_WebSocketClient_instances.add(this);
			_WebSocketClient_config.set(this, void 0);
			_WebSocketClient_state.set(this, "disconnected");
			_WebSocketClient_ws.set(this, null);
			_WebSocketClient_backoffCount.set(this, 0);
			_WebSocketClient_reconnectTimeoutId.set(this, null);
			_WebSocketClient_eventTarget.set(this, new EventTarget());
			_WebSocketClient_onOpen.set(this, () => {
				if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "disposed") return;
				__classPrivateFieldSet(this, _WebSocketClient_state, "connected", "f");
				__classPrivateFieldSet(this, _WebSocketClient_backoffCount, 0, "f");
				__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").dispatchEvent("connected");
			});
			_WebSocketClient_onClose.set(this, () => {
				if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "disposed") return;
				if (__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f")) {
					__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onopen = null;
					__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onclose = null;
					__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onerror = null;
					__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onmessage = null;
					__classPrivateFieldSet(this, _WebSocketClient_ws, null, "f");
				}
				__classPrivateFieldGet$1(this, _WebSocketClient_instances, "m", _WebSocketClient_scheduleReconnect).call(this);
				__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").dispatchEvent("disconnected");
			});
			_WebSocketClient_onError.set(this, (event) => {
				if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "disposed") return;
				__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").dispatchEvent("error", event);
			});
			_WebSocketClient_onMessage.set(this, (event) => {
				if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "disposed") return;
				__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").dispatchEvent("message", event.data);
			});
			const initialDelay = Math.max(100, (_a = config.initialDelay) !== null && _a !== void 0 ? _a : 1e3);
			__classPrivateFieldSet(this, _WebSocketClient_config, {
				url: config.url,
				initialDelay,
				maxDelay: Math.max(initialDelay, (_b = config.maxDelay) !== null && _b !== void 0 ? _b : 3e4),
				jitterMultiplier: Math.max(0, (_c = config.jitterMultiplier) !== null && _c !== void 0 ? _c : .2)
			}, "f");
		}
		get state() {
			return __classPrivateFieldGet$1(this, _WebSocketClient_state, "f");
		}
		addEventListener(eventName, listener) {
			__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").addEventListener(eventName, listener);
		}
		removeEventListener(eventName, listener) {
			__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").removeEventListener(eventName, listener);
		}
		connect() {
			if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "connected" || __classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "connecting" || __classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "disposed") return;
			__classPrivateFieldSet(this, _WebSocketClient_state, "connecting", "f");
			__classPrivateFieldGet$1(this, _WebSocketClient_instances, "m", _WebSocketClient_clearReconnectTimeout).call(this);
			try {
				__classPrivateFieldSet(this, _WebSocketClient_ws, new WebSocket(__classPrivateFieldGet$1(this, _WebSocketClient_config, "f").url), "f");
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").binaryType = "arraybuffer";
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onopen = __classPrivateFieldGet$1(this, _WebSocketClient_onOpen, "f");
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onclose = __classPrivateFieldGet$1(this, _WebSocketClient_onClose, "f");
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onerror = __classPrivateFieldGet$1(this, _WebSocketClient_onError, "f");
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onmessage = __classPrivateFieldGet$1(this, _WebSocketClient_onMessage, "f");
			} catch (error) {
				__classPrivateFieldSet(this, _WebSocketClient_state, "disconnected", "f");
				const errorEvent = new ErrorEvent("error", {
					message: error instanceof Error ? error.message : "Unknown WebSocket creation error",
					error
				});
				__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").dispatchEvent("error", errorEvent);
			}
		}
		send(data) {
			if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") !== "connected" || !__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f")) throw new Error("WebSocketClient: Cannot send data when not connected");
			__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").send(data);
		}
		dispose() {
			__classPrivateFieldSet(this, _WebSocketClient_state, "disposed", "f");
			__classPrivateFieldGet$1(this, _WebSocketClient_instances, "m", _WebSocketClient_clearReconnectTimeout).call(this);
			if (__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f")) {
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onopen = null;
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onclose = null;
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onerror = null;
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").onmessage = null;
				__classPrivateFieldGet$1(this, _WebSocketClient_ws, "f").close();
				__classPrivateFieldSet(this, _WebSocketClient_ws, null, "f");
			}
			__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").clear();
		}
	};
	_WebSocketClient_config = /* @__PURE__ */ new WeakMap(), _WebSocketClient_state = /* @__PURE__ */ new WeakMap(), _WebSocketClient_ws = /* @__PURE__ */ new WeakMap(), _WebSocketClient_backoffCount = /* @__PURE__ */ new WeakMap(), _WebSocketClient_reconnectTimeoutId = /* @__PURE__ */ new WeakMap(), _WebSocketClient_eventTarget = /* @__PURE__ */ new WeakMap(), _WebSocketClient_onOpen = /* @__PURE__ */ new WeakMap(), _WebSocketClient_onClose = /* @__PURE__ */ new WeakMap(), _WebSocketClient_onError = /* @__PURE__ */ new WeakMap(), _WebSocketClient_onMessage = /* @__PURE__ */ new WeakMap(), _WebSocketClient_instances = /* @__PURE__ */ new WeakSet(), _WebSocketClient_scheduleReconnect = function _WebSocketClient_scheduleReconnect() {
		var _a;
		if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") === "disposed") return;
		__classPrivateFieldSet(this, _WebSocketClient_state, "reconnecting", "f");
		const baseDelay = Math.min(__classPrivateFieldGet$1(this, _WebSocketClient_config, "f").initialDelay * Math.pow(2, __classPrivateFieldGet$1(this, _WebSocketClient_backoffCount, "f")), __classPrivateFieldGet$1(this, _WebSocketClient_config, "f").maxDelay);
		const jitter = baseDelay * __classPrivateFieldGet$1(this, _WebSocketClient_config, "f").jitterMultiplier;
		const randomJitter = Math.random() * 2 * jitter - jitter;
		const delay = Math.max(0, baseDelay + randomJitter);
		if (baseDelay < __classPrivateFieldGet$1(this, _WebSocketClient_config, "f").maxDelay) __classPrivateFieldSet(this, _WebSocketClient_backoffCount, (_a = __classPrivateFieldGet$1(this, _WebSocketClient_backoffCount, "f"), _a++, _a), "f");
		__classPrivateFieldSet(this, _WebSocketClient_reconnectTimeoutId, setTimeout(() => {
			if (__classPrivateFieldGet$1(this, _WebSocketClient_state, "f") !== "disposed") this.connect();
		}, delay), "f");
		__classPrivateFieldGet$1(this, _WebSocketClient_eventTarget, "f").dispatchEvent("reconnecting");
	}, _WebSocketClient_clearReconnectTimeout = function _WebSocketClient_clearReconnectTimeout() {
		if (__classPrivateFieldGet$1(this, _WebSocketClient_reconnectTimeoutId, "f") !== null) {
			clearTimeout(__classPrivateFieldGet$1(this, _WebSocketClient_reconnectTimeoutId, "f"));
			__classPrivateFieldSet(this, _WebSocketClient_reconnectTimeoutId, null, "f");
		}
	};
	//#endregion
	//#region ../p2p-media-loader-core/lib/webtorrent/webtorrent-socket-pool/index.js
	var __classPrivateFieldGet = function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var _WebTorrentSocketPool_sockets;
	var _WebTorrentSocketPool_eventTarget;
	var WebTorrentSocketPool = class {
		constructor() {
			_WebTorrentSocketPool_sockets.set(this, /* @__PURE__ */ new Map());
			_WebTorrentSocketPool_eventTarget.set(this, new EventTarget());
		}
		addEventListener(eventName, listener) {
			__classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").addEventListener(eventName, listener);
		}
		removeEventListener(eventName, listener) {
			__classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").removeEventListener(eventName, listener);
		}
		acquire(url) {
			let entry = __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").get(url);
			if (!entry) {
				const client = new WebSocketClient({ url });
				client.addEventListener("error", (error) => {
					__classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").dispatchEvent("error", error, url);
				});
				client.connect();
				entry = {
					client,
					refCount: 0
				};
				__classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").set(url, entry);
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
						if (__classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").get(url) === entry) __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").delete(url);
						entry.client.dispose();
					}
				}
			};
		}
		destroy() {
			__classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").clear();
			const entries = Array.from(__classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").values());
			__classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").clear();
			for (const entry of entries) try {
				entry.client.dispose();
			} catch (error) {
				console.error("[WebTorrentSocketPool] Failed to dispose WebSocketClient:", error);
			}
		}
	};
	_WebTorrentSocketPool_sockets = /* @__PURE__ */ new WeakMap(), _WebTorrentSocketPool_eventTarget = /* @__PURE__ */ new WeakMap();
	//#endregion
	//#region ../p2p-media-loader-core/lib/core.js
	var __awaiter = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __rest = function(s, e) {
		var t = {};
		for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
		if (s != null && typeof Object.getOwnPropertySymbols === "function") {
			for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
		}
		return t;
	};
	/** Core class for managing media streams loading via P2P. */
	var Core = class Core {
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
			Object.defineProperty(this, "eventTarget", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: new EventTarget()
			});
			Object.defineProperty(this, "manifestResponseUrl", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "streams", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: /* @__PURE__ */ new Map()
			});
			Object.defineProperty(this, "mainStreamConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "secondaryStreamConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "commonCoreConfig", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "bandwidthCalculators", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: {
					all: new BandwidthCalculator(),
					http: new BandwidthCalculator()
				}
			});
			Object.defineProperty(this, "segmentStorage", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "webTorrentSocketPool", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: new WebTorrentSocketPool()
			});
			Object.defineProperty(this, "logger", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (0, import_browser.default)("p2pml-core:core")
			});
			Object.defineProperty(this, "socketPoolLogger", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: (0, import_browser.default)("p2pml-core:webtorrent-socket-pool")
			});
			Object.defineProperty(this, "peerId", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "mainStreamLoader", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "secondaryStreamLoader", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			Object.defineProperty(this, "streamDetails", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: {
					isLive: false,
					activeLevelBitrate: 0
				}
			});
			Object.defineProperty(this, "storageInitPromise", {
				enumerable: true,
				configurable: true,
				writable: true,
				value: void 0
			});
			const filteredConfig = filterUndefinedProps(config !== null && config !== void 0 ? config : {});
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
			return Object.assign(Object.assign({}, deepCopy(this.commonCoreConfig)), {
				mainStream: deepCopy(this.mainStreamConfig),
				secondaryStream: deepCopy(this.secondaryStreamConfig)
			});
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
			if (isP2PUploadDisabled !== void 0 && prevConfig.isP2PUploadDisabled !== isP2PUploadDisabled) {
				const streamLoader = streamType === "main" ? this.mainStreamLoader : this.secondaryStreamLoader;
				streamLoader === null || streamLoader === void 0 || streamLoader.sendBroadcastAnnouncement(isP2PUploadDisabled);
			}
		}
		getUpdatedStreamProperty(propertyName, updatedConfig, streamType) {
			var _a;
			const updatedStreamConfig = streamType === "main" ? updatedConfig.mainStream : updatedConfig.secondaryStream;
			return (_a = updatedStreamConfig === null || updatedStreamConfig === void 0 ? void 0 : updatedStreamConfig[propertyName]) !== null && _a !== void 0 ? _a : updatedConfig[propertyName];
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
			var _a;
			if (this.streams.has(stream.runtimeId)) return;
			const config = stream.type === "main" ? this.mainStreamConfig : this.secondaryStreamConfig;
			const swarmId = (_a = config.swarmId) !== null && _a !== void 0 ? _a : this.manifestResponseUrl;
			if (swarmId === void 0) throw new Error("Failed to register stream: no swarmId is configured and the manifest response URL is not set. Call setManifestResponseUrl() before adding streams.");
			const properties = Object.freeze(Object.assign({}, stream.properties));
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
			const registeredStream = Object.assign(Object.assign({}, stream), {
				properties,
				swarmId,
				identityHash,
				streamSwarmId,
				infoHash: computeInfoHash(streamSwarmId),
				segments: /* @__PURE__ */ new Map()
			});
			this.streams.set(stream.runtimeId, registeredStream);
			const { segments } = registeredStream, streamSnapshot = __rest(registeredStream, ["segments"]);
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
			var _a, _b;
			const stream = this.streams.get(streamRuntimeId);
			if (!stream) return;
			if (addSegments) for (const segment of addSegments) {
				if (stream.segments.has(segment.runtimeId)) continue;
				stream.segments.set(segment.runtimeId, Object.assign(Object.assign({}, segment), { stream }));
			}
			if (removeSegmentIds) for (const id of removeSegmentIds) stream.segments.delete(id);
			(_a = this.mainStreamLoader) === null || _a === void 0 || _a.updateStream(stream);
			(_b = this.secondaryStreamLoader) === null || _b === void 0 || _b.updateStream(stream);
		}
		/**
		* Loads a segment given its runtime identifier and invokes the provided callbacks during the process.
		* Initializes segment storage if it has not been initialized yet.
		*
		* @param segmentRuntimeId - The runtime identifier of the segment to load.
		* @param callbacks - The callbacks to be invoked during segment loading.
		* @throws {Error} - Throws if the manifest response URL is not defined.
		*/
		loadSegment(segmentRuntimeId, callbacks) {
			return __awaiter(this, void 0, void 0, function* () {
				if (!this.manifestResponseUrl) throw new Error("Manifest response url is not defined");
				yield this.initializeSegmentStorage();
				const segment = this.identifySegment(segmentRuntimeId);
				this.getStreamHybridLoader(segment).loadSegment(segment, callbacks);
			});
		}
		/**
		* Aborts the loading of a segment specified by its runtime identifier.
		*
		* @param segmentRuntimeId - The runtime identifier of the segment whose loading is to be aborted.
		*/
		abortSegmentLoading(segmentRuntimeId) {
			var _a, _b;
			(_a = this.mainStreamLoader) === null || _a === void 0 || _a.abortSegmentRequest(segmentRuntimeId);
			(_b = this.secondaryStreamLoader) === null || _b === void 0 || _b.abortSegmentRequest(segmentRuntimeId);
		}
		/**
		* Updates the playback parameters while play head moves, specifically position and playback rate, for stream loaders.
		*
		* @param position - The new position in the stream, in seconds.
		* @param rate - The new playback rate.
		*/
		updatePlayback(position, rate) {
			var _a, _b;
			(_a = this.mainStreamLoader) === null || _a === void 0 || _a.updatePlayback(position, rate);
			(_b = this.secondaryStreamLoader) === null || _b === void 0 || _b.updatePlayback(position, rate);
		}
		/**
		* Sets the active level bitrate, used for adjusting quality levels in adaptive streaming.
		* Notifies the stream loaders if a change occurs.
		*
		* @param bitrate - The new bitrate to set as active.
		*/
		setActiveLevelBitrate(bitrate) {
			var _a, _b;
			if (bitrate !== this.streamDetails.activeLevelBitrate) {
				this.streamDetails.activeLevelBitrate = bitrate;
				(_a = this.mainStreamLoader) === null || _a === void 0 || _a.notifyLevelChanged();
				(_b = this.secondaryStreamLoader) === null || _b === void 0 || _b.notifyLevelChanged();
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
			} catch (_a) {
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
			var _a, _b, _c, _d;
			this.streams.clear();
			(_a = this.mainStreamLoader) === null || _a === void 0 || _a.destroy();
			(_b = this.secondaryStreamLoader) === null || _b === void 0 || _b.destroy();
			(_c = this.segmentStorage) === null || _c === void 0 || _c.setSegmentChangeCallback(void 0);
			(_d = this.segmentStorage) === null || _d === void 0 || _d.destroy();
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
		initializeSegmentStorage() {
			return __awaiter(this, void 0, void 0, function* () {
				if (this.segmentStorage) return;
				if (this.storageInitPromise) return this.storageInitPromise;
				this.storageInitPromise = (() => __awaiter(this, void 0, void 0, function* () {
					const { isLive } = this.streamDetails;
					const createCustomStorage = this.commonCoreConfig.customSegmentStorageFactory;
					if (createCustomStorage && typeof createCustomStorage !== "function") throw new Error("Storage configuration is invalid");
					const segmentStorage = createCustomStorage ? createCustomStorage(isLive) : new SegmentMemoryStorage();
					try {
						yield segmentStorage.initialize(this.commonCoreConfig, this.mainStreamConfig, this.secondaryStreamConfig);
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
				}))();
				try {
					yield this.storageInitPromise;
				} finally {
					this.storageInitPromise = void 0;
				}
			});
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
			const sanitized = Object.assign({}, config);
			delete sanitized.swarmId;
			delete sanitized.streamSwarmIdBuilder;
			return sanitized;
		}
		destroyStreamLoader(streamType) {
			var _a, _b;
			if (streamType === "main") {
				(_a = this.mainStreamLoader) === null || _a === void 0 || _a.destroy();
				this.mainStreamLoader = void 0;
			} else {
				(_b = this.secondaryStreamLoader) === null || _b === void 0 || _b.destroy();
				this.secondaryStreamLoader = void 0;
			}
		}
		getStreamHybridLoader(segment) {
			var _a, _b;
			if (segment.stream.type === "main") {
				(_a = this.mainStreamLoader) !== null && _a !== void 0 || (this.mainStreamLoader = this.createNewHybridLoader(segment));
				return this.mainStreamLoader;
			} else {
				(_b = this.secondaryStreamLoader) !== null && _b !== void 0 || (this.secondaryStreamLoader = this.createNewHybridLoader(segment));
				return this.secondaryStreamLoader;
			}
		}
		createNewHybridLoader(segment) {
			if (!this.segmentStorage) throw new Error("Segment storage is not initialized");
			const streamConfig = segment.stream.type === "main" ? this.mainStreamConfig : this.secondaryStreamConfig;
			return new HybridLoader(segment, this.streamDetails, streamConfig, this.bandwidthCalculators, this.segmentStorage, this.webTorrentSocketPool, this.eventTarget, this.peerId);
		}
	};
	/** Default configuration for common core settings. */
	Object.defineProperty(Core, "DEFAULT_COMMON_CORE_CONFIG", {
		enumerable: true,
		configurable: true,
		writable: true,
		value: {
			segmentMemoryStorageLimit: void 0,
			customSegmentStorageFactory: void 0,
			trackerClientVersionPrefix: TRACKER_CLIENT_VERSION_PREFIX
		}
	});
	/** Default configuration for stream settings. */
	Object.defineProperty(Core, "DEFAULT_STREAM_CONFIG", {
		enumerable: true,
		configurable: true,
		writable: true,
		value: {
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
		}
	});
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/checkPrivateRedeclaration.js
	function _checkPrivateRedeclaration(e, t) {
		if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/classPrivateMethodInitSpec.js
	function _classPrivateMethodInitSpec(e, a) {
		_checkPrivateRedeclaration(e, a), a.add(e);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/typeof.js
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/toPrimitive.js
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/toPropertyKey.js
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/defineProperty.js
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/classPrivateFieldInitSpec.js
	function _classPrivateFieldInitSpec(e, t, a) {
		_checkPrivateRedeclaration(e, t), t.set(e, a);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/assertClassBrand.js
	function _assertClassBrand(e, t, n) {
		if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
		throw new TypeError("Private element is not present on this object");
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/classPrivateFieldSet2.js
	function _classPrivateFieldSet2(s, a, r) {
		return s.set(_assertClassBrand(s, a), r), r;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/classPrivateFieldGet2.js
	function _classPrivateFieldGet2(s, a) {
		return s.get(_assertClassBrand(s, a));
	}
	//#endregion
	//#region src/fragment-loader.ts
	var DEFAULT_DOWNLOAD_LATENCY = 10;
	var _callbacks = /* @__PURE__ */ new WeakMap();
	var _createDefaultLoader = /* @__PURE__ */ new WeakMap();
	var _defaultLoader$1 = /* @__PURE__ */ new WeakMap();
	var _core = /* @__PURE__ */ new WeakMap();
	var _response = /* @__PURE__ */ new WeakMap();
	var _segmentId = /* @__PURE__ */ new WeakMap();
	var _FragmentLoaderBase_brand = /* @__PURE__ */ new WeakSet();
	var FragmentLoaderBase = class {
		constructor(config, core) {
			_classPrivateMethodInitSpec(this, _FragmentLoaderBase_brand);
			_defineProperty(this, "context", void 0);
			_defineProperty(this, "config", void 0);
			_defineProperty(this, "stats", void 0);
			_classPrivateFieldInitSpec(this, _callbacks, void 0);
			_classPrivateFieldInitSpec(this, _createDefaultLoader, void 0);
			_classPrivateFieldInitSpec(this, _defaultLoader$1, void 0);
			_classPrivateFieldInitSpec(this, _core, void 0);
			_classPrivateFieldInitSpec(this, _response, void 0);
			_classPrivateFieldInitSpec(this, _segmentId, void 0);
			_classPrivateFieldSet2(_core, this, core);
			_classPrivateFieldSet2(_createDefaultLoader, this, () => new config.loader(config));
			this.stats = {
				aborted: false,
				chunkCount: 0,
				loading: {
					start: 0,
					first: 0,
					end: 0
				},
				buffering: {
					start: 0,
					first: 0,
					end: 0
				},
				parsing: {
					start: 0,
					end: 0
				},
				total: 1,
				loaded: 1,
				bwEstimate: 0,
				retry: 0
			};
		}
		load(context, config, callbacks) {
			this.context = context;
			this.config = config;
			_classPrivateFieldSet2(_callbacks, this, callbacks);
			const { stats } = this;
			const { rangeStart: start, rangeEnd: end } = context;
			const byteRange = getByteRange(start, end !== void 0 ? end - 1 : void 0);
			_classPrivateFieldSet2(_segmentId, this, getSegmentRuntimeId(context.url, byteRange));
			const isSegmentDownloadableByP2PCore = _classPrivateFieldGet2(_core, this).isSegmentLoadable(_classPrivateFieldGet2(_segmentId, this));
			if (!_classPrivateFieldGet2(_core, this).hasSegment(_classPrivateFieldGet2(_segmentId, this)) || !isSegmentDownloadableByP2PCore) {
				_classPrivateFieldSet2(_defaultLoader$1, this, _classPrivateFieldGet2(_createDefaultLoader, this).call(this));
				_classPrivateFieldGet2(_defaultLoader$1, this).stats = this.stats;
				_classPrivateFieldGet2(_defaultLoader$1, this).load(context, config, callbacks);
				return;
			}
			const onSuccess = (response) => {
				if (!_classPrivateFieldGet2(_callbacks, this)) return;
				_classPrivateFieldSet2(_response, this, response);
				const loadedBytes = _classPrivateFieldGet2(_response, this).data.byteLength;
				stats.loading = getLoadingStat(_classPrivateFieldGet2(_response, this).bandwidth, loadedBytes, performance.now());
				stats.total = loadedBytes;
				stats.loaded = loadedBytes;
				const engineData = _classPrivateFieldGet2(_response, this).data.slice(0);
				if (_classPrivateFieldGet2(_callbacks, this).onProgress) _classPrivateFieldGet2(_callbacks, this).onProgress(this.stats, context, engineData, void 0);
				_classPrivateFieldGet2(_callbacks, this).onSuccess({
					data: engineData,
					url: context.url
				}, this.stats, context, void 0);
			};
			const onError = (error) => {
				if (error instanceof CoreRequestError && error.type === "aborted" && this.stats.aborted) return;
				_assertClassBrand(_FragmentLoaderBase_brand, this, _handleError).call(this, error);
			};
			_classPrivateFieldGet2(_core, this).loadSegment(_classPrivateFieldGet2(_segmentId, this), {
				onSuccess,
				onError
			});
		}
		abort() {
			if (_classPrivateFieldGet2(_defaultLoader$1, this)) _classPrivateFieldGet2(_defaultLoader$1, this).abort();
			else {
				var _classPrivateFieldGet3, _classPrivateFieldGet4;
				_assertClassBrand(_FragmentLoaderBase_brand, this, _abortInternal).call(this);
				(_classPrivateFieldGet3 = _classPrivateFieldGet2(_callbacks, this)) === null || _classPrivateFieldGet3 === void 0 || (_classPrivateFieldGet4 = _classPrivateFieldGet3.onAbort) === null || _classPrivateFieldGet4 === void 0 || _classPrivateFieldGet4.call(_classPrivateFieldGet3, this.stats, this.context, {});
			}
		}
		destroy() {
			if (_classPrivateFieldGet2(_defaultLoader$1, this)) _classPrivateFieldGet2(_defaultLoader$1, this).destroy();
			else {
				if (!this.stats.aborted) _assertClassBrand(_FragmentLoaderBase_brand, this, _abortInternal).call(this);
				_classPrivateFieldSet2(_callbacks, this, null);
				this.config = null;
			}
		}
	};
	function _handleError(thrownError) {
		var _classPrivateFieldGet2$1;
		const error = {
			code: 0,
			text: ""
		};
		if (thrownError instanceof CoreRequestError && thrownError.type === "failed") error.text = thrownError.message;
		else if (thrownError instanceof Error) error.text = thrownError.message;
		(_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_callbacks, this)) === null || _classPrivateFieldGet2$1 === void 0 || _classPrivateFieldGet2$1.onError(error, this.context, null, this.stats);
	}
	function _abortInternal() {
		if (!_classPrivateFieldGet2(_response, this) && _classPrivateFieldGet2(_segmentId, this)) {
			this.stats.aborted = true;
			_classPrivateFieldGet2(_core, this).abortSegmentLoading(_classPrivateFieldGet2(_segmentId, this));
		}
	}
	function getLoadingStat(targetBitrate, loadedBytes, loadingEndTime) {
		const timeForLoading = targetBitrate > 0 ? loadedBytes * 8e3 / targetBitrate : 0;
		const first = Math.max(0, loadingEndTime - timeForLoading);
		return {
			start: Math.max(0, first - DEFAULT_DOWNLOAD_LATENCY),
			first,
			end: loadingEndTime
		};
	}
	//#endregion
	//#region src/playlist-loader.ts
	var _defaultLoader = /* @__PURE__ */ new WeakMap();
	var PlaylistLoaderBase = class {
		constructor(config) {
			_classPrivateFieldInitSpec(this, _defaultLoader, void 0);
			_defineProperty(this, "context", void 0);
			_defineProperty(this, "stats", void 0);
			_classPrivateFieldSet2(_defaultLoader, this, new config.loader(config));
			this.stats = _classPrivateFieldGet2(_defaultLoader, this).stats;
			this.context = _classPrivateFieldGet2(_defaultLoader, this).context;
		}
		load(context, config, callbacks) {
			_classPrivateFieldGet2(_defaultLoader, this).load(context, config, callbacks);
		}
		abort() {
			_classPrivateFieldGet2(_defaultLoader, this).abort();
		}
		destroy() {
			_classPrivateFieldGet2(_defaultLoader, this).destroy();
		}
	};
	//#endregion
	//#region src/stream-properties.ts
	function getVideoStreamProperties(level) {
		const { bitrate, maxBitrate, videoCodec, width, height } = level;
		const b = maxBitrate !== null && maxBitrate !== void 0 ? maxBitrate : bitrate;
		const isMissingMetadata = b === 0;
		return {
			bitrate: b,
			codecs: isMissingMetadata ? void 0 : videoCodec,
			width: isMissingMetadata ? void 0 : width,
			height: isMissingMetadata ? void 0 : height,
			frameRate: isMissingMetadata ? void 0 : level.attrs["FRAME-RATE"],
			videoRange: isMissingMetadata ? void 0 : level.attrs["VIDEO-RANGE"]
		};
	}
	function getAudioStreamProperties(track) {
		const { audioCodec, lang, channels, name } = track;
		return {
			bitrate: 0,
			codecs: audioCodec,
			language: lang,
			channels,
			name
		};
	}
	//#endregion
	//#region src/segment-manager.ts
	var SegmentManager = class {
		constructor(core) {
			_defineProperty(this, "core", void 0);
			_defineProperty(this, "logger", (0, import_browser.debug)("p2pml-hlsjs:segment-manager"));
			this.core = core;
		}
		processMainManifest(data) {
			const { levels, audioTracks } = data;
			for (const level of levels) {
				const { url } = level;
				this.addStream({
					runtimeId: Array.isArray(url) ? url[0] : url,
					type: "main",
					properties: getVideoStreamProperties(level)
				});
			}
			for (const track of audioTracks) {
				const { url } = track;
				this.addStream({
					runtimeId: Array.isArray(url) ? url[0] : url,
					type: "secondary",
					properties: getAudioStreamProperties(track)
				});
			}
		}
		addStream(stream) {
			try {
				this.core.addStreamIfNoneExists(stream);
			} catch (error) {
				this.logger(`failed to register stream ${stream.runtimeId}:`, error);
			}
		}
		updatePlaylist(data) {
			const { details: { url, fragments, live } } = data;
			const registeredSegmentIds = this.core.getStreamSegmentRuntimeIds(url);
			if (!registeredSegmentIds) return;
			const segmentToRemoveIds = new Set(registeredSegmentIds);
			const newSegments = [];
			fragments.forEach((fragment, index) => {
				const { url: responseUrl, byteRange: fragByteRange, sn, start: startTime, end: endTime } = fragment;
				const [start, end] = fragByteRange;
				const byteRange = getByteRange(start, end !== void 0 ? end - 1 : void 0);
				const runtimeId = getSegmentRuntimeId(responseUrl, byteRange);
				segmentToRemoveIds.delete(runtimeId);
				if (registeredSegmentIds.has(runtimeId)) return;
				newSegments.push({
					runtimeId,
					url: responseUrl,
					externalId: live ? sn : index,
					byteRange,
					startTime,
					endTime
				});
			});
			if (!newSegments.length && !segmentToRemoveIds.size) return;
			this.core.updateStream(url, newSegments, segmentToRemoveIds.values());
		}
	};
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/objectWithoutPropertiesLoose.js
	function _objectWithoutPropertiesLoose(r, e) {
		if (null == r) return {};
		var t = {};
		for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
			if (e.includes(n)) continue;
			t[n] = r[n];
		}
		return t;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/objectWithoutProperties.js
	function _objectWithoutProperties(e, t) {
		if (null == e) return {};
		var o, r, i = _objectWithoutPropertiesLoose(e, t);
		if (Object.getOwnPropertySymbols) {
			var s = Object.getOwnPropertySymbols(e);
			for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
		}
		return i;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/objectSpread2.js
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread2(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
				_defineProperty(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	//#endregion
	//#region src/engine-static.ts
	var _excluded = ["p2p"];
	function injectMixin(HlsJsClass) {
		var _p2pEngine;
		return _p2pEngine = /* @__PURE__ */ new WeakMap(), class HlsJsWithP2PClass extends HlsJsClass {
			get p2pEngine() {
				return _classPrivateFieldGet2(_p2pEngine, this);
			}
			constructor(...args) {
				var _p2p$onHlsJsCreated;
				const config = args[0];
				const _ref = config !== null && config !== void 0 ? config : {}, { p2p } = _ref, hlsJsConfig = _objectWithoutProperties(_ref, _excluded);
				const p2pEngine = new HlsJsP2PEngine(p2p);
				super(_objectSpread2(_objectSpread2({}, hlsJsConfig), p2pEngine.getConfigForHlsJs()));
				_classPrivateFieldInitSpec(this, _p2pEngine, void 0);
				p2pEngine.bindHls(this);
				_classPrivateFieldSet2(_p2pEngine, this, p2pEngine);
				p2p === null || p2p === void 0 || (_p2p$onHlsJsCreated = p2p.onHlsJsCreated) === null || _p2p$onHlsJsCreated === void 0 || _p2p$onHlsJsCreated.call(p2p, this);
			}
		};
	}
	//#endregion
	//#region src/engine.ts
	var MAX_LIVE_SYNC_DURATION = 120;
	/**
	* Represents a Peer-to-Peer (P2P) engine for HLS (HTTP Live Streaming) to enhance media streaming efficiency.
	* This class integrates P2P technologies into Hls.js, enabling the distribution of media segments via a peer network
	* alongside traditional HTTP fetching. This reduces server bandwidth costs and improves scalability by sharing the load
	* across multiple clients.
	*
	* The engine manages core functionalities such as segment fetching, segment management, peer connection management,
	* and event handling related to the P2P and HLS processes.
	*
	* @example
	* // Creating an instance of HlsJsP2PEngine with custom configuration
	* const hlsP2PEngine = new HlsJsP2PEngine({
	*   core: {
	*     highDemandTimeWindow: 30, // 30 seconds
	*     simultaneousHttpDownloads: 3,
	*     webRtcMaxMessageSize: 64 * 1024, // 64 KB
	*     p2pNotReceivingBytesTimeoutMs: 10000, // 10 seconds
	*     p2pInactiveLoaderDestroyTimeoutMs: 15000, // 15 seconds
	*     httpNotReceivingBytesTimeoutMs: 8000, // 8 seconds
	*     httpErrorRetries: 2,
	*     p2pErrorRetries: 2,
	*     announceTrackers: ["wss://personal.tracker.com"],
	*     rtcConfig: {
	*       iceServers: [{ urls: "stun:personal.stun.com" }]
	*     },
	*     swarmId: "example-swarm-id"
	*   }
	* });
	*
	*/
	var HlsJsP2PEngine = class {
		/**
		* Enhances a given `Hls.js` class by injecting additional Peer-to-Peer (P2P) functionalities.
		*
		* @returns The enhanced `Hls.js` class with P2P functionalities.
		*
		* @example
		* const HlsWithP2P = HlsJsP2PEngine.injectMixin(Hls);
		*
		* const hls = new HlsWithP2P({
		*   // Hls.js configuration
		*   startLevel: 0, // Example of Hls.js config parameter
		*   p2p: {
		*     core: {
		*       // P2P core configuration
		*     },
		*     onHlsJsCreated(hls) {
		*       // Do something with the Hls.js instance
		*     },
		*   },
		* });
		*/
		static injectMixin(hls) {
			return injectMixin(hls);
		}
		/**
		* Constructs an instance of `HlsJsP2PEngine`.
		* @param config An optional configuration for the P2P engine setup.
		*/
		constructor(config) {
			_defineProperty(this, "core", void 0);
			_defineProperty(this, "segmentManager", void 0);
			_defineProperty(this, "hlsInstanceGetter", void 0);
			_defineProperty(this, "currentHlsInstance", void 0);
			_defineProperty(this, "debug", (0, import_browser.debug)("p2pml-hlsjs:engine"));
			_defineProperty(this, "updateMediaElementEventHandlers", (type) => {
				var _this$currentHlsInsta;
				const media = (_this$currentHlsInsta = this.currentHlsInstance) === null || _this$currentHlsInsta === void 0 ? void 0 : _this$currentHlsInsta.media;
				if (!media) return;
				const method = type === "register" ? "addEventListener" : "removeEventListener";
				media[method]("timeupdate", this.handlePlaybackUpdate);
				media[method]("seeking", this.handlePlaybackUpdate);
				media[method]("ratechange", this.handlePlaybackUpdate);
			});
			_defineProperty(this, "handleManifestLoaded", (event, data) => {
				const networkDetails = data.networkDetails;
				if (networkDetails instanceof XMLHttpRequest) this.core.setManifestResponseUrl(networkDetails.responseURL);
				else if (networkDetails instanceof Response) this.core.setManifestResponseUrl(networkDetails.url);
				else this.core.setManifestResponseUrl(data.url);
				this.segmentManager.processMainManifest(data);
			});
			_defineProperty(this, "handleLevelSwitching", (event, data) => {
				if (data.bitrate) this.core.setActiveLevelBitrate(data.bitrate);
			});
			_defineProperty(this, "handleLevelUpdated", (event, data) => {
				if (this.currentHlsInstance && data.details.fragments[0].type === "main" && data.details.fragments.length > 4) {
					if (data.details.live && !this.currentHlsInstance.userConfig.liveSyncDuration && !this.currentHlsInstance.userConfig.liveSyncDurationCount) this.updateLiveSyncDurationCount(data);
					if (!this.currentHlsInstance.userConfig.maxBufferLength && !this.currentHlsInstance.userConfig.maxMaxBufferLength) this.updateMaxBufferLength(data.details.targetduration);
				}
				this.core.setIsLive(data.details.live);
				this.segmentManager.updatePlaylist(data);
			});
			_defineProperty(this, "handleMediaAttached", () => {
				this.updateMediaElementEventHandlers("register");
			});
			_defineProperty(this, "handleMediaDetached", () => {
				this.updateMediaElementEventHandlers("unregister");
			});
			_defineProperty(this, "handlePlaybackUpdate", (event) => {
				const media = event.target;
				this.core.updatePlayback(media.currentTime, media.playbackRate);
			});
			_defineProperty(this, "destroyCore", () => this.core.destroy());
			_defineProperty(
				this,
				/** Cleans up and releases all resources, and unregisters all event handlers. */
				"destroy",
				() => {
					this.destroyCore();
					this.updateHlsEventsHandlers("unregister");
					this.updateMediaElementEventHandlers("unregister");
					this.currentHlsInstance = void 0;
				}
			);
			this.core = new Core(config === null || config === void 0 ? void 0 : config.core);
			this.segmentManager = new SegmentManager(this.core);
		}
		/**
		* Adds an event listener for the specified event.
		* @param eventName The name of the event to listen for.
		* @param listener The callback function to be invoked when the event is triggered.
		*
		* @example
		* // Listening for a segment being successfully loaded
		* p2pEngine.addEventListener('onSegmentLoaded', (details) => {
		*   console.log('Segment Loaded:', details);
		* });
		*
		* @example
		* // Handling segment load errors
		* p2pEngine.addEventListener('onSegmentError', (errorDetails) => {
		*   console.error('Error loading segment:', errorDetails);
		* });
		*
		* @example
		* // Tracking data downloaded from peers
		* p2pEngine.addEventListener('onChunkDownloaded', (bytesLength, downloadSource, peerId) => {
		*   console.log(`Downloaded ${bytesLength} bytes from ${downloadSource} ${peerId ? 'from peer ' + peerId : 'from server'}`);
		* });
		*/
		addEventListener(eventName, listener) {
			this.core.addEventListener(eventName, listener);
		}
		/**
		* Removes an event listener for the specified event.
		* @param eventName The name of the event.
		* @param listener The callback function that was previously added.
		*/
		removeEventListener(eventName, listener) {
			this.core.removeEventListener(eventName, listener);
		}
		/**
		* Provides the Hls.js P2P specific configuration for Hls.js loaders.
		* @returns An object containing the fragment loader (`fLoader`) and playlist loader (`pLoader`).
		*/
		getConfigForHlsJs() {
			return {
				fLoader: this.createFragmentLoaderClass(),
				pLoader: this.createPlaylistLoaderClass()
			};
		}
		/**
		* Retrieves the current configuration of the Hls.js P2P engine.
		* @returns A readonly version of the `HlsJsP2PEngineConfig`.
		*/
		getConfig() {
			return { core: this.core.getConfig() };
		}
		/**
		* Applies dynamic configuration updates to the P2P engine.
		* @param dynamicConfig The configuration changes to apply.
		*
		* @example
		* // Assuming `hlsP2PEngine` is an instance of HlsJsP2PEngine
		*
		* const newDynamicConfig = {
		*   core: {
		*     // Increase the number of cached segments to 1000
		*     cachedSegmentsCount: 1000,
		*     // 50 minutes of segments will be preemptively downloaded via HTTP connections
		*     httpDownloadTimeWindow: 3000,
		*     // 100 minutes of segments will be preemptively downloaded via P2P connections
		*     p2pDownloadTimeWindow: 6000,
		*   }
		* };
		*
		* hlsP2PEngine.applyDynamicConfig(newDynamicConfig);
		*/
		applyDynamicConfig(dynamicConfig) {
			if (dynamicConfig.core) this.core.applyDynamicConfig(dynamicConfig.core);
		}
		/**
		* Sets the HLS instance used for handling media.
		* @param hls The HLS instance, or a function that returns an HLS instance.
		*/
		bindHls(hls) {
			this.hlsInstanceGetter = typeof hls === "function" ? hls : () => hls;
		}
		initHlsEvents() {
			var _this$hlsInstanceGett;
			const hlsInstance = (_this$hlsInstanceGett = this.hlsInstanceGetter) === null || _this$hlsInstanceGett === void 0 ? void 0 : _this$hlsInstanceGett.call(this);
			if (this.currentHlsInstance === hlsInstance) return;
			if (this.currentHlsInstance) this.destroy();
			this.currentHlsInstance = hlsInstance;
			this.updateHlsEventsHandlers("register");
			this.updateMediaElementEventHandlers("register");
		}
		updateHlsEventsHandlers(type) {
			const hls = this.currentHlsInstance;
			if (!hls) return;
			const method = type === "register" ? "on" : "off";
			hls[method]("hlsManifestLoaded", this.handleManifestLoaded);
			hls[method]("hlsLevelSwitching", this.handleLevelSwitching);
			hls[method]("hlsLevelUpdated", this.handleLevelUpdated);
			hls[method]("hlsAudioTrackLoaded", this.handleLevelUpdated);
			hls[method]("hlsDestroying", this.destroy);
			hls[method]("hlsMediaAttaching", this.destroyCore);
			hls[method]("hlsManifestLoading", this.destroyCore);
			hls[method]("hlsMediaDetached", this.handleMediaDetached);
			hls[method]("hlsMediaAttached", this.handleMediaAttached);
		}
		updateLiveSyncDurationCount(data) {
			const fragmentDuration = data.details.targetduration;
			const maxLiveSyncCount = Math.floor(MAX_LIVE_SYNC_DURATION / fragmentDuration);
			const newLiveSyncDurationCount = Math.min(data.details.fragments.length - 1, maxLiveSyncCount);
			if (this.currentHlsInstance && this.currentHlsInstance.config.liveSyncDurationCount !== newLiveSyncDurationCount) {
				this.debug(`Setting liveSyncDurationCount to ${newLiveSyncDurationCount}`);
				this.currentHlsInstance.config.liveSyncDurationCount = newLiveSyncDurationCount;
			}
		}
		updateMaxBufferLength(fragmentDuration) {
			if (!this.currentHlsInstance) return;
			const config = this.core.getConfig();
			const highDemandTimeWindow = Math.max(config.mainStream.highDemandTimeWindow, config.secondaryStream.highDemandTimeWindow);
			const p2pOptimalBufferLength = Math.max(fragmentDuration * 2, highDemandTimeWindow);
			if (this.currentHlsInstance.config.maxBufferLength > p2pOptimalBufferLength) {
				this.debug(`Setting maxBufferLength to ${p2pOptimalBufferLength}`);
				this.currentHlsInstance.config.maxBufferLength = p2pOptimalBufferLength;
			}
			if (this.currentHlsInstance.config.maxMaxBufferLength > p2pOptimalBufferLength) {
				this.debug(`Setting maxMaxBufferLength to ${p2pOptimalBufferLength}`);
				this.currentHlsInstance.config.maxMaxBufferLength = p2pOptimalBufferLength;
			}
		}
		createFragmentLoaderClass() {
			const { core } = this;
			const engine = this;
			return class FragmentLoader extends FragmentLoaderBase {
				constructor(config) {
					super(config, core);
				}
				static getEngine() {
					return engine;
				}
			};
		}
		createPlaylistLoaderClass() {
			const engine = this;
			return class PlaylistLoader extends PlaylistLoaderBase {
				constructor(config) {
					super(config);
					engine.initHlsEvents();
				}
			};
		}
	};
	//#endregion
	exports.Core = Core;
	exports.HlsJsP2PEngine = HlsJsP2PEngine;
	return exports;
})({});

//# sourceMappingURL=p2p-media-loader-hlsjs.iife.js.map