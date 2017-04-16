import Promise from 'Promise';
import invariant from 'invariant';

function RubyError(message) {
  this.name = 'RubyError';
  this.message = message;
  this.stack = (new Error()).stack;
}

RubyError.prototype = Object.create(Error.prototype);
RubyError.prototype.constructor = RubyError;

export default class Channel {
  constructor({ id, socket, logger }) {
    this.id = id;
    this.socket = socket;
    this.logger = logger;
    this.callbacks = {};
    this.messageCount = 0;
  }

  async send(type, data) {
    const messageId = `${this.id}:${++this.messageCount}`;

    this.logger.debug(`( ? ) Happybara: [${messageId}] "${type}" request:`, data);

    this.socket.send(JSON.stringify({
      id: messageId,
      type,
      data
    }));

    return new Promise((resolve, reject) => {
      this.callbacks[messageId] = [ resolve, reject, new Date() ];
    });
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    const messageId = message.id;

    invariant(!!this.callbacks.hasOwnProperty(messageId),
      `Unknown message received: ${messageId}`
    );

    const { data } = message;
    const [ resolve, reject, startedAt ] = this.callbacks[messageId];
    const elapsed = (new Date()) - startedAt;

    delete this.callbacks[messageId];

    switch (message.type) {
      case 'error':
        reject(new RubyError(data.details));
        break;

      case 'SETUP_RESPONSE':
      case 'EVAL_RESPONSE':
      case 'QUERY_RESPONSE':
      case 'REFLECT_RESPONSE':
      case 'RPC_RESPONSE':
      case 'TEARDOWN_RESPONSE':
        this.logger.debug(`(${elapsed}ms) Happybara: [${messageId}] "${message.type}" response:`, data);
        resolve(data);
        break;

      default:
        reject(new RubyError(`Happybara: unknown message type "${message.type}"`))

    }
  };
}
