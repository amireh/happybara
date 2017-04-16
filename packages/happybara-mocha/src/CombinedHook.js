import Promise from 'Promise';

export default function CombinedHook({ session, mochaSuite, hooks }) {
  return function(done) {
    const errors = [];
    const applyHook = async index => {
      const hook = hooks[index];

      if (!hook) {
        return Promise.resolve();
      }
      else {
        const [ label, fn, ] = hook;

        try {
          await applyMochaHook(fn, { session, mochaSuite });
        }
        catch (e) {
          e.message = `${e.message} [In hook ${index+1}/${hooks.length}: "${label}"]`;
          errors.push(e);
        }

        return applyHook(index + 1);
      }
    };

    applyHook(0).catch(e => { errors.push(e); }).then(() => {
      done(errors[0] || null);
    });
  };
}

function applyMochaHook(fn, { session, mochaSuite }) {
  if (fn.length === 3) {
    return convertCallbackToPromise(hookDone => fn.call(null, session, mochaSuite, hookDone));
  }
  else {
    return fn.call(null, session, mochaSuite);
  }
}

function convertCallbackToPromise(fn) {
  return new Promise(function(resolve, reject) {
    const done = function(err, result) {
      if (err) {
        reject(err);
      }
      else {
        resolve(result);
      }
    };

    fn(done);
  })
}