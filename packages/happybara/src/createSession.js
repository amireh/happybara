import exportReadOnlyProperties from './exportReadOnlyProperties';
import MethodDelegate from './MethodDelegate';

export default function createSession(baseKlass, options = {
  properties: {},
  forwardedSymbols: {}
}) {
  const withProperties = exportReadOnlyProperties(baseKlass, options.properties)
  const withForwardedSymbols = MethodDelegate(withProperties, options.forwardedSymbols);

  // the test adapter will need to figure out how to use those:
  const withSuiteHooks = Object.assign(withForwardedSymbols, {
    setupRoutines: options.setupRoutines,
    tearDownRoutines: options.tearDownRoutines,
  });

  return withSuiteHooks;
}