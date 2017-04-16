import RubyRPCAgent from '../RubyRPCAgent';

const SilentConsole = {
  debug: Function.prototype,
  info: Function.prototype,
  log: Function.prototype,
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

export default class RubyRPC {
  constructor(options) {
    this.agent = new RubyRPCAgent(Object.assign({}, {
      logger: options.verbose ? console : SilentConsole
    }, options));
  }

  /**
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
   * execRuby('a_user', { name: 'Xi' });
   * // => { id: 1, name: 'Xi', password: '123' }
   * ```
   *
   * @param  {String} procedure
   *         The function id, like "a_user".
   *
   * @param  {?Object} payload
   * @param  {?Object} options
   *
   * @return {Promise.<Object>}
   *         Fulfills with either the return value of the function or an error.
   */
  async execRuby(procedure, payload, options) {
    return this.agent.send(procedure, payload, options);
  }

  async evalRuby(string, options) {
    return this.agent.eval(string, options);
  }

  connectToRails() {
    return this.agent.connect();
  }

  isConnected() {
    return this.agent.isConnected();
  }

  disconnectFromRails() {
    return this.agent.disconnect();
  }
}