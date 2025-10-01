var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/reflect-metadata/Reflect.js
var require_Reflect = __commonJS({
  "node_modules/reflect-metadata/Reflect.js"() {
    var Reflect2;
    (function(Reflect3) {
      (function(factory) {
        var root = typeof globalThis === "object" ? globalThis : typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : sloppyModeThis();
        var exporter = makeExporter(Reflect3);
        if (typeof root.Reflect !== "undefined") {
          exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter, root);
        if (typeof root.Reflect === "undefined") {
          root.Reflect = Reflect3;
        }
        function makeExporter(target, previous) {
          return function(key, value) {
            Object.defineProperty(target, key, { configurable: true, writable: true, value });
            if (previous)
              previous(key, value);
          };
        }
        function functionThis() {
          try {
            return Function("return this;")();
          } catch (_) {
          }
        }
        function indirectEvalThis() {
          try {
            return (void 0, eval)("(function() { return this; })()");
          } catch (_) {
          }
        }
        function sloppyModeThis() {
          return functionThis() || indirectEvalThis();
        }
      })(function(exporter, root) {
        var hasOwn = Object.prototype.hasOwnProperty;
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function";
        var supportsProto = { __proto__: [] } instanceof Array;
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
          // create an object in dictionary mode (a.k.a. "slow" mode in v8)
          create: supportsCreate ? function() {
            return MakeDictionary(/* @__PURE__ */ Object.create(null));
          } : supportsProto ? function() {
            return MakeDictionary({ __proto__: null });
          } : function() {
            return MakeDictionary({});
          },
          has: downLevel ? function(map, key) {
            return hasOwn.call(map, key);
          } : function(map, key) {
            return key in map;
          },
          get: downLevel ? function(map, key) {
            return hasOwn.call(map, key) ? map[key] : void 0;
          } : function(map, key) {
            return map[key];
          }
        };
        var functionPrototype = Object.getPrototypeOf(Function);
        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : void 0;
        var metadataRegistry = GetOrCreateMetadataRegistry();
        var metadataProvider = CreateMetadataProvider(metadataRegistry);
        function decorate(decorators, target, propertyKey, attributes) {
          if (!IsUndefined(propertyKey)) {
            if (!IsArray(decorators))
              throw new TypeError();
            if (!IsObject(target))
              throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
              throw new TypeError();
            if (IsNull(attributes))
              attributes = void 0;
            propertyKey = ToPropertyKey(propertyKey);
            return DecorateProperty(decorators, target, propertyKey, attributes);
          } else {
            if (!IsArray(decorators))
              throw new TypeError();
            if (!IsConstructor(target))
              throw new TypeError();
            return DecorateConstructor(decorators, target);
          }
        }
        exporter("decorate", decorate);
        function metadata(metadataKey, metadataValue) {
          function decorator(target, propertyKey) {
            if (!IsObject(target))
              throw new TypeError();
            if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
              throw new TypeError();
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
          }
          return decorator;
        }
        exporter("metadata", metadata);
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        function hasMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        function hasOwnMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        function getMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        function getOwnMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        function getMetadataKeys(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        function getOwnMetadataKeys(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        function deleteMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          var provider = GetMetadataProvider(
            target,
            propertyKey,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return false;
          return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
          for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
              if (!IsConstructor(decorated))
                throw new TypeError();
              target = decorated;
            }
          }
          return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
          for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
              if (!IsObject(decorated))
                throw new TypeError();
              descriptor = decorated;
            }
          }
          return descriptor;
        }
        function OrdinaryHasMetadata(MetadataKey, O, P) {
          var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
          if (hasOwn2)
            return true;
          var parent = OrdinaryGetPrototypeOf(O);
          if (!IsNull(parent))
            return OrdinaryHasMetadata(MetadataKey, parent, P);
          return false;
        }
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return false;
          return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
        }
        function OrdinaryGetMetadata(MetadataKey, O, P) {
          var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
          if (hasOwn2)
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
          var parent = OrdinaryGetPrototypeOf(O);
          if (!IsNull(parent))
            return OrdinaryGetMetadata(MetadataKey, parent, P);
          return void 0;
        }
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return;
          return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            true
          );
          provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
        }
        function OrdinaryMetadataKeys(O, P) {
          var ownKeys = OrdinaryOwnMetadataKeys(O, P);
          var parent = OrdinaryGetPrototypeOf(O);
          if (parent === null)
            return ownKeys;
          var parentKeys = OrdinaryMetadataKeys(parent, P);
          if (parentKeys.length <= 0)
            return ownKeys;
          if (ownKeys.length <= 0)
            return parentKeys;
          var set = new _Set();
          var keys = [];
          for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
            var key = ownKeys_1[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
              set.add(key);
              keys.push(key);
            }
          }
          for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
            var key = parentKeys_1[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
              set.add(key);
              keys.push(key);
            }
          }
          return keys;
        }
        function OrdinaryOwnMetadataKeys(O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*create*/
            false
          );
          if (!provider) {
            return [];
          }
          return provider.OrdinaryOwnMetadataKeys(O, P);
        }
        function Type(x) {
          if (x === null)
            return 1;
          switch (typeof x) {
            case "undefined":
              return 0;
            case "boolean":
              return 2;
            case "string":
              return 3;
            case "symbol":
              return 4;
            case "number":
              return 5;
            case "object":
              return x === null ? 1 : 6;
            default:
              return 6;
          }
        }
        function IsUndefined(x) {
          return x === void 0;
        }
        function IsNull(x) {
          return x === null;
        }
        function IsSymbol(x) {
          return typeof x === "symbol";
        }
        function IsObject(x) {
          return typeof x === "object" ? x !== null : typeof x === "function";
        }
        function ToPrimitive(input, PreferredType) {
          switch (Type(input)) {
            case 0:
              return input;
            case 1:
              return input;
            case 2:
              return input;
            case 3:
              return input;
            case 4:
              return input;
            case 5:
              return input;
          }
          var hint = PreferredType === 3 ? "string" : PreferredType === 5 ? "number" : "default";
          var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
          if (exoticToPrim !== void 0) {
            var result = exoticToPrim.call(input, hint);
            if (IsObject(result))
              throw new TypeError();
            return result;
          }
          return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        function OrdinaryToPrimitive(O, hint) {
          if (hint === "string") {
            var toString_1 = O.toString;
            if (IsCallable(toString_1)) {
              var result = toString_1.call(O);
              if (!IsObject(result))
                return result;
            }
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
              var result = valueOf.call(O);
              if (!IsObject(result))
                return result;
            }
          } else {
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
              var result = valueOf.call(O);
              if (!IsObject(result))
                return result;
            }
            var toString_2 = O.toString;
            if (IsCallable(toString_2)) {
              var result = toString_2.call(O);
              if (!IsObject(result))
                return result;
            }
          }
          throw new TypeError();
        }
        function ToBoolean(argument) {
          return !!argument;
        }
        function ToString(argument) {
          return "" + argument;
        }
        function ToPropertyKey(argument) {
          var key = ToPrimitive(
            argument,
            3
            /* String */
          );
          if (IsSymbol(key))
            return key;
          return ToString(key);
        }
        function IsArray(argument) {
          return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
        }
        function IsCallable(argument) {
          return typeof argument === "function";
        }
        function IsConstructor(argument) {
          return typeof argument === "function";
        }
        function IsPropertyKey(argument) {
          switch (Type(argument)) {
            case 3:
              return true;
            case 4:
              return true;
            default:
              return false;
          }
        }
        function SameValueZero(x, y) {
          return x === y || x !== x && y !== y;
        }
        function GetMethod(V, P) {
          var func = V[P];
          if (func === void 0 || func === null)
            return void 0;
          if (!IsCallable(func))
            throw new TypeError();
          return func;
        }
        function GetIterator(obj) {
          var method = GetMethod(obj, iteratorSymbol);
          if (!IsCallable(method))
            throw new TypeError();
          var iterator = method.call(obj);
          if (!IsObject(iterator))
            throw new TypeError();
          return iterator;
        }
        function IteratorValue(iterResult) {
          return iterResult.value;
        }
        function IteratorStep(iterator) {
          var result = iterator.next();
          return result.done ? false : result;
        }
        function IteratorClose(iterator) {
          var f = iterator["return"];
          if (f)
            f.call(iterator);
        }
        function OrdinaryGetPrototypeOf(O) {
          var proto = Object.getPrototypeOf(O);
          if (typeof O !== "function" || O === functionPrototype)
            return proto;
          if (proto !== functionPrototype)
            return proto;
          var prototype = O.prototype;
          var prototypeProto = prototype && Object.getPrototypeOf(prototype);
          if (prototypeProto == null || prototypeProto === Object.prototype)
            return proto;
          var constructor = prototypeProto.constructor;
          if (typeof constructor !== "function")
            return proto;
          if (constructor === O)
            return proto;
          return constructor;
        }
        function CreateMetadataRegistry() {
          var fallback;
          if (!IsUndefined(registrySymbol) && typeof root.Reflect !== "undefined" && !(registrySymbol in root.Reflect) && typeof root.Reflect.defineMetadata === "function") {
            fallback = CreateFallbackProvider(root.Reflect);
          }
          var first;
          var second;
          var rest;
          var targetProviderMap = new _WeakMap();
          var registry = {
            registerProvider,
            getProvider,
            setProvider
          };
          return registry;
          function registerProvider(provider) {
            if (!Object.isExtensible(registry)) {
              throw new Error("Cannot add provider to a frozen registry.");
            }
            switch (true) {
              case fallback === provider:
                break;
              case IsUndefined(first):
                first = provider;
                break;
              case first === provider:
                break;
              case IsUndefined(second):
                second = provider;
                break;
              case second === provider:
                break;
              default:
                if (rest === void 0)
                  rest = new _Set();
                rest.add(provider);
                break;
            }
          }
          function getProviderNoCache(O, P) {
            if (!IsUndefined(first)) {
              if (first.isProviderFor(O, P))
                return first;
              if (!IsUndefined(second)) {
                if (second.isProviderFor(O, P))
                  return first;
                if (!IsUndefined(rest)) {
                  var iterator = GetIterator(rest);
                  while (true) {
                    var next = IteratorStep(iterator);
                    if (!next) {
                      return void 0;
                    }
                    var provider = IteratorValue(next);
                    if (provider.isProviderFor(O, P)) {
                      IteratorClose(iterator);
                      return provider;
                    }
                  }
                }
              }
            }
            if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
              return fallback;
            }
            return void 0;
          }
          function getProvider(O, P) {
            var providerMap = targetProviderMap.get(O);
            var provider;
            if (!IsUndefined(providerMap)) {
              provider = providerMap.get(P);
            }
            if (!IsUndefined(provider)) {
              return provider;
            }
            provider = getProviderNoCache(O, P);
            if (!IsUndefined(provider)) {
              if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
              }
              providerMap.set(P, provider);
            }
            return provider;
          }
          function hasProvider(provider) {
            if (IsUndefined(provider))
              throw new TypeError();
            return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
          }
          function setProvider(O, P, provider) {
            if (!hasProvider(provider)) {
              throw new Error("Metadata provider not registered.");
            }
            var existingProvider = getProvider(O, P);
            if (existingProvider !== provider) {
              if (!IsUndefined(existingProvider)) {
                return false;
              }
              var providerMap = targetProviderMap.get(O);
              if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
              }
              providerMap.set(P, provider);
            }
            return true;
          }
        }
        function GetOrCreateMetadataRegistry() {
          var metadataRegistry2;
          if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
            metadataRegistry2 = root.Reflect[registrySymbol];
          }
          if (IsUndefined(metadataRegistry2)) {
            metadataRegistry2 = CreateMetadataRegistry();
          }
          if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
            Object.defineProperty(root.Reflect, registrySymbol, {
              enumerable: false,
              configurable: false,
              writable: false,
              value: metadataRegistry2
            });
          }
          return metadataRegistry2;
        }
        function CreateMetadataProvider(registry) {
          var metadata2 = new _WeakMap();
          var provider = {
            isProviderFor: function(O, P) {
              var targetMetadata = metadata2.get(O);
              if (IsUndefined(targetMetadata))
                return false;
              return targetMetadata.has(P);
            },
            OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata2,
            OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata2,
            OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata2,
            OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys2,
            OrdinaryDeleteMetadata
          };
          metadataRegistry.registerProvider(provider);
          return provider;
          function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = metadata2.get(O);
            var createdTargetMetadata = false;
            if (IsUndefined(targetMetadata)) {
              if (!Create)
                return void 0;
              targetMetadata = new _Map();
              metadata2.set(O, targetMetadata);
              createdTargetMetadata = true;
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
              if (!Create)
                return void 0;
              metadataMap = new _Map();
              targetMetadata.set(P, metadataMap);
              if (!registry.setProvider(O, P, provider)) {
                targetMetadata.delete(P);
                if (createdTargetMetadata) {
                  metadata2.delete(O);
                }
                throw new Error("Wrong provider for target.");
              }
            }
            return metadataMap;
          }
          function OrdinaryHasOwnMetadata2(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return false;
            return ToBoolean(metadataMap.has(MetadataKey));
          }
          function OrdinaryGetOwnMetadata2(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return void 0;
            return metadataMap.get(MetadataKey);
          }
          function OrdinaryDefineOwnMetadata2(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              true
            );
            metadataMap.set(MetadataKey, MetadataValue);
          }
          function OrdinaryOwnMetadataKeys2(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
              var next = IteratorStep(iterator);
              if (!next) {
                keys.length = k;
                return keys;
              }
              var nextValue = IteratorValue(next);
              try {
                keys[k] = nextValue;
              } catch (e) {
                try {
                  IteratorClose(iterator);
                } finally {
                  throw e;
                }
              }
              k++;
            }
          }
          function OrdinaryDeleteMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return false;
            if (!metadataMap.delete(MetadataKey))
              return false;
            if (metadataMap.size === 0) {
              var targetMetadata = metadata2.get(O);
              if (!IsUndefined(targetMetadata)) {
                targetMetadata.delete(P);
                if (targetMetadata.size === 0) {
                  metadata2.delete(targetMetadata);
                }
              }
            }
            return true;
          }
        }
        function CreateFallbackProvider(reflect) {
          var defineMetadata2 = reflect.defineMetadata, hasOwnMetadata2 = reflect.hasOwnMetadata, getOwnMetadata2 = reflect.getOwnMetadata, getOwnMetadataKeys2 = reflect.getOwnMetadataKeys, deleteMetadata2 = reflect.deleteMetadata;
          var metadataOwner = new _WeakMap();
          var provider = {
            isProviderFor: function(O, P) {
              var metadataPropertySet = metadataOwner.get(O);
              if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
                return true;
              }
              if (getOwnMetadataKeys2(O, P).length) {
                if (IsUndefined(metadataPropertySet)) {
                  metadataPropertySet = new _Set();
                  metadataOwner.set(O, metadataPropertySet);
                }
                metadataPropertySet.add(P);
                return true;
              }
              return false;
            },
            OrdinaryDefineOwnMetadata: defineMetadata2,
            OrdinaryHasOwnMetadata: hasOwnMetadata2,
            OrdinaryGetOwnMetadata: getOwnMetadata2,
            OrdinaryOwnMetadataKeys: getOwnMetadataKeys2,
            OrdinaryDeleteMetadata: deleteMetadata2
          };
          return provider;
        }
        function GetMetadataProvider(O, P, Create) {
          var registeredProvider = metadataRegistry.getProvider(O, P);
          if (!IsUndefined(registeredProvider)) {
            return registeredProvider;
          }
          if (Create) {
            if (metadataRegistry.setProvider(O, P, metadataProvider)) {
              return metadataProvider;
            }
            throw new Error("Illegal state.");
          }
          return void 0;
        }
        function CreateMapPolyfill() {
          var cacheSentinel = {};
          var arraySentinel = [];
          var MapIterator = (
            /** @class */
            (function() {
              function MapIterator2(keys, values, selector) {
                this._index = 0;
                this._keys = keys;
                this._values = values;
                this._selector = selector;
              }
              MapIterator2.prototype["@@iterator"] = function() {
                return this;
              };
              MapIterator2.prototype[iteratorSymbol] = function() {
                return this;
              };
              MapIterator2.prototype.next = function() {
                var index = this._index;
                if (index >= 0 && index < this._keys.length) {
                  var result = this._selector(this._keys[index], this._values[index]);
                  if (index + 1 >= this._keys.length) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                  } else {
                    this._index++;
                  }
                  return { value: result, done: false };
                }
                return { value: void 0, done: true };
              };
              MapIterator2.prototype.throw = function(error) {
                if (this._index >= 0) {
                  this._index = -1;
                  this._keys = arraySentinel;
                  this._values = arraySentinel;
                }
                throw error;
              };
              MapIterator2.prototype.return = function(value) {
                if (this._index >= 0) {
                  this._index = -1;
                  this._keys = arraySentinel;
                  this._values = arraySentinel;
                }
                return { value, done: true };
              };
              return MapIterator2;
            })()
          );
          var Map2 = (
            /** @class */
            (function() {
              function Map3() {
                this._keys = [];
                this._values = [];
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              }
              Object.defineProperty(Map3.prototype, "size", {
                get: function() {
                  return this._keys.length;
                },
                enumerable: true,
                configurable: true
              });
              Map3.prototype.has = function(key) {
                return this._find(
                  key,
                  /*insert*/
                  false
                ) >= 0;
              };
              Map3.prototype.get = function(key) {
                var index = this._find(
                  key,
                  /*insert*/
                  false
                );
                return index >= 0 ? this._values[index] : void 0;
              };
              Map3.prototype.set = function(key, value) {
                var index = this._find(
                  key,
                  /*insert*/
                  true
                );
                this._values[index] = value;
                return this;
              };
              Map3.prototype.delete = function(key) {
                var index = this._find(
                  key,
                  /*insert*/
                  false
                );
                if (index >= 0) {
                  var size = this._keys.length;
                  for (var i = index + 1; i < size; i++) {
                    this._keys[i - 1] = this._keys[i];
                    this._values[i - 1] = this._values[i];
                  }
                  this._keys.length--;
                  this._values.length--;
                  if (SameValueZero(key, this._cacheKey)) {
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                  }
                  return true;
                }
                return false;
              };
              Map3.prototype.clear = function() {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              };
              Map3.prototype.keys = function() {
                return new MapIterator(this._keys, this._values, getKey);
              };
              Map3.prototype.values = function() {
                return new MapIterator(this._keys, this._values, getValue);
              };
              Map3.prototype.entries = function() {
                return new MapIterator(this._keys, this._values, getEntry);
              };
              Map3.prototype["@@iterator"] = function() {
                return this.entries();
              };
              Map3.prototype[iteratorSymbol] = function() {
                return this.entries();
              };
              Map3.prototype._find = function(key, insert) {
                if (!SameValueZero(this._cacheKey, key)) {
                  this._cacheIndex = -1;
                  for (var i = 0; i < this._keys.length; i++) {
                    if (SameValueZero(this._keys[i], key)) {
                      this._cacheIndex = i;
                      break;
                    }
                  }
                }
                if (this._cacheIndex < 0 && insert) {
                  this._cacheIndex = this._keys.length;
                  this._keys.push(key);
                  this._values.push(void 0);
                }
                return this._cacheIndex;
              };
              return Map3;
            })()
          );
          return Map2;
          function getKey(key, _) {
            return key;
          }
          function getValue(_, value) {
            return value;
          }
          function getEntry(key, value) {
            return [key, value];
          }
        }
        function CreateSetPolyfill() {
          var Set2 = (
            /** @class */
            (function() {
              function Set3() {
                this._map = new _Map();
              }
              Object.defineProperty(Set3.prototype, "size", {
                get: function() {
                  return this._map.size;
                },
                enumerable: true,
                configurable: true
              });
              Set3.prototype.has = function(value) {
                return this._map.has(value);
              };
              Set3.prototype.add = function(value) {
                return this._map.set(value, value), this;
              };
              Set3.prototype.delete = function(value) {
                return this._map.delete(value);
              };
              Set3.prototype.clear = function() {
                this._map.clear();
              };
              Set3.prototype.keys = function() {
                return this._map.keys();
              };
              Set3.prototype.values = function() {
                return this._map.keys();
              };
              Set3.prototype.entries = function() {
                return this._map.entries();
              };
              Set3.prototype["@@iterator"] = function() {
                return this.keys();
              };
              Set3.prototype[iteratorSymbol] = function() {
                return this.keys();
              };
              return Set3;
            })()
          );
          return Set2;
        }
        function CreateWeakMapPolyfill() {
          var UUID_SIZE = 16;
          var keys = HashMap.create();
          var rootKey = CreateUniqueKey();
          return (
            /** @class */
            (function() {
              function WeakMap2() {
                this._key = CreateUniqueKey();
              }
              WeakMap2.prototype.has = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? HashMap.has(table, this._key) : false;
              };
              WeakMap2.prototype.get = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? HashMap.get(table, this._key) : void 0;
              };
              WeakMap2.prototype.set = function(target, value) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  true
                );
                table[this._key] = value;
                return this;
              };
              WeakMap2.prototype.delete = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? delete table[this._key] : false;
              };
              WeakMap2.prototype.clear = function() {
                this._key = CreateUniqueKey();
              };
              return WeakMap2;
            })()
          );
          function CreateUniqueKey() {
            var key;
            do
              key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
          }
          function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
              if (!create)
                return void 0;
              Object.defineProperty(target, rootKey, { value: HashMap.create() });
            }
            return target[rootKey];
          }
          function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i)
              buffer[i] = Math.random() * 255 | 0;
            return buffer;
          }
          function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
              var array = new Uint8Array(size);
              if (typeof crypto !== "undefined") {
                crypto.getRandomValues(array);
              } else if (typeof msCrypto !== "undefined") {
                msCrypto.getRandomValues(array);
              } else {
                FillRandomBytes(array, size);
              }
              return array;
            }
            return FillRandomBytes(new Array(size), size);
          }
          function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            data[6] = data[6] & 79 | 64;
            data[8] = data[8] & 191 | 128;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
              var byte = data[offset];
              if (offset === 4 || offset === 6 || offset === 8)
                result += "-";
              if (byte < 16)
                result += "0";
              result += byte.toString(16).toLowerCase();
            }
            return result;
          }
        }
        function MakeDictionary(obj) {
          obj.__ = void 0;
          delete obj.__;
          return obj;
        }
      });
    })(Reflect2 || (Reflect2 = {}));
  }
});

