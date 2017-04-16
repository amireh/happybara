import Promise from 'Promise';
import exportReadOnlyProperties from './utils/exportReadOnlyProperties';
import MethodDelegate from './utils/MethodDelegate';
import RubyRPC from './capabilities/RubyRPC';

class Session {
  constructor(options = {}) {
    this.ruby = new RubyRPC(options);
  }

  async beforeEach(done) {
    try {
      await this.ruby.connectToRails();

      done();
    }
    catch (e) {
      done(e);
    }
  }

  async afterEach(done) {
    try {
      await this.ruby.disconnectFromRails();

      done();
    }
    catch (e) {
      done(e);
    }
  }
}

const SessionWithProperties = exportReadOnlyProperties(Session, {
  timeout() {
    return timeout => new Promise(resolve => setTimeout(resolve, timeout));
  },
});

const SessionWithCapabilities = MethodDelegate(SessionWithProperties, {
  ruby: [ 'execRuby', 'evalRuby', 'isConnected' ]
});

export default SessionWithCapabilities;

export function createCustomSession(baseKlass, options = {
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