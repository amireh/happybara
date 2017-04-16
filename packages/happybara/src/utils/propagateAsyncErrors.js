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