// node_modules/idb-ts/lib/index.esm.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyGenerators = exports.Index = exports.DataClass = exports.CompositeKeyPath = exports.KeyPath = exports.Database = void 0;
var tslib_1 = __require("tslib");
require_Reflect();
var QueryBuilder = class {
  constructor(db, storeName) {
    this.conditions = [];
    this.orderDirection = "asc";
    this.db = db;
    this.storeName = storeName;
  }
  where(field) {
    this.currentField = field;
    return this;
  }
  and(field) {
    this.currentField = field;
    return this;
  }
  equals(value) {
    if (!this.currentField)
      throw new Error("No field specified for equals");
    this.conditions.push({ field: this.currentField, op: "equals", value });
    this.currentField = void 0;
    return this;
  }
  gt(value) {
    if (!this.currentField)
      throw new Error("No field specified for gt");
    this.conditions.push({ field: this.currentField, op: "gt", value });
    this.currentField = void 0;
    return this;
  }
  gte(value) {
    if (!this.currentField)
      throw new Error("No field specified for gte");
    this.conditions.push({ field: this.currentField, op: "gte", value });
    this.currentField = void 0;
    return this;
  }
  lt(value) {
    if (!this.currentField)
      throw new Error("No field specified for lt");
    this.conditions.push({ field: this.currentField, op: "lt", value });
    this.currentField = void 0;
    return this;
  }
  lte(value) {
    if (!this.currentField)
      throw new Error("No field specified for lte");
    this.conditions.push({ field: this.currentField, op: "lte", value });
    this.currentField = void 0;
    return this;
  }
  orderBy(field, direction = "asc") {
    this.orderField = field;
    this.orderDirection = direction;
    return this;
  }
  limit(n) {
    this.limitCount = n;
    return this;
  }
  offset(n) {
    this.offsetCount = n;
    return this;
  }
  useIndex(indexName) {
    this.indexName = indexName;
    return this;
  }
  range(start, end) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }
  execute() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.storeName, "readonly");
        let store = tx.objectStore(this.storeName);
        let request;
        let results = [];
        if (this.indexName) {
          if (!store.indexNames.contains(this.indexName)) {
            reject(new Error(`Index '${this.indexName}' does not exist on ${this.storeName}`));
            return;
          }
          const index = store.index(this.indexName);
          let keyRange;
          if (this.rangeStart !== void 0 && this.rangeEnd !== void 0) {
            keyRange = IDBKeyRange.bound(this.rangeStart, this.rangeEnd);
          } else if (this.rangeStart !== void 0) {
            keyRange = IDBKeyRange.lowerBound(this.rangeStart);
          } else if (this.rangeEnd !== void 0) {
            keyRange = IDBKeyRange.upperBound(this.rangeEnd);
          }
          request = index.openCursor(keyRange);
        } else {
          request = store.openCursor();
        }
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            let match = true;
            const value = cursor.value;
            for (const cond of this.conditions) {
              const val = value[cond.field];
              switch (cond.op) {
                case "equals":
                  match = match && val === cond.value;
                  break;
                case "gt":
                  match = match && val > cond.value;
                  break;
                case "gte":
                  match = match && val >= cond.value;
                  break;
                case "lt":
                  match = match && val < cond.value;
                  break;
                case "lte":
                  match = match && val <= cond.value;
                  break;
              }
            }
            if (match)
              results.push(value);
            cursor.continue();
          } else {
            if (this.orderField) {
              results.sort((a, b) => {
                const va = a[this.orderField];
                const vb = b[this.orderField];
                if (va < vb)
                  return this.orderDirection === "asc" ? -1 : 1;
                if (va > vb)
                  return this.orderDirection === "asc" ? 1 : -1;
                return 0;
              });
            }
            if (this.offsetCount !== void 0)
              results = results.slice(this.offsetCount);
            if (this.limitCount !== void 0)
              results = results.slice(0, this.limitCount);
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }
};
var KeyGenerators = class {
  static uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  static timestamp() {
    return Date.now();
  }
  static random() {
    return Math.random().toString(36).substring(2, 15);
  }
};
exports.KeyGenerators = KeyGenerators;
function KeyPath(options) {
  return (target, propertyKey) => {
    const constructor = target.constructor;
    const existingKeypaths = Reflect.getMetadata("individual_keypaths", constructor) || [];
    existingKeypaths.push(propertyKey);
    Reflect.defineMetadata("individual_keypaths", existingKeypaths, constructor);
    const metadata = {
      fields: propertyKey,
      options
    };
    Reflect.defineMetadata("keypath", metadata, constructor);
  };
}
exports.KeyPath = KeyPath;
function CompositeKeyPath(fields, options) {
  return (target) => {
    const metadata = {
      fields,
      options
    };
    Reflect.defineMetadata("keypath", metadata, target);
  };
}
exports.CompositeKeyPath = CompositeKeyPath;
function Index() {
  return (target, propertyKey) => {
    const constructor = target.constructor;
    const existing = Reflect.getMetadata("indexes", constructor) || [];
    Reflect.defineMetadata("indexes", [...existing, propertyKey], constructor);
  };
}
exports.Index = Index;
function DataClass(options = {}) {
  return (target) => {
    const keyPathMetadata = Reflect.getMetadata("keypath", target);
    if (!keyPathMetadata) {
      throw new Error(`No keypath field defined for the class ${target.name}.`);
    }
    const individualKeypaths = Reflect.getMetadata("individual_keypaths", target) || [];
    if (individualKeypaths.length > 1) {
      throw new Error(`Only one keypath field can be defined for the class ${target.name}.`);
    }
    const version = options.version || 1;
    Reflect.defineMetadata("dataclass", true, target);
    Reflect.defineMetadata("version", version, target);
  };
}
exports.DataClass = DataClass;
var Database = class _Database {
  constructor(dbName, classes) {
    this.db = null;
    this.entityRepositories = /* @__PURE__ */ new Map();
    this.dbName = dbName;
    if (!classes.every((cls) => Reflect.getMetadata("dataclass", cls))) {
      throw new Error("All classes should be decorated with @DataClass.");
    }
    this.classes = classes;
    this.dbVersion = this.calculateDatabaseVersion();
  }
  calculateDatabaseVersion() {
    const versions = this.classes.map((cls) => Reflect.getMetadata("version", cls) || 1);
    return Math.max(...versions);
  }
  static build(dbName, classes) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      const instance = new _Database(dbName, classes);
      yield instance.initDB();
      instance.generateEntityRepositories();
      return instance;
    });
  }
  initDB() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        request.onupgradeneeded = (event) => {
          const db = request.result;
          const oldVersion = event.oldVersion;
          const newVersion = event.newVersion || this.dbVersion;
          console.debug(`Database upgrade from version ${oldVersion} to ${newVersion}`);
          this.classes.forEach((cls) => {
            var _a;
            const keyPathMetadata = Reflect.getMetadata("keypath", cls);
            const indexFields = Reflect.getMetadata("indexes", cls) || [];
            const classVersion = Reflect.getMetadata("version", cls) || 1;
            const storeName = cls.name.toLowerCase();
            if (classVersion > oldVersion) {
              if (!db.objectStoreNames.contains(storeName)) {
                console.debug(`Creating object store: ${storeName} (version ${classVersion})`);
                const storeOptions = {};
                if (keyPathMetadata) {
                  storeOptions.keyPath = keyPathMetadata.fields;
                  if ((_a = keyPathMetadata.options) === null || _a === void 0 ? void 0 : _a.autoIncrement) {
                    storeOptions.autoIncrement = true;
                  }
                }
                const store = db.createObjectStore(storeName, storeOptions);
                indexFields.forEach((indexField) => {
                  if (!store.indexNames.contains(indexField)) {
                    store.createIndex(indexField, indexField, { unique: false });
                  }
                });
              } else {
                console.debug(`Updating object store: ${storeName} (version ${classVersion})`);
                const transaction = request.transaction;
                if (transaction) {
                  const store = transaction.objectStore(storeName);
                  indexFields.forEach((indexField) => {
                    if (!store.indexNames.contains(indexField)) {
                      console.debug(`Adding index: ${indexField} to ${storeName}`);
                      store.createIndex(indexField, indexField, { unique: false });
                    }
                  });
                }
              }
            }
          });
        };
        request.onsuccess = () => {
          this.db = request.result;
          console.debug(`Database initialized (version ${this.dbVersion}) with object stores for: ${this.classes.map((cls) => `${cls.name}(v${Reflect.getMetadata("version", cls) || 1})`).join(", ")}`);
          resolve();
        };
        request.onerror = () => {
          console.error("Error initializing database:", request.error);
          reject(request.error);
        };
      });
    });
  }
  generateEntityRepositories() {
    this.classes.forEach((cls) => {
      const entityName = cls.name;
      const repository = this.createEntityRepository(cls);
      this.entityRepositories.set(entityName, repository);
      Object.defineProperty(this, entityName, {
        value: repository,
        writable: false,
        enumerable: true,
        configurable: false
      });
    });
  }
  createEntityRepository(cls) {
    const self2 = this;
    const generateKey = (item) => {
      var _a;
      const keyPathMetadata = Reflect.getMetadata("keypath", cls);
      if (!((_a = keyPathMetadata === null || keyPathMetadata === void 0 ? void 0 : keyPathMetadata.options) === null || _a === void 0 ? void 0 : _a.generator))
        return void 0;
      const generator = keyPathMetadata.options.generator;
      if (typeof generator === "function") {
        return generator(item);
      }
      switch (generator) {
        case "uuid":
          return KeyGenerators.uuid();
        case "timestamp":
          return KeyGenerators.timestamp();
        case "random":
          return KeyGenerators.random();
        default:
          return void 0;
      }
    };
    const extractKey = (item) => {
      const keyPathMetadata = Reflect.getMetadata("keypath", cls);
      if (!keyPathMetadata)
        return void 0;
      const fields = keyPathMetadata.fields;
      if (Array.isArray(fields)) {
        return fields.map((field) => item[field]);
      } else {
        return item[fields];
      }
    };
    const setKey = (item, key) => {
      const keyPathMetadata = Reflect.getMetadata("keypath", cls);
      if (!keyPathMetadata)
        return;
      const fields = keyPathMetadata.fields;
      if (typeof fields === "string") {
        item[fields] = key;
      }
    };
    return {
      query() {
        if (!self2.db)
          throw new Error("Database not initialized.");
        const storeName = cls.name.toLowerCase();
        return new QueryBuilder(self2.db, storeName);
      },
      create: (item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a;
        const keyPathMetadata = Reflect.getMetadata("keypath", cls);
        if (((_a = keyPathMetadata === null || keyPathMetadata === void 0 ? void 0 : keyPathMetadata.options) === null || _a === void 0 ? void 0 : _a.generator) && !keyPathMetadata.options.autoIncrement) {
          const currentKey = extractKey(item);
          if (currentKey === void 0 || currentKey === null || currentKey === "") {
            const generatedKey = generateKey(item);
            if (generatedKey !== void 0) {
              setKey(item, generatedKey);
            }
          }
        }
        return this.performOperation(cls.name, "readwrite", (store) => {
          const request = store.add(item);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item added to ${cls.name}:`, item);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      read: (key) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          const request = store.get(key);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item read from ${cls.name}:`, request.result);
              resolve(request.result);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      update: (item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readwrite", (store) => {
          const request = store.put(item);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item updated in ${cls.name}:`, item);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      delete: (key) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readwrite", (store) => {
          const request = store.delete(key);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item deleted from ${cls.name}:`, key);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      list: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          const request = store.getAll();
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`All items from ${cls.name}:`, request.result);
              resolve(request.result);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      listPaginated: (page, pageSize) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          const request = store.getAll();
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              const items = request.result;
              const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
              console.debug(`Paginated items from ${cls.name}:`, paginatedItems);
              resolve(paginatedItems);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      findByIndex: (indexName, value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          if (!store.indexNames.contains(indexName)) {
            throw new Error(`Index '${indexName}' does not exist on ${cls.name}`);
          }
          const index = store.index(indexName);
          const request = index.getAll(value);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Items found by index ${indexName} with value ${value}:`, request.result);
              resolve(request.result);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      findOneByIndex: (indexName, value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          if (!store.indexNames.contains(indexName)) {
            throw new Error(`Index '${indexName}' does not exist on ${cls.name}`);
          }
          const index = store.index(indexName);
          const request = index.get(value);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item found by index ${indexName} with value ${value}:`, request.result);
              resolve(request.result);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      count: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          const request = store.count();
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Count for ${cls.name}:`, request.result);
              resolve(request.result);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      exists: (key) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readonly", (store) => {
          const request = store.count(key);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              const exists = request.result > 0;
              console.debug(`Exists check for ${cls.name} with key ${key}:`, exists);
              resolve(exists);
            };
            request.onerror = () => reject(request.error);
          });
        });
      }),
      clear: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        return this.performOperation(cls.name, "readwrite", (store) => {
          const request = store.clear();
          return new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Cleared all items from ${cls.name}`);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      })
    };
  }
  performOperation(className, mode, operation) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      if (!this.db) {
        throw new Error("Database not initialized.");
      }
      const storeName = className.toLowerCase();
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      return operation(store);
    });
  }
  getAvailableEntities() {
    return Array.from(this.entityRepositories.keys());
  }
  getDatabaseVersion() {
    return this.dbVersion;
  }
  getEntityVersions() {
    const versions = /* @__PURE__ */ new Map();
    this.classes.forEach((cls) => {
      const version = Reflect.getMetadata("version", cls) || 1;
      versions.set(cls.name, version);
    });
    return versions;
  }
  getEntityVersion(entityName) {
    const cls = this.classes.find((c) => c.name === entityName);
    return cls ? Reflect.getMetadata("version", cls) || 1 : void 0;
  }
};
exports.Database = Database;

