export default function MethodDelegate(baseKlass, proxies) {
  const capabilityExports = Object.keys(proxies).reduce(function(exports, ref) {
    proxies[ref].forEach(exportKey => {
      exports[exportKey] = function() {
        const delegate = this[ref];

        return delegate[exportKey].apply(delegate, arguments);
      };
    });

    return exports;
  }, {});

  const withDelegates = class extends baseKlass {}

  Object.assign(withDelegates.prototype, capabilityExports);

  return withDelegates;
}