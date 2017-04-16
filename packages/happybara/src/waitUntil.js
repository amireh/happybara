import TimeoutError from './TimeoutError';
import Promise from 'Promise';

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