// index.ts
var User = class {
  constructor(name, email, age, address, cell) {
    this.status = "active";
    this.createdAt = /* @__PURE__ */ new Date();
    this.name = name;
    this.email = email;
    this.age = age;
    this.address = address;
    this.cell = cell;
  }
};
__decorateClass([
  (void 0)("id", { autoIncrement: true })
], User.prototype, "id", 2);
__decorateClass([
  (void 0)("email", { unique: true })
], User.prototype, "email", 2);
__decorateClass([
  (void 0)("age")
], User.prototype, "age", 2);
User = __decorateClass([
  (void 0)({ version: 1 })
], User);
var Post = class {
  constructor(title, content, authorEmail, category = "general") {
    this.tags = [];
    this.publishedAt = /* @__PURE__ */ new Date();
    this.likes = 0;
    this.title = title;
    this.content = content;
    this.authorEmail = authorEmail;
    this.category = category;
  }
};
__decorateClass([
  (void 0)("uuid", { generator: (void 0).uuid })
], Post.prototype, "uuid", 2);
__decorateClass([
  (void 0)("authorEmail")
], Post.prototype, "authorEmail", 2);
__decorateClass([
  (void 0)("category")
], Post.prototype, "category", 2);
Post = __decorateClass([
  (void 0)({ version: 2 })
], Post);
var UserProject = class {
  constructor(userId, projectId, role = "member") {
    this.joinedAt = /* @__PURE__ */ new Date();
    this.permissions = [];
    this.userId = userId;
    this.projectId = projectId;
    this.role = role;
  }
};
__decorateClass([
  (void 0)("role")
], UserProject.prototype, "role", 2);
UserProject = __decorateClass([
  (void 0)({ version: 1 }),
  (void 0)(["userId", "projectId"])
], UserProject);
var Activity = class {
  constructor(userId, type, metadata = {}) {
    this.timestamp = Date.now();
    this.metadata = {};
    this.userId = userId;
    this.type = type;
    this.metadata = metadata;
  }
};
__decorateClass([
  (void 0)("activityId", {
    generator: (item) => `${item.type}_${item.userId}_${Date.now()}`
  })
], Activity.prototype, "activityId", 2);
__decorateClass([
  (void 0)("userId")
], Activity.prototype, "userId", 2);
__decorateClass([
  (void 0)("type")
], Activity.prototype, "type", 2);
__decorateClass([
  (void 0)("timestamp")
], Activity.prototype, "timestamp", 2);
Activity = __decorateClass([
  (void 0)({ version: 1 })
], Activity);
async function demonstrateFeatures() {
  console.log("\u{1F680} Starting idb-ts v3.7.0 Feature Demonstration");
  const db = new (void 0)("idb-demo-v3", [User, Post, UserProject, Activity]);
  await db.initialize();
  console.log(`\u{1F4CA} Database initialized with version: ${db.getDatabaseVersion()}`);
  console.log(`\u{1F4CB} Available entities: ${db.getAvailableEntities().join(", ")}`);
  console.log("\n=== CRUD Operations Demo ===");
  const alice = new User("Alice Johnson", "alice@example.com", 28, "123 Main St", "+1234567890");
  const bob = new User("Bob Smith", "bob@example.com", 32, "456 Oak Ave");
  const charlie = new User("Charlie Brown", "charlie@example.com", 25, "789 Pine Rd");
  await db.User.create(alice);
  await db.User.create(bob);
  await db.User.create(charlie);
  console.log("\u2705 Created 3 users with auto-increment IDs");
  const post1 = new Post("Getting Started with idb-ts", "This is a comprehensive guide to using idb-ts...", "alice@example.com", "tutorial");
  post1.tags = ["typescript", "indexeddb", "tutorial"];
  const post2 = new Post("Advanced Database Patterns", "Let's explore advanced patterns in IndexedDB...", "bob@example.com", "advanced");
  post2.tags = ["database", "patterns", "advanced"];
  await db.Post.create(post1);
  await db.Post.create(post2);
  console.log("\u2705 Created 2 posts with UUID keys");
  const project1 = new UserProject("alice@example.com", "project-alpha", "admin");
  project1.permissions = ["read", "write", "delete", "manage"];
  const project2 = new UserProject("bob@example.com", "project-alpha", "member");
  project2.permissions = ["read", "write"];
  const project3 = new UserProject("alice@example.com", "project-beta", "admin");
  project3.permissions = ["read", "write", "delete", "manage"];
  await db.UserProject.create(project1);
  await db.UserProject.create(project2);
  await db.UserProject.create(project3);
  console.log("\u2705 Created user-project relationships with composite keys");
  const activity1 = new Activity("alice@example.com", "login", { ip: "192.168.1.100", browser: "Chrome" });
  const activity2 = new Activity("alice@example.com", "post_created", { postId: post1.uuid, title: post1.title });
  const activity3 = new Activity("bob@example.com", "post_liked", { postId: post1.uuid, likedBy: "bob@example.com" });
  await db.Activity.create(activity1);
  await db.Activity.create(activity2);
  await db.Activity.create(activity3);
  console.log("\u2705 Created activities with custom key generation");
  console.log("\n=== Advanced Query Builder Demo ===");
  const activeUsers = await db.User.query().where("status").equals("active").and("age").gt(25).orderBy("age", "asc").execute();
  console.log(
    `\u{1F50D} Found ${activeUsers.length} active users older than 25:`,
    activeUsers.map((u) => ({ name: u.name, age: u.age, email: u.email }))
  );
  const tutorialPosts = await db.Post.query().where("category").equals("tutorial").orderBy("publishedAt", "desc").limit(10).execute();
  console.log(
    `\u{1F4DA} Found ${tutorialPosts.length} tutorial posts:`,
    tutorialPosts.map((p) => ({ title: p.title, author: p.authorEmail }))
  );
  const recentLogins = await db.Activity.query().where("type").equals("login").and("timestamp").gte(Date.now() - 24 * 60 * 60 * 1e3).orderBy("timestamp", "desc").execute();
  console.log(
    `\u{1F6AA} Found ${recentLogins.length} recent logins:`,
    recentLogins.map((a) => ({ userId: a.userId, timestamp: new Date(a.timestamp).toLocaleString() }))
  );
  console.log("\n=== Index-based Queries Demo ===");
  const userByEmail = await db.User.findByIndex("email", "alice@example.com");
  console.log("\u{1F464} User found by email:", userByEmail ? { name: userByEmail.name, email: userByEmail.email } : "Not found");
  const adminProjects = await db.UserProject.findAllByIndex("role", "admin");
  console.log(
    `\u{1F451} Found ${adminProjects.length} admin relationships:`,
    adminProjects.map((p) => ({ userId: p.userId, projectId: p.projectId }))
  );
  console.log("\n=== Composite Key Operations Demo ===");
  const specificProject = await db.UserProject.read(["alice@example.com", "project-alpha"]);
  console.log("\u{1F4C1} Project relationship:", specificProject ? { user: specificProject.userId, project: specificProject.projectId, role: specificProject.role } : "Not found");
  if (specificProject) {
    specificProject.permissions.push("deploy");
    await db.UserProject.update(specificProject);
    console.log("\u270F\uFE0F Updated project permissions");
  }
  console.log("\n=== Pagination Demo ===");
  const firstPage = await db.User.query().orderBy("name", "asc").limit(2).execute();
  const secondPage = await db.User.query().orderBy("name", "asc").offset(2).limit(2).execute();
  console.log("\u{1F4C4} First page users:", firstPage.map((u) => u.name));
  console.log("\u{1F4C4} Second page users:", secondPage.map((u) => u.name));
  console.log("\n=== Database Statistics ===");
  const allUsers = await db.User.list();
  const allPosts = await db.Post.list();
  const allProjects = await db.UserProject.list();
  const allActivities = await db.Activity.list();
  console.log(`\u{1F4CA} Database contains:`);
  console.log(`   Users: ${allUsers.length}`);
  console.log(`   Posts: ${allPosts.length}`);
  console.log(`   User-Project relationships: ${allProjects.length}`);
  console.log(`   Activities: ${allActivities.length}`);
  const entityVersions = db.getEntityVersions();
  console.log("\u{1F3F7}\uFE0F Entity versions:");
  entityVersions.forEach((version, entity) => {
    console.log(`   ${entity}: v${version}`);
  });
  console.log("\n\u{1F389} idb-ts v3.7.0 Feature Demonstration Complete!");
}
demonstrateFeatures().catch(console.error);
/*! Bundled license information:

reflect-metadata/Reflect.js:
  (*! *****************************************************************************
  Copyright (C) Microsoft. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** *)
*/
