"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
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

  // node_modules/tslib/tslib.es6.mjs
  function __awaiter(thisArg, _arguments, P, generator) {
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
  }

  // node_modules/idb-ts/lib/index.esm.js
  var import_reflect_metadata = __toESM(require_Reflect(), 1);
  var FieldQueryBuilder = class {
    constructor(parent, field) {
      this.parent = parent;
      this.field = field;
    }
    equals(value) {
      this.parent.appendCondition(this.field, "equals", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    gt(value) {
      this.parent.appendCondition(this.field, "gt", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    gte(value) {
      this.parent.appendCondition(this.field, "gte", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    lt(value) {
      this.parent.appendCondition(this.field, "lt", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    lte(value) {
      this.parent.appendCondition(this.field, "lte", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    startsWith(value) {
      this.parent.appendCondition(this.field, "startsWith", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    endsWith(value) {
      this.parent.appendCondition(this.field, "endsWith", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    contains(value) {
      this.parent.appendCondition(this.field, "contains", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    matches(value) {
      this.parent.appendCondition(this.field, "matches", value);
      this.parent.clearCurrentField();
      return this.parent;
    }
    between(start, end) {
      this.parent.appendCondition(this.field, "between", [start, end]);
      this.parent.clearCurrentField();
      return this.parent;
    }
    notBetween(start, end) {
      this.parent.appendCondition(this.field, "notBetween", [start, end]);
      this.parent.clearCurrentField();
      return this.parent;
    }
    in(values) {
      this.parent.appendCondition(this.field, "in", values);
      this.parent.clearCurrentField();
      return this.parent;
    }
    notIn(values) {
      this.parent.appendCondition(this.field, "notIn", values);
      this.parent.clearCurrentField();
      return this.parent;
    }
    containsAny(values) {
      this.parent.appendCondition(this.field, "containsAny", values);
      this.parent.clearCurrentField();
      return this.parent;
    }
    containsAll(values) {
      this.parent.appendCondition(this.field, "containsAll", values);
      this.parent.clearCurrentField();
      return this.parent;
    }
    and(field) {
      this.parent.clearCurrentField();
      return this.parent.and(field);
    }
    or() {
      this.parent.clearCurrentField();
      return this.parent.or();
    }
  };
  var QueryBuilder = class _QueryBuilder {
    constructor(db, storeName, transaction) {
      this.clauses = [];
      this.orderDirection = "asc";
      this.pendingConnector = "and";
      this.db = db;
      this.storeName = storeName;
      this.transaction = transaction;
    }
    where(fieldOrBuilder) {
      if (typeof fieldOrBuilder === "function") {
        this.clearCurrentField();
        return this.addNestedGroup(fieldOrBuilder);
      }
      this.currentField = fieldOrBuilder;
      return new FieldQueryBuilder(this, fieldOrBuilder);
    }
    and(fieldOrBuilder) {
      return this.where(fieldOrBuilder);
    }
    or() {
      this.pendingConnector = "or";
      return this;
    }
    addNestedGroup(builder) {
      var _a;
      const nested = new _QueryBuilder(this.db, this.storeName, this.transaction);
      const returned = (_a = builder(nested)) !== null && _a !== void 0 ? _a : nested;
      const clauses = returned instanceof _QueryBuilder ? returned.clauses : nested.clauses;
      this.appendClause({ kind: "group", clauses });
      return this;
    }
    clearCurrentField() {
      this.currentField = void 0;
    }
    appendCondition(field, op, value) {
      this.appendClause({ kind: "condition", field, op, value });
    }
    appendClause(clause) {
      const connector = this.clauses.length === 0 ? null : this.pendingConnector;
      this.clauses.push(Object.assign(Object.assign({}, clause), { connector }));
      this.pendingConnector = "and";
    }
    requireCurrentField(operation) {
      if (!this.currentField) {
        throw new Error(`No field specified for ${operation}`);
      }
      const field = this.currentField;
      this.currentField = void 0;
      return field;
    }
    addCondition(op, value) {
      const field = this.requireCurrentField(op);
      this.appendCondition(field, op, value);
      return this;
    }
    equals(value) {
      return this.addCondition("equals", value);
    }
    gt(value) {
      return this.addCondition("gt", value);
    }
    gte(value) {
      return this.addCondition("gte", value);
    }
    lt(value) {
      return this.addCondition("lt", value);
    }
    lte(value) {
      return this.addCondition("lte", value);
    }
    startsWith(value) {
      return this.addCondition("startsWith", value);
    }
    endsWith(value) {
      return this.addCondition("endsWith", value);
    }
    contains(value) {
      return this.addCondition("contains", value);
    }
    matches(value) {
      return this.addCondition("matches", value);
    }
    between(start, end) {
      return this.addCondition("between", [start, end]);
    }
    notBetween(start, end) {
      return this.addCondition("notBetween", [start, end]);
    }
    ["in"](values) {
      return this.addCondition("in", values);
    }
    notIn(values) {
      return this.addCondition("notIn", values);
    }
    containsAny(values) {
      return this.addCondition("containsAny", values);
    }
    containsAll(values) {
      return this.addCondition("containsAll", values);
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
    groupBy(field) {
      this.groupField = field;
      return this;
    }
    loadCandidates() {
      return __awaiter(this, void 0, void 0, function* () {
        const store = this.transaction ? this.transaction.objectStore(this.storeName) : this.db.transaction(this.storeName, "readonly").objectStore(this.storeName);
        const request = this.createReadRequest(store);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            var _a;
            return resolve((_a = request.result) !== null && _a !== void 0 ? _a : []);
          };
          request.onerror = () => reject(request.error);
        });
      });
    }
    createReadRequest(store) {
      if (!this.indexName) {
        return store.getAll();
      }
      if (!store.indexNames.contains(this.indexName)) {
        throw new Error(`Index '${this.indexName}' does not exist on ${this.storeName}`);
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
      return keyRange ? index.getAll(keyRange) : index.getAll();
    }
    matchesClause(item, clause) {
      if (clause.kind === "group") {
        return this.evaluateClauses(item, clause.clauses);
      }
      const value = item[clause.field];
      switch (clause.op) {
        case "equals":
          return value === clause.value;
        case "gt":
          return value > clause.value;
        case "gte":
          return value >= clause.value;
        case "lt":
          return value < clause.value;
        case "lte":
          return value <= clause.value;
        case "startsWith":
          return typeof value === "string" && value.startsWith(String(clause.value));
        case "endsWith":
          return typeof value === "string" && value.endsWith(String(clause.value));
        case "contains":
          if (typeof value === "string") {
            return value.includes(String(clause.value));
          }
          return Array.isArray(value) && value.includes(clause.value);
        case "matches": {
          const pattern = clause.value instanceof RegExp ? new RegExp(clause.value.source, clause.value.flags) : new RegExp(String(clause.value));
          return typeof value === "string" && pattern.test(value);
        }
        case "between": {
          const [start, end] = clause.value;
          return value >= start && value <= end;
        }
        case "notBetween": {
          const [start, end] = clause.value;
          return value < start || value > end;
        }
        case "in":
          return Array.isArray(clause.value) && clause.value.includes(value);
        case "notIn":
          return Array.isArray(clause.value) && !clause.value.includes(value);
        case "containsAny":
          return Array.isArray(value) && Array.isArray(clause.value) && clause.value.some((entry) => value.includes(entry));
        case "containsAll":
          return Array.isArray(value) && Array.isArray(clause.value) && clause.value.every((entry) => value.includes(entry));
      }
    }
    evaluateClauses(item, clauses) {
      if (!clauses.length) {
        return true;
      }
      let result = this.matchesClause(item, clauses[0]);
      for (let index = 1; index < clauses.length; index += 1) {
        const clause = clauses[index];
        const matches = this.matchesClause(item, clause);
        result = clause.connector === "or" ? result || matches : result && matches;
      }
      return result;
    }
    collectMatches() {
      return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield this.loadCandidates();
        return candidates.filter((item) => this.evaluateClauses(item, this.clauses));
      });
    }
    sortResults(results) {
      if (!this.orderField) {
        return results;
      }
      return [...results].sort((left, right) => {
        const leftValue = left[this.orderField];
        const rightValue = right[this.orderField];
        if (leftValue < rightValue)
          return this.orderDirection === "asc" ? -1 : 1;
        if (leftValue > rightValue)
          return this.orderDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    applyPagination(results) {
      let nextResults = results;
      if (this.offsetCount !== void 0) {
        nextResults = nextResults.slice(this.offsetCount);
      }
      if (this.limitCount !== void 0) {
        nextResults = nextResults.slice(0, this.limitCount);
      }
      return nextResults;
    }
    aggregateValues(field, reducer) {
      return __awaiter(this, void 0, void 0, function* () {
        const results = yield this.collectMatches();
        const values = field ? results.map((item) => item[field]) : results;
        return reducer(values);
      });
    }
    aggregateGroupedCount(field) {
      return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const results = yield this.collectMatches();
        const groups = /* @__PURE__ */ new Map();
        for (const item of results) {
          const key = item[field];
          groups.set(key, ((_a = groups.get(key)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        return Array.from(groups.entries()).sort(([left], [right]) => {
          if (left < right)
            return -1;
          if (left > right)
            return 1;
          return 0;
        }).map(([key, count]) => ({ [field]: key, count }));
      });
    }
    execute() {
      return __awaiter(this, void 0, void 0, function* () {
        const results = yield this.collectMatches();
        return this.applyPagination(this.sortResults(results));
      });
    }
    count() {
      return __awaiter(this, void 0, void 0, function* () {
        if (this.groupField) {
          return this.aggregateGroupedCount(this.groupField);
        }
        const results = yield this.collectMatches();
        return results.length;
      });
    }
    sum(field) {
      return __awaiter(this, void 0, void 0, function* () {
        const total = yield this.aggregateValues(field, (values) => values.reduce((accumulator, value) => accumulator + (Number(value) || 0), 0));
        return total;
      });
    }
    avg(field) {
      return __awaiter(this, void 0, void 0, function* () {
        const values = yield this.aggregateValues(field, (items) => items);
        if (!values.length) {
          return 0;
        }
        const total = values.reduce((accumulator, value) => accumulator + (Number(value) || 0), 0);
        return total / values.length;
      });
    }
    min(field) {
      return __awaiter(this, void 0, void 0, function* () {
        const values = yield this.aggregateValues(field, (items) => items);
        if (!values.length) {
          return null;
        }
        return values.reduce((currentMin, value) => value < currentMin ? value : currentMin);
      });
    }
    max(field) {
      return __awaiter(this, void 0, void 0, function* () {
        const values = yield this.aggregateValues(field, (items) => items);
        if (!values.length) {
          return null;
        }
        return values.reduce((currentMax, value) => value > currentMax ? value : currentMax);
      });
    }
  };
  var INTERNAL_CREATED_AT_FIELD = "__idb_createdAt";
  var INTERNAL_UPDATED_AT_FIELD = "__idb_updatedAt";
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
  function CompositeKeyPath(fields, options) {
    return (target) => {
      const metadata = {
        fields,
        options
      };
      Reflect.defineMetadata("keypath", metadata, target);
    };
  }
  function Index(options) {
    return (target, propertyKey) => {
      const constructor = target.constructor;
      const existing = Reflect.getMetadata("indexes", constructor) || [];
      const nextIndexes = [
        ...existing,
        { field: propertyKey, options }
      ];
      Reflect.defineMetadata("indexes", nextIndexes, constructor);
    };
  }
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
  var Database = class _Database {
    constructor(dbName, classes, printEnabled = false) {
      this.db = null;
      this.entityRepositories = /* @__PURE__ */ new Map();
      this.retentionTimer = null;
      this.retentionCleanupRunning = false;
      this.printDebug = (...data) => {
        if (!this.printEnabled)
          return;
        console.debug("[idb-ts]:DEBUG:", ...data);
      };
      this.printError = (...error) => {
        if (!this.printEnabled)
          return;
        console.error("[idb-ts]:ERROR:", ...error);
      };
      this.dbName = dbName;
      this.printEnabled = printEnabled;
      if (!classes.every((cls) => Reflect.getMetadata("dataclass", cls))) {
        throw new Error("All classes should be decorated with @DataClass.");
      }
      this.classes = classes;
      this.dbVersion = this.calculateDatabaseVersion();
      this.retentionPolicies = this.classes.map((cls) => {
        const policy = Reflect.getMetadata("retention_policy", cls);
        if (!(policy === null || policy === void 0 ? void 0 : policy.enabled)) {
          return null;
        }
        return {
          className: cls.name,
          storeName: cls.name.toLowerCase(),
          policy
        };
      }).filter((policy) => policy !== null);
    }
    calculateDatabaseVersion() {
      const versions = this.classes.map((cls) => Reflect.getMetadata("version", cls) || 1);
      return Math.max(...versions);
    }
    static build(dbName, classes) {
      return __awaiter(this, void 0, void 0, function* () {
        const instance = new _Database(dbName, classes);
        yield instance.initDB();
        instance.generateEntityRepositories();
        return instance;
      });
    }
    initDB() {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, this.dbVersion);
          request.onupgradeneeded = (event) => {
            const db = request.result;
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion || this.dbVersion;
            this.printDebug(`Database upgrade from version ${oldVersion} to ${newVersion}`);
            this.classes.forEach((cls) => {
              var _a;
              const keyPathMetadata = Reflect.getMetadata("keypath", cls);
              const indexFields = Reflect.getMetadata("indexes", cls) || [];
              const classVersion = Reflect.getMetadata("version", cls) || 1;
              const storeName = cls.name.toLowerCase();
              if (classVersion > oldVersion) {
                if (!db.objectStoreNames.contains(storeName)) {
                  this.printDebug(`Creating object store: ${storeName} (version ${classVersion})`);
                  const storeOptions = {};
                  if (keyPathMetadata) {
                    storeOptions.keyPath = keyPathMetadata.fields;
                    if ((_a = keyPathMetadata.options) === null || _a === void 0 ? void 0 : _a.autoIncrement) {
                      storeOptions.autoIncrement = true;
                    }
                  }
                  const store = db.createObjectStore(storeName, storeOptions);
                  indexFields.forEach((indexField) => {
                    var _a2;
                    const indexName = typeof indexField === "string" ? indexField : indexField.field;
                    const indexOptions = typeof indexField === "string" ? { unique: false } : (_a2 = indexField.options) !== null && _a2 !== void 0 ? _a2 : { unique: false };
                    if (!store.indexNames.contains(indexName)) {
                      store.createIndex(indexName, indexName, indexOptions);
                    }
                  });
                } else {
                  this.printDebug(`Updating object store: ${storeName} (version ${classVersion})`);
                  const transaction = request.transaction;
                  if (transaction) {
                    const store = transaction.objectStore(storeName);
                    indexFields.forEach((indexField) => {
                      var _a2;
                      const indexName = typeof indexField === "string" ? indexField : indexField.field;
                      const indexOptions = typeof indexField === "string" ? { unique: false } : (_a2 = indexField.options) !== null && _a2 !== void 0 ? _a2 : { unique: false };
                      if (!store.indexNames.contains(indexName)) {
                        this.printDebug(`Adding index: ${indexName} to ${storeName}`);
                        store.createIndex(indexName, indexName, indexOptions);
                      }
                    });
                  }
                }
              }
            });
          };
          request.onsuccess = () => {
            this.db = request.result;
            this.printDebug(`Database initialized (version ${this.dbVersion}) with object stores for: ${this.classes.map((cls) => `${cls.name}(v${Reflect.getMetadata("version", cls) || 1})`).join(", ")}`);
            this.startRetentionCleanup();
            resolve();
          };
          request.onerror = () => {
            this.printError("Error initializing database:", request.error);
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
    calculateRetentionCleanupIntervalMs() {
      if (!this.retentionPolicies.length) {
        return void 0;
      }
      const gcd = (left, right) => {
        let a = left;
        let b = right;
        while (b !== 0) {
          const remainder = a % b;
          a = b;
          b = remainder;
        }
        return Math.abs(a);
      };
      const seconds = this.retentionPolicies.map(({ policy }) => policy.seconds);
      return seconds.reduce((accumulator, value) => gcd(accumulator, value)) * 1e3;
    }
    startRetentionCleanup() {
      const cleanupIntervalMs = this.calculateRetentionCleanupIntervalMs();
      if (!cleanupIntervalMs || !this.db || this.retentionTimer) {
        return;
      }
      this.printDebug(`Retention cleanup enabled for ${this.retentionPolicies.length} entities every ${cleanupIntervalMs}ms`);
      void this.runRetentionCleanup();
      this.retentionTimer = setInterval(() => {
        void this.runRetentionCleanup();
      }, cleanupIntervalMs);
    }
    runRetentionCleanup() {
      return __awaiter(this, void 0, void 0, function* () {
        if (!this.db || this.retentionCleanupRunning || !this.retentionPolicies.length) {
          return;
        }
        this.retentionCleanupRunning = true;
        try {
          this.printDebug("Retention cleanup tick started");
          for (const { storeName, className, policy } of this.retentionPolicies) {
            yield this.cleanupExpiredRecords(storeName, className, policy);
          }
          this.printDebug("Retention cleanup tick finished");
        } finally {
          this.retentionCleanupRunning = false;
        }
      });
    }
    cleanupExpiredRecords(storeName, className, policy) {
      if (!this.db) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(storeName, "readwrite");
          const store = transaction.objectStore(storeName);
          const cutoff = Date.now() - policy.seconds * 1e3;
          const request = store.openCursor();
          request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) {
              return;
            }
            const value = cursor.value;
            const timestamp = value === null || value === void 0 ? void 0 : value[policy.field];
            this.printDebug(`Retention cleanup inspecting ${className}.${policy.field}:`, timestamp, "cutoff:", cutoff);
            if (typeof timestamp === "number" && timestamp <= cutoff) {
              const deleteRequest = cursor.delete();
              deleteRequest.onsuccess = () => {
                this.printDebug(`Retention cleanup removed expired record from ${className}`);
                cursor.continue();
              };
              deleteRequest.onerror = () => {
                var _a;
                return reject((_a = deleteRequest.error) !== null && _a !== void 0 ? _a : new Error(`Retention cleanup delete failed for ${className}`));
              };
              return;
            }
            cursor.continue();
          };
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => {
            var _a;
            return reject((_a = transaction.error) !== null && _a !== void 0 ? _a : new Error(`Retention cleanup failed for ${className}`));
          };
          transaction.onabort = () => {
            var _a;
            return reject((_a = transaction.error) !== null && _a !== void 0 ? _a : new Error(`Retention cleanup aborted for ${className}`));
          };
        } catch (error) {
          reject(error);
        }
      });
    }
    createEntityRepository(cls, transaction) {
      const self2 = this;
      const creationTimestampField = INTERNAL_CREATED_AT_FIELD;
      const updateTimestampField = INTERNAL_UPDATED_AT_FIELD;
      const validators = Reflect.getMetadata("validators", cls) || [];
      const validateItem = (item) => {
        const failures = [];
        validators.forEach((rule) => {
          const value = item[rule.field];
          let valid = false;
          try {
            valid = rule.predicate(value, item);
          } catch (_a) {
            valid = false;
          }
          if (!valid) {
            failures.push(`${rule.field}: ${rule.message}`);
          }
        });
        if (failures.length) {
          throw new Error(`Validation failed for ${cls.name}: ${failures.join("; ")}`);
        }
      };
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
      const applyTimestampFields = (item, existingItem) => {
        const now = Date.now();
        const existingCreationValue = existingItem ? existingItem[creationTimestampField] : void 0;
        item[creationTimestampField] = existingCreationValue !== void 0 ? existingCreationValue : now;
        item[updateTimestampField] = now;
      };
      const readExistingItem = (store, key) => {
        return new Promise((resolve, reject) => {
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      };
      const createStoredItem = (store, item) => {
        return new Promise((resolve, reject) => {
          const request = store.add(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      };
      const updateStoredItem = (store, item) => __awaiter(this, void 0, void 0, function* () {
        const key = extractKey(item);
        let existingItem;
        if (key !== void 0 && key !== null) {
          existingItem = yield readExistingItem(store, key);
        }
        applyTimestampFields(item, existingItem);
        yield new Promise((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
      const deleteStoredItem = (store, key) => {
        return new Promise((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
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
          return new QueryBuilder(self2.db, storeName, transaction);
        },
        create: (item) => __awaiter(this, void 0, void 0, function* () {
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
          validateItem(item);
          applyTimestampFields(item);
          return this.performOperation(cls.name, "readwrite", (store) => {
            return createStoredItem(store, item).then(() => {
              this.printDebug(`Item added to ${cls.name}:`, item);
            });
          }, transaction);
        }),
        createMany: (items) => __awaiter(this, void 0, void 0, function* () {
          const repository = this.createEntityRepository(cls, transaction);
          for (const item of items) {
            yield repository.create(item);
          }
        }),
        read: (key) => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            const request = store.get(key);
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Item read from ${cls.name}:`, request.result);
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        update: (item) => __awaiter(this, void 0, void 0, function* () {
          validateItem(item);
          return this.performOperation(cls.name, "readwrite", (store) => {
            return updateStoredItem(store, item).then(() => {
              this.printDebug(`Item updated in ${cls.name}:`, item);
            });
          }, transaction);
        }),
        updateMany: (items) => __awaiter(this, void 0, void 0, function* () {
          const repository = this.createEntityRepository(cls, transaction);
          for (const item of items) {
            yield repository.update(item);
          }
        }),
        delete: (key) => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readwrite", (store) => {
            return deleteStoredItem(store, key).then(() => {
              this.printDebug(`Item deleted from ${cls.name}:`, key);
            });
          }, transaction);
        }),
        deleteMany: (keys) => __awaiter(this, void 0, void 0, function* () {
          const repository = this.createEntityRepository(cls, transaction);
          for (const key of keys) {
            yield repository.delete(key);
          }
        }),
        deleteWhere: (predicate) => __awaiter(this, void 0, void 0, function* () {
          var _a;
          const repository = this.createEntityRepository(cls, transaction);
          const query = repository.query();
          const resolvedQuery = (_a = predicate(query)) !== null && _a !== void 0 ? _a : query;
          const matches = yield resolvedQuery.execute();
          const keys = matches.map((item) => extractKey(item)).filter((key) => key !== void 0 && key !== null);
          yield repository.deleteMany(keys);
        }),
        list: () => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            const request = store.getAll();
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`All items from ${cls.name}:`, request.result);
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        listPaginated: (page, pageSize) => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            const request = store.getAll();
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                const items = request.result;
                const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
                this.printDebug(`Paginated items from ${cls.name}:`, paginatedItems);
                resolve(paginatedItems);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        findByIndex: (indexName, value) => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            if (!store.indexNames.contains(indexName)) {
              throw new Error(`Index '${indexName}' does not exist on ${cls.name}`);
            }
            const index = store.index(indexName);
            const request = index.getAll(value);
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Items found by index ${indexName} with value ${value}:`, request.result);
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        findOneByIndex: (indexName, value) => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            if (!store.indexNames.contains(indexName)) {
              throw new Error(`Index '${indexName}' does not exist on ${cls.name}`);
            }
            const index = store.index(indexName);
            const request = index.get(value);
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Item found by index ${indexName} with value ${value}:`, request.result);
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        count: () => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            const request = store.count();
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Count for ${cls.name}:`, request.result);
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        exists: (key) => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readonly", (store) => {
            const request = store.count(key);
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                const exists = request.result > 0;
                this.printDebug(`Exists check for ${cls.name} with key ${key}:`, exists);
                resolve(exists);
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        }),
        clear: () => __awaiter(this, void 0, void 0, function* () {
          return this.performOperation(cls.name, "readwrite", (store) => {
            const request = store.clear();
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Cleared all items from ${cls.name}`);
                resolve();
              };
              request.onerror = () => reject(request.error);
            });
          }, transaction);
        })
      };
    }
    performOperation(className, mode, operation, transaction) {
      return __awaiter(this, void 0, void 0, function* () {
        if (!this.db && !transaction) {
          throw new Error("Database not initialized.");
        }
        const storeName = className.toLowerCase();
        const activeTransaction = transaction !== null && transaction !== void 0 ? transaction : this.db.transaction(storeName, mode);
        const store = activeTransaction.objectStore(storeName);
        return operation(store);
      });
    }
    createTransactionHandle(entityNames, mode) {
      if (!this.db) {
        throw new Error("Database not initialized.");
      }
      const uniqueEntityNames = [...new Set(entityNames)];
      const storeNames = uniqueEntityNames.map((entityName) => {
        const entityClass = this.classes.find((cls) => cls.name === entityName);
        if (!entityClass) {
          throw new Error(`Entity '${entityName}' is not registered in ${this.dbName}.`);
        }
        return entityClass.name.toLowerCase();
      });
      const nativeTransaction = this.db.transaction(storeNames, mode);
      let rollbackRequested = false;
      const completion = new Promise((resolve, reject) => {
        nativeTransaction.oncomplete = () => resolve();
        nativeTransaction.onabort = () => {
          var _a;
          if (rollbackRequested) {
            resolve();
            return;
          }
          reject((_a = nativeTransaction.error) !== null && _a !== void 0 ? _a : new Error("Transaction aborted."));
        };
        nativeTransaction.onerror = () => {
          var _a;
          if (rollbackRequested) {
            resolve();
            return;
          }
          reject((_a = nativeTransaction.error) !== null && _a !== void 0 ? _a : new Error("Transaction failed."));
        };
      });
      const handle = {};
      uniqueEntityNames.forEach((entityName) => {
        const entityClass = this.classes.find((cls) => cls.name === entityName);
        if (entityClass) {
          handle[entityName] = this.createEntityRepository(entityClass, nativeTransaction);
        }
      });
      handle.commit = () => __awaiter(this, void 0, void 0, function* () {
        if (typeof nativeTransaction.commit === "function") {
          nativeTransaction.commit();
        }
        yield completion;
      });
      handle.rollback = () => __awaiter(this, void 0, void 0, function* () {
        rollbackRequested = true;
        try {
          nativeTransaction.abort();
        } catch (_a) {
        }
        yield completion.catch(() => void 0);
      });
      return handle;
    }
    beginTransaction(entityNames_1) {
      return __awaiter(this, arguments, void 0, function* (entityNames, mode = "readwrite") {
        return this.createTransactionHandle(entityNames, mode);
      });
    }
    transaction(callback) {
      return __awaiter(this, void 0, void 0, function* () {
        const tx = this.createTransactionHandle(this.classes.map((cls) => cls.name), "readwrite");
        try {
          const result = yield callback(tx);
          yield tx.commit();
          return result;
        } catch (error) {
          yield tx.rollback();
          throw error;
        }
      });
    }
    close() {
      if (this.retentionTimer) {
        clearInterval(this.retentionTimer);
        this.retentionTimer = null;
      }
      if (this.db) {
        this.db.close();
        this.db = null;
      }
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
    KeyPath({ autoIncrement: true })
  ], User.prototype, "id", 2);
  __decorateClass([
    Index({ unique: true })
  ], User.prototype, "email", 2);
  __decorateClass([
    Index()
  ], User.prototype, "age", 2);
  User = __decorateClass([
    DataClass({ version: 1 })
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
    KeyPath({ generator: KeyGenerators.uuid })
  ], Post.prototype, "uuid", 2);
  __decorateClass([
    Index()
  ], Post.prototype, "authorEmail", 2);
  __decorateClass([
    Index()
  ], Post.prototype, "category", 2);
  Post = __decorateClass([
    DataClass({ version: 2 })
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
    Index()
  ], UserProject.prototype, "role", 2);
  UserProject = __decorateClass([
    DataClass({ version: 1 }),
    CompositeKeyPath(["userId", "projectId"])
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
    KeyPath({
      generator: (item) => `${item.type}_${item.userId}_${Date.now()}`
    })
  ], Activity.prototype, "activityId", 2);
  __decorateClass([
    Index()
  ], Activity.prototype, "userId", 2);
  __decorateClass([
    Index()
  ], Activity.prototype, "type", 2);
  __decorateClass([
    Index()
  ], Activity.prototype, "timestamp", 2);
  Activity = __decorateClass([
    DataClass({ version: 1 })
  ], Activity);
  var databaseName = "idb-playground-v1";
  var seedData = {
    users: [
      new User(
        "Alice Johnson",
        "alice@example.com",
        28,
        "123 Main St",
        "+1234567890"
      ),
      new User("Bob Smith", "bob@example.com", 32, "456 Oak Ave"),
      new User("Charlie Brown", "charlie@example.com", 25, "789 Pine Rd")
    ],
    posts: [
      new Post(
        "Getting Started with idb-ts",
        "This is a comprehensive guide to using idb-ts in the browser.",
        "alice@example.com",
        "tutorial"
      ),
      new Post(
        "Advanced Database Patterns",
        "A quick tour of more advanced IndexedDB query patterns.",
        "bob@example.com",
        "advanced"
      )
    ],
    projects: [
      new UserProject("alice@example.com", "project-alpha", "admin"),
      new UserProject("bob@example.com", "project-alpha", "member"),
      new UserProject("alice@example.com", "project-beta", "admin")
    ]
  };
  seedData.posts[0].tags = ["typescript", "indexeddb", "tutorial"];
  seedData.posts[1].tags = ["database", "patterns", "advanced"];
  seedData.projects[0].permissions = ["read", "write", "delete", "manage"];
  seedData.projects[1].permissions = ["read", "write"];
  seedData.projects[2].permissions = ["read", "write", "delete", "manage"];
  var appRoot = document.createElement("div");
  function setDocumentTitle() {
    document.title = "idb-ts live playground";
  }
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
    :root {
      color-scheme: dark;
      --bg: #07111f;
      --panel: rgba(16, 25, 44, 0.88);
      --border: rgba(127, 164, 255, 0.16);
      --border-strong: rgba(118, 209, 255, 0.22);
      --text: #eef4ff;
      --muted: #9eb1d0;
      --accent: #6ee7ff;
      --accent-2: #9f7bff;
      --success: #69f0ae;
      --warning: #ffd166;
      --error: #ff7676;
      --shadow: 0 26px 80px rgba(0, 0, 0, 0.38);
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at 20% 20%, rgba(110, 231, 255, 0.18), transparent 30%),
        radial-gradient(circle at 80% 0%, rgba(159, 123, 255, 0.2), transparent 28%),
        linear-gradient(180deg, #06101d 0%, #081423 100%);
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
      background-size: 36px 36px;
      mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
      pointer-events: none;
    }

    button,
    textarea,
    select {
      font: inherit;
    }

    button {
      border: 0;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #05111d;
      padding: 0.85rem 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 120ms ease, filter 120ms ease, opacity 120ms ease;
      box-shadow: 0 12px 30px rgba(110, 231, 255, 0.15);
    }

    button:hover {
      transform: translateY(-1px);
      filter: brightness(1.05);
    }

    button:disabled {
      opacity: 0.56;
      cursor: not-allowed;
      transform: none;
    }

    .shell {
      position: relative;
      max-width: 1480px;
      margin: 0 auto;
      padding: 24px;
    }

    .hero {
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
      align-items: stretch;
      margin-bottom: 18px;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }

    .hero-copy {
      padding: 26px;
      overflow: hidden;
      position: relative;
    }

    .hero-copy::after {
      content: '';
      position: absolute;
      inset: auto -12% -40% auto;
      width: 260px;
      height: 260px;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(110, 231, 255, 0.22), transparent 70%);
      pointer-events: none;
    }

    .eyebrow {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      padding: 0.4rem 0.75rem;
      border: 1px solid rgba(110, 231, 255, 0.18);
      border-radius: 999px;
      color: var(--accent);
      background: rgba(110, 231, 255, 0.06);
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 14px 0 10px;
      font-size: clamp(2.15rem, 4vw, 4rem);
      line-height: 0.95;
      letter-spacing: -0.05em;
    }

    .lede {
      max-width: 72ch;
      margin: 0;
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.65;
    }

    .hero-meta {
      padding: 20px;
      display: grid;
      gap: 14px;
      align-content: start;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .stat {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.02);
    }

    .stat-label {
      display: block;
      color: var(--muted);
      font-size: 0.8rem;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .stat-value {
      font-size: 1.15rem;
      font-weight: 700;
      word-break: break-word;
    }

    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
      gap: 18px;
      align-items: start;
    }

    .editor,
    .terminal {
      padding: 18px;
    }

    .editor-header,
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .panel-title {
      margin: 0;
      font-size: 0.92rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-top: 14px;
    }

    .toolbar .ghost {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .editor-area {
      width: 100%;
      min-height: 390px;
      resize: vertical;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: rgba(3, 8, 18, 0.58);
      color: #f4f8ff;
      padding: 16px;
      line-height: 1.55;
      tab-size: 2;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .editor-area:focus {
      border-color: var(--border-strong);
      box-shadow: 0 0 0 4px rgba(110, 231, 255, 0.08);
    }

    .hint {
      margin: 12px 0 0;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .snippets {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 14px;
    }

    .snippet {
      text-align: left;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .snippet span {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 500;
    }

    .terminal {
      display: grid;
      gap: 14px;
    }

    .terminal-body {
      display: grid;
      gap: 10px;
      min-height: 390px;
      max-height: 680px;
      overflow: auto;
      padding-right: 4px;
    }

    .entry {
      border: 1px solid var(--border);
      background: rgba(2, 7, 17, 0.58);
      border-radius: 18px;
      padding: 14px;
    }

    .entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      color: var(--muted);
      font-size: 0.84rem;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .pill.info { background: rgba(110, 231, 255, 0.12); color: var(--accent); }
    .pill.success { background: rgba(105, 240, 174, 0.12); color: var(--success); }
    .pill.warn { background: rgba(255, 209, 102, 0.12); color: var(--warning); }
    .pill.error { background: rgba(255, 118, 118, 0.12); color: var(--error); }

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      color: #eef4ff;
      line-height: 1.55;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.9rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      overflow: hidden;
      border-radius: 14px;
    }

    .table th,
    .table td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.88rem;
      vertical-align: top;
    }

    .table th {
      color: var(--muted);
      font-weight: 600;
      background: rgba(255, 255, 255, 0.03);
    }

    .table tr:last-child td {
      border-bottom: 0;
    }

    .dataset-card {
      border-radius: 18px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.03);
      padding: 14px;
    }

    .dataset-card h3 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .dataset-card p {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--warning);
      box-shadow: 0 0 0 5px rgba(255, 209, 102, 0.12);
    }

    .status-dot.ready {
      background: var(--success);
      box-shadow: 0 0 0 5px rgba(105, 240, 174, 0.12);
    }

    .small {
      color: var(--muted);
      font-size: 0.86rem;
    }

    @media (max-width: 1100px) {
      .hero,
      .workspace {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .shell {
        padding: 14px;
      }

      .stat-grid,
      .snippets {
        grid-template-columns: 1fr;
      }

      .editor-area {
        min-height: 320px;
      }
    }
  `;
    document.head.appendChild(style);
  }
  function formatTimestamp() {
    return (/* @__PURE__ */ new Date()).toLocaleTimeString();
  }
  function escapeHtml(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function safeStringify(value) {
    const seen = /* @__PURE__ */ new WeakSet();
    return JSON.stringify(
      value,
      (_key, currentValue) => {
        if (currentValue instanceof Date) {
          return currentValue.toISOString();
        }
        if (typeof currentValue === "bigint") {
          return currentValue.toString();
        }
        if (currentValue instanceof Map) {
          return Object.fromEntries(currentValue.entries());
        }
        if (currentValue instanceof Set) {
          return Array.from(currentValue.values());
        }
        if (typeof currentValue === "object" && currentValue !== null) {
          if (seen.has(currentValue)) {
            return "[Circular]";
          }
          seen.add(currentValue);
        }
        return currentValue;
      },
      2
    ) ?? "null";
  }
  function formatValue(value) {
    if (typeof value === "string") {
      return value;
    }
    return safeStringify(value);
  }
  function renderTable(rows) {
    if (!rows.length) {
      return '<div class="small">No rows returned.</div>';
    }
    const columns = Array.from(
      rows.reduce((keys, row) => {
        Object.keys(row).forEach((key) => keys.add(key));
        return keys;
      }, /* @__PURE__ */ new Set())
    );
    const head = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const body = rows.map((row) => {
      const cells = columns.map((column) => `<td>${escapeHtml(formatValue(row[column]))}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }
  function renderValue(value) {
    if (Array.isArray(value) && value.every(
      (item) => item && typeof item === "object" && !Array.isArray(item)
    )) {
      return renderTable(value);
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return `<pre>${escapeHtml(formatValue(value))}</pre>`;
    }
    return `<pre>${escapeHtml(formatValue(value))}</pre>`;
  }
  function logMessage(output, kind, label, value) {
    const entry = document.createElement("section");
    entry.className = "entry";
    entry.innerHTML = `
    <div class="entry-head">
      <span>${escapeHtml(formatTimestamp())}</span>
      <span class="pill ${kind}">${escapeHtml(label)}</span>
    </div>
    <div>${renderValue(value)}</div>
  `;
    output.prepend(entry);
  }
  function logText(output, kind, label, text) {
    const entry = document.createElement("section");
    entry.className = "entry";
    entry.innerHTML = `
    <div class="entry-head">
      <span>${escapeHtml(formatTimestamp())}</span>
      <span class="pill ${kind}">${escapeHtml(label)}</span>
    </div>
    <pre>${escapeHtml(text)}</pre>
  `;
    output.prepend(entry);
  }
  function updateStats(stats, database) {
    if (!database) {
      stats.innerHTML = `
      <div class="stat"><span class="stat-label">Database</span><span class="stat-value">not ready</span></div>
      <div class="stat"><span class="stat-label">Entities</span><span class="stat-value">0</span></div>
      <div class="stat"><span class="stat-label">Version</span><span class="stat-value">-</span></div>
      <div class="stat"><span class="stat-label">Mode</span><span class="stat-value">IndexedDB only</span></div>
    `;
      return;
    }
    stats.innerHTML = `
    <div class="stat"><span class="stat-label">Database</span><span class="stat-value">${escapeHtml(databaseName)}</span></div>
    <div class="stat"><span class="stat-label">Entities</span><span class="stat-value">${database.getAvailableEntities().length}</span></div>
    <div class="stat"><span class="stat-label">Version</span><span class="stat-value">${database.getDatabaseVersion()}</span></div>
    <div class="stat"><span class="stat-label">Mode</span><span class="stat-value">browser IndexedDB</span></div>
  `;
  }
  async function clearDatabase() {
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  }
  async function createDatabase() {
    return Database.build(databaseName, [User, Post, UserProject, Activity]);
  }
  async function seedDatabase(database) {
    const existingUsers = await database.User.list();
    if (existingUsers.length > 0) {
      return;
    }
    for (const user of seedData.users) {
      await database.User.create(user);
    }
    for (const post of seedData.posts) {
      await database.Post.create(post);
    }
    for (const project of seedData.projects) {
      await database.UserProject.create(project);
    }
    const activityEntries = [
      new Activity("alice@example.com", "login", {
        ip: "192.168.1.100",
        browser: "Chrome"
      }),
      new Activity("alice@example.com", "post_created", {
        title: seedData.posts[0].title,
        category: seedData.posts[0].category
      }),
      new Activity("bob@example.com", "post_liked", {
        title: seedData.posts[0].title,
        likedBy: "bob@example.com"
      })
    ];
    for (const activity of activityEntries) {
      await database.Activity.create(activity);
    }
  }
  function createShellHelpers(output) {
    return {
      log: (...parts) => {
        logText(
          output,
          "info",
          "log",
          parts.map((part) => formatValue(part)).join(" ")
        );
      },
      inspect: (value) => logMessage(output, "info", "result", value),
      clear: () => {
        output.innerHTML = "";
      }
    };
  }
  async function executeSnippet(database, source, output) {
    const helpers = createShellHelpers(output);
    const runner = new Function(
      "db",
      "User",
      "Post",
      "UserProject",
      "Activity",
      "helpers",
      `return (async () => {
      const { log, inspect, clear } = helpers;
      ${source}
    })();`
    );
    return runner(database, User, Post, UserProject, Activity, helpers);
  }
  function buildUi() {
    appRoot.className = "shell";
    appRoot.innerHTML = `
    <section class="hero">
      <article class="panel hero-copy">
        <span class="eyebrow">browser-only interactive playground</span>
        <h1>idb-ts live editor and shell.</h1>
        <p class="lede">
          Run real IndexedDB-backed queries in the browser, inspect structured output in the UI,
          and treat the page like a lightweight shell for the data model.
        </p>
        <div class="toolbar">
          <button class="primary" id="run-btn">Run query</button>
          <button class="ghost" id="load-btn">Load sample query</button>
          <button class="ghost" id="reset-btn">Reset database</button>
        </div>
        <p class="hint">
          Snippets execute inside an async sandbox with <code>db</code>, <code>User</code>, <code>Post</code>,
          <code>UserProject</code>, <code>Activity</code>, plus <code>log()</code> and <code>inspect()</code> helpers.
        </p>
      </article>
      <aside class="panel hero-meta">
        <div class="panel-header">
          <h2 class="panel-title">runtime status</h2>
          <span class="status-dot" id="status-dot"></span>
        </div>
        <div class="stat-grid" id="stats"></div>
        <div class="dataset-card">
          <h3 id="status-text">starting up</h3>
          <p>
            The app will build the database, seed sample records once, and then keep everything
            local to IndexedDB in this browser.
          </p>
        </div>
        <div class="dataset-card">
          <h3>available entities</h3>
          <p id="entity-list">Loading...</p>
        </div>
      </aside>
    </section>

    <section class="workspace">
      <article class="panel editor">
        <div class="editor-header">
          <h2 class="panel-title">editor</h2>
          <span class="small">Ctrl/Cmd + Enter to run</span>
        </div>
        <textarea id="editor" class="editor-area" spellcheck="false"></textarea>
        <div class="snippets">
          <button class="snippet" data-snippet="users">
            List users
            <span>return await db.User.list()</span>
          </button>
          <button class="snippet" data-snippet="query">
            Filter active users
            <span>query with sorting and paging</span>
          </button>
          <button class="snippet" data-snippet="index">
            Look up by index
            <span>find a user by email</span>
          </button>
          <button class="snippet" data-snippet="update">
            Mutate a record
            <span>fetch, edit, and update a project</span>
          </button>
        </div>
      </article>

      <article class="panel terminal">
        <div class="panel-header">
          <h2 class="panel-title">output</h2>
          <span class="small">latest entry appears first</span>
        </div>
        <div class="terminal-body" id="output"></div>
      </article>
    </section>
  `;
    document.body.replaceChildren(appRoot);
    return {
      editor: appRoot.querySelector("#editor"),
      output: appRoot.querySelector("#output"),
      stats: appRoot.querySelector("#stats"),
      statusDot: appRoot.querySelector("#status-dot"),
      statusText: appRoot.querySelector("#status-text"),
      entityList: appRoot.querySelector("#entity-list"),
      runButton: appRoot.querySelector("#run-btn"),
      resetButton: appRoot.querySelector("#reset-btn"),
      loadButton: appRoot.querySelector("#load-btn")
    };
  }
  function sampleSnippets() {
    return {
      users: `const users = await db.User.list();
inspect(users);
return users;`,
      query: `const activeUsers = await db.User.query()
  .where('status')
  .equals('active')
  .and('age')
  .gt(25)
  .orderBy('age', 'asc')
  .execute();

log('active users older than 25:', activeUsers.length);
return activeUsers;`,
      index: `const user = await db.User.findOneByIndex('email', 'alice@example.com');
if (!user) throw new Error('User not found');
return user;`,
      update: `const project = await db.UserProject.read(['alice@example.com', 'project-alpha']);
if (!project) throw new Error('Project relationship not found');
project.permissions.push('deploy');
await db.UserProject.update(project);
return project;`,
      starter: `const users = await db.User.list();
log('users in the database', users.length);

const tutorialPosts = await db.Post.query()
  .where('category')
  .equals('tutorial')
  .execute();

return {
  summary: 'run your own snippet here',
  firstUser: users[0],
  tutorialPosts,
};`
    };
  }
  async function main() {
    setDocumentTitle();
    injectStyles();
    const ui = buildUi();
    ui.editor.value = sampleSnippets().starter;
    let database = null;
    const setReadyState = (ready, message) => {
      ui.statusDot.classList.toggle("ready", ready);
      ui.statusText.textContent = message;
      ui.runButton.disabled = !ready;
      ui.resetButton.disabled = !ready;
      ui.loadButton.disabled = !ready;
      updateStats(ui.stats, database);
      ui.entityList.textContent = database ? database.getAvailableEntities().join(", ") : "Loading...";
    };
    setReadyState(false, "building database");
    logText(ui.output, "info", "boot", "starting playground bootstrap");
    try {
      await clearDatabase();
      database = await createDatabase();
      await seedDatabase(database);
      setReadyState(true, "ready to query");
      logMessage(ui.output, "success", "ready", {
        database: databaseName,
        version: database.getDatabaseVersion(),
        entities: database.getAvailableEntities()
      });
      logMessage(ui.output, "info", "seeded data", {
        users: await database.User.list(),
        posts: await database.Post.list(),
        userProjects: await database.UserProject.list()
      });
    } catch (error) {
      setReadyState(false, "failed to initialize");
      logMessage(ui.output, "error", "init failed", error);
      throw error;
    }
    const runCurrentSnippet = async () => {
      if (!database) {
        return;
      }
      const source = ui.editor.value.trim();
      if (!source) {
        logText(ui.output, "warn", "empty", "write a snippet before running it");
        return;
      }
      ui.runButton.disabled = true;
      logText(ui.output, "info", "query", source);
      try {
        const result = await executeSnippet(database, source, ui.output);
        if (typeof result !== "undefined") {
          logMessage(ui.output, "success", "result", result);
        } else {
          logText(
            ui.output,
            "success",
            "done",
            "snippet completed without an explicit return value"
          );
        }
      } catch (error) {
        logMessage(ui.output, "error", "runtime error", error);
      } finally {
        ui.runButton.disabled = false;
      }
    };
    ui.runButton.addEventListener("click", () => {
      void runCurrentSnippet();
    });
    ui.loadButton.addEventListener("click", () => {
      ui.editor.value = sampleSnippets().starter;
      ui.editor.focus();
    });
    ui.resetButton.addEventListener("click", async () => {
      ui.resetButton.disabled = true;
      ui.runButton.disabled = true;
      setReadyState(false, "resetting database");
      logText(
        ui.output,
        "warn",
        "reset",
        "dropping database and rebuilding seed data"
      );
      try {
        await clearDatabase();
        database = await createDatabase();
        await seedDatabase(database);
        setReadyState(true, "ready to query");
        logMessage(ui.output, "success", "reset complete", {
          database: databaseName,
          entities: database.getAvailableEntities()
        });
      } catch (error) {
        logMessage(ui.output, "error", "reset failed", error);
      } finally {
        ui.resetButton.disabled = false;
        ui.runButton.disabled = !database;
      }
    });
    appRoot.querySelectorAll("[data-snippet]").forEach((button) => {
      button.addEventListener("click", () => {
        const snippetName = button.dataset.snippet;
        const snippets = sampleSnippets();
        ui.editor.value = snippets[snippetName] ?? snippets.starter;
        ui.editor.focus();
      });
    });
    ui.editor.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void runCurrentSnippet();
      }
    });
  }
  void main().catch((error) => {
    console.error(error);
    document.body.innerHTML = `<pre style="color:#ff7676;padding:24px;font-family:monospace;white-space:pre-wrap;">${escapeHtml(
      formatValue(error)
    )}</pre>`;
  });
})();
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
