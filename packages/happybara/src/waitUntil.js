import TimeoutError from './TimeoutError';
import Promise from 'Promise';

/**
 * @module happybara.waitUntil
 * @method
 *
 * Wait for a condition to become true.
 *
 * @param {Function} predicate
 *        A function that evaluates to whether we should stop waiting or not.
 *
 * @param {Object?} options
 * @param {Number} options.timeout
 *        Milliseconds to wait before raising a TimeoutError.
 *
 * @param {Number} options.frequency
 *        Milliseconds to wait between each predicate invocation.
 *
 * @return {Promise}
 *         Resolves if predicate evaluates to true before the time runs out,
 *         rejects otherwise.
 */
export default function waitUntil(p, options = { timeout: 5000, frequency: 25 }) {
  let startedAt = new Date();
  let error = new TimeoutError(options.message);

  return new Promise(function kaboom(resolve, reject) {
    setTimeout(function() {
      if (p()) {
        resolve();
      }
      else if (((new Date()) - startedAt) < options.timeout) {
        kaboom(resolve, reject);
      }
      else {
        reject(error);
      }
    }, options.frequency);
  });
}
