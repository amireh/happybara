/**
 * @module happybara.propagateAsyncErrors
 * @method propagateAsyncErrors
 *
 * A function decorating routine that casts down the result of a function based
 * on whether it returns a promise, or it accepts a "callback" argument like
 * node/mocha async functions.
 *
 * The point is to make sure that the decorated function throws an error if
 * an error is raised and promises are in play, and to make sure that it calls
 * the callback when it's done.
 *
 * The behaviour of the decorator is as follows:
 *
 * - If `fn` is a function that accepts no arguments and does not return a
 *   promise, the callback is triggered immediately.
 * - If the function accepts a callback argument, nothing is done.
 * - If the function does not accept a callback argument and returns a promise,
 *   the decorator will make sure to call `Promise#catch` and propagate the
 *   error and it will call done() on behalf of the function.
 * - If the function _both_ accepts a callback argument and returns a promise,
 *   the decorator will make sure to call `Promise#catch` and propagate the
 *   error but will not call done() by itself.
 *
 *
 * @param  {Function} fn
 *         The function to wrap.
 *
 * @return {Function}
 *         The decorated `fn` with the adjusted behaviour.
 */
export default function propagateAsyncErrors(fn) {
  return function(done) {
    try {
      const promise = fn.call(this, done);

      // the function does return a promise but it accepts no done callback,
      // so we must implicitly call it for them when the promise resolves
      if (promise && promise.catch && fn.length === 0) {
        promise.catch(done);
        promise.then(() => done());
      }
      // the function yields a promise and it will explicitly call done() when
      // it is done:
      else if (promise && promise.catch) {
        promise.catch(done);
      }
      // the function yields no promise nor does it explicitly call done() when
      // it's done (a sync function)
      else if (fn.length === 0) {
        done();
      }
    }
    catch (err) {
      done(err);
    }
  }
};
