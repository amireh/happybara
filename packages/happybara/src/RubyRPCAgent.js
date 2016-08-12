import { assert } from 'chai';

let messageCount = 0;

function RubyRPCAgent(options) {
  this.socket = null;
  this.callbacks = [];
  this.host = consume('host') || 'localhost';
  this.port = consume('port') || '11142';
  this.defaultOptions = options;

  function consume(key) {
    if (options.hasOwnProperty(key)) {
      const value = options[key];
      delete options[key];

      return value;
    }
  }
}

RubyRPCAgent.prototype.connect = function() {
  return new Promise((resolve, reject) => {
    assert(!this.socket, "A connection has already been created!");

    console.log(`Happybara: connecting to ws://${this.host}:${this.port}/...`);

    this.socket = new WebSocket(`ws://${this.host}:${this.port}/`);
    this.socket.onerror = function(event) {
      console.log(event);
      reject("Unable to connect");
    };

    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onopen = () => {
      this.socket.onerror = null;

      console.log('Happybara: connected.');

      resolve();
    };
  });
};

RubyRPCAgent.prototype.disconnect = function() {
  return new Promise(resolve => {
    if (this.socket) {
      this.socket.onclose = function(/*closeEvent*/) {
        resolve();
      };

      this.socket.close();
      this.socket = null;
    }
    else {
      resolve();
    }
  });
};

RubyRPCAgent.prototype.send = function(procedure, payload, options) {
  const messageId = `message-${++messageCount}`;

  this.socket.send(JSON.stringify({
    id: messageId,
    type: 'RPC',
    data: {
      procedure,
      payload,
      options: Object.assign({}, this.defaultOptions, options),
    }
  }));

  return new Promise((resolve, reject) => {
    console.log('Happybara: RPC request:', messageId, procedure);

    this.callbacks[messageId] = [ resolve, reject, new Date() ];
  });
};

RubyRPCAgent.prototype.eval = function(string, options) {
  const messageId = `message-${++messageCount}`;

  this.socket.send(JSON.stringify({
    id: messageId,
    type: 'EVAL',
    data: {
      string,
      options: Object.assign({}, this.defaultOptions, options),
    }
  }));

  return new Promise((resolve, reject) => {
    console.log('Happybara: EVAL request:', messageId, string);

    this.callbacks[messageId] = [ resolve, reject, new Date() ];
  });
};

RubyRPCAgent.prototype.handleMessage = function(event) {
  const message = JSON.parse(event.data);
  const messageId = message.id;
  const { data } = message;
  const callback = this.callbacks[messageId];
  const elapsed = (new Date()) - callback[2];

  assert(!!callback, `Unknown message received: ${messageId}`);

  if (message.type === 'error') {
    const error = new Error(data.details);
    error.name = 'RemoteError';

    callback[1](error);
  }
  else if (message.type === 'EVAL_RESPONSE') {
    console.log(`(${elapsed}ms) Happybara: EVAL response:`, messageId);
    console.debug(data);

    callback[0](data);
  }
  else if (message.type === 'RPC_RESPONSE') {
    console.log(`(${elapsed}ms) Happybara: RPC response:`, messageId);
    console.debug(data);

    callback[0](data);
  }
  else {
    console.warn(`Happybara: unknown message type "${message.type}"`);
  }
};

export default RubyRPCAgent;