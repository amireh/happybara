import RubyRPCAgent from './RubyRPCAgent';

const SilentConsole = {
  debug: Function.prototype,
  info: Function.prototype,
  log: Function.prototype,
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

/**
 * @module
 * @preserveOrder
 */
export default class RubyRPC {
  constructor(options) {
    this.agent = new RubyRPCAgent(Object.assign({}, {
      logger: options.verbose ? console : SilentConsole
    }, options));
  }

  /**
   * @method exec
   *
   * Execute a Ruby function provided by the Happybara::Executor on the server
   * side.
   *
   * For example, assuming the executor defines such a function:
   *
   * ```ruby
   * def a_user(**attrs)
   *   User.create!(attrs.reverse_merge({ name: 'Hu', password: '123' }))
   * end
   * ```
   *
   * You can invoke it using the same identifier:
   *
   * ```javascript
   * exec('a_user', { name: 'Xi' });
   * // => { id: 1, name: 'Xi', password: '123' }
   * ```
   *
   * @param  {String} procedure
   *         The function id, like "a_user".
   *
   * @param  {?Object} payload
   * @param  {?Object} options
   *
   * @return {Promise.<mixed>}
   *         Fulfills with either the return value of the function or an error.
   */
  async exec(procedure, payload, options) {
    return this.agent.send(procedure, payload, options);
  }

  /**
   * @method eval
   *
   * @param  {String} code
   *         The code to evaluate.
   *
   * @param  {Object?} options
   *
   * @return {Promise.<mixed>}
   */
  async eval(string, options) {
    return this.agent.eval(string, options);
  }

  /**
   * @method connect
   *
   * Connect to the Ruby Happybara server and invoke the example set-up routines
   * in Ruby land.
   *
   * @return {Promise}
   */
  connect() {
    return this.agent.connect();
  }

  /**
   * @method isConnected
   *
   * @return {Boolean}
   *         Whether the websocket connection is alive.
   */
  isConnected() {
    return this.agent.isConnected();
  }

  /**
   * @method disconnect
   *
   * Disconnect from the Happybara server and invoke the example tear-down
   * routines in Ruby land.
   *
   * This method is re-entrant.
   *
   * @return {Promise}
   *         Resolves once the socket has been closed.
   */
  disconnect() {
    return this.agent.disconnect();
  }
}