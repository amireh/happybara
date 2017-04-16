export default function exportReadOnlyProperties(baseKlass, properties) {
  const withProperties = class extends baseKlass {};

  Object.keys(properties).forEach(key => {
    Object.defineProperty(withProperties.prototype, key, {
      enumerable: false,
      configurable: false,
      writeable: false,
      get: properties[key]
    });
  });

  return withProperties;
}