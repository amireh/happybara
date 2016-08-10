import { assert } from 'chai';

let messageCount = 0;

function RubyRPCAgent(options) {
  this.socket = null;
  this.callbacks = [];
  this.defaultOptions = options;
  this.host = delete options.host || 'localhost';
  this.port = delete options.port || '11142';
}

RubyRPCAgent.prototype.connect = function() {
  return new Promise((resolve, reject) => {
    this.socket = new WebSocket(`ws://${this.host}:${this.port}/`);
    this.socket.onerror = reject;
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onopen = () => {
      this.socket.onerror = null;

      console.log('RubyRPCAgent: connected.');

      resolve();
    };
  });
};

RubyRPCAgent.prototype.disconnect = function() {
  return new Promise(resolve => {
    if (this.socket) {
      this.socket.onclose = resolve;
      this.socket.close();
      this.socket = null;
    }
    else {
      resolve();
    }
  });
};

RubyRPCAgent.prototype.executeRPC = function(procedure, payload, options) {
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
    console.log('RubyRPCAgent: RPC request:', messageId, procedure);

    this.callbacks[messageId] = [ resolve, reject ];
  });
};

RubyRPCAgent.prototype.handleMessage = function(event) {
  const message = JSON.parse(event.data);
  const messageId = message.id;
  const { data } = message;
  const callback = this.callbacks[messageId];

  assert(!!callback, `Unknown message received: ${messageId}`);

  console.log('RubyRPCAgent: RPC response:', messageId, data);

  if (message.type === 'error') {
    callback[1](data);
  }
  else {
    callback[0](data);
  }
};

export default RubyRPCAgent;