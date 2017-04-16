import page from 'page';
import Promise from 'Promise';
import { waitUntil } from 'happybara';

const BENCH_URL = '/__test__';

page(BENCH_URL, Function.prototype); // ugh

export default class HappybaraPageJSCapability {
  constructor(options = { verbose: false }) {
    this.state = {
      context: null,
      transition: null,
    };

    this.options = {
      verbose: options.verbose
    };
  }

  /**
   * @public
   *
   * @param {String} url
   *        The URL to transition to.
   *
   * @return {Promise}
   *         Fulfills when the browser location is updated with the requested
   *         URL.
   */
  transitionTo(url) {
    page.show(url, { dispatch: true });

    return Promise.resolve();
  }

  reload() {
    const path = this.state.context.path;

    return this.transitionTo(BENCH_URL).then(() => {
      return waitUntil(() => this.getCurrentURL().indexOf(BENCH_URL) > -1);
    }).then(() => {
      return this.transitionTo(path);
    });
  }

  /**
   * @public
   * @return {Boolean} [description]
   */
  isTransitioning() {
    const { transition } = this.state;

    if (!transition) {
      return false;
    }
    else if (transition[1] === 'exiting') {
      return true;
    }
    else if (transition[1] === 'entering') {
      return window.location.hash.replace(/^#!/, '') !== transition[0];
    }
    else {
      return false;
    }
  }

  getCurrentURL() {
    return this.state.context && this.state.context.path || '';
  }

  /**
   * @private
   *
   * Transition back to the starting URL of the test suite and clear the search
   * fragment of the location.
   *
   * Keep in mind that this will not transition back to the actual app's "/"
   * route, but a special route we use as a "clean slate" hatch.
   *
   * @return {Promise}
   */
  transitionToStartingPoint() {
    history.pushState(null, document.title, location.pathname + location.hash);
    return this.transitionTo(BENCH_URL);
  }

  /** @private */
  interceptRoutingTransitions() {
    const greedyEnterRoute      = new page.Route('*');
    const greedyExitRoute       = new page.Route('*');
    const greedyExitDoneRoute   = new page.Route('*');

    page.callbacks.unshift(greedyEnterRoute.middleware((ctx, next) => {
      if (this.options.verbose) {
        console.debug(`* TRANSITION "${ctx.canonicalPath}" (entering)`);
      }

      this.state.transition = [ ctx.canonicalPath, 'entering' ];
      this.state.context = ctx;

      next();
    }));

    page.exits.unshift(greedyExitRoute.middleware((ctx, next) => {
      if (this.state.transition && this.state.transition[0] === ctx.canonicalPath) {
        this.state.transition[1] = 'exiting';
      }

      next();
    }));

    page.exits.push(greedyExitDoneRoute.middleware((ctx, next) => {
      if (this.state.transition && this.state.transition[0] === ctx.canonicalPath) {
        if (this.options.verbose) {
          console.debug(`* TRANSITION "${ctx.canonicalPath}" (exited)`);
        }

        this.state.transition = null;
        this.state.context = null;
      }

      next();
    }));
  }

  /** @private */
  stopInterceptingRoutingTransitions() {
    page.exits.shift();     // remove greedyExitRoute
    page.exits.pop();       // remove greedyExitDoneRoute
    page.callbacks.shift(); // remove greedyEnterRoute
  }
}
