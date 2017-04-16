import { propagateAsyncErrors } from 'happybara';
import CombinedHook from './CombinedHook';

const { beforeEach, afterEach } = window;
const DEFAULT_TIMEOUT = 5 * 1000;

export default Session => {
  function FeatureSuite(message, callback) {
    describe(message, createFeatureSuite(Session, callback));
  }

  FeatureSuite.only = function(message, callback) {
    describe.only(message, createFeatureSuite(Session, callback));
  };

  FeatureSuite.skip = function(message, callback) {
    describe.skip(message, createFeatureSuite(Session, callback));
  };

  return FeatureSuite;
}

function createFeatureSuite(Session, callback) {
  return function() {
    const session = new Session(this);

    window.beforeEach = wrapAsync(window.beforeEach);
    window.afterEach  = wrapAsync(window.afterEach);

    this.beforeEach('startHappybaraSession', CombinedHook({
      session,
      mochaSuite: this,
      hooks: Session.setupRoutines,
    }));

    this.timeout(session.options.timeout || DEFAULT_TIMEOUT);

    callback.call(this, session);

    this.afterEach('resetHappybaraSession', CombinedHook({
      session,
      mochaSuite: this,
      hooks: Session.tearDownRoutines
    }));

    window.afterEach = afterEach;
    window.beforeEach = beforeEach;
  }
}

function wrapAsync(fn) {
  return function(message, callback) {
    if (arguments.length === 2) {
      return fn(message, propagateAsyncErrors(callback));
    }
    else {
      return fn(propagateAsyncErrors(message));
    }
  }
}
