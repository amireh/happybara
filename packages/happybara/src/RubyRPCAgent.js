import { assert } from 'chai';
import Promise from 'Promise';
import Channel from './RubyRPCChannel';
import * as Reflection from './RubyReflection';

let channelCount = 0;

class RubyRPCAgent {
  constructor(userOptions) {
    const options = Object.assign({}, userOptions);

    this.socket = null;
    this.channel = null;
    this.host = consume('host') || 'localhost';
    this.port = consume('port') || '11141';
    this.reflections = consume('reflections') || [];
    this.logger = consume('logger') || console;
    this.remoteOptions = options;
    this.reflectedKlasses = {};

    function consume(key) {
      if (options.hasOwnProperty(key)) {
        const value = options[key];
        delete options[key];

        return value;
      }
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      assert(!this.socket, "A connection has already been created!");

      this.logger.debug(`Happybara: connecting to ws://${this.host}:${this.port}/...`);

      this.socket = new WebSocket(`ws://${this.host}:${this.port}/happybara`);
      this.socket.onerror = event => {
        this.logger.error(event);

        reject(new Error("Unable to connect to Happybara server"));
      };

      this.socket.onopen = () => {
        this.channel = new Channel({
          id: `${++channelCount}`,
          logger: this.logger,
          socket: this.socket
        });

        this.socket.onerror = null;
        this.socket.onmessage = this.channel.handleMessage.bind(this.channel);

        this.logger.debug('Happybara: connected.');

        this.channel.send('SETUP', {}).then(() => {
          this._queryReflectableClasses().then(resolve, error => {
            this.logger.warn('Unable to query reflectable types:', error);
            resolve();
          });
        }, reject);

      };
    });
  }

  isConnected() {
    return !!this.channel;
  }

  _queryReflectableClasses() {
    return Promise.all(this.reflections.map(klassName => {
      return this._queryReflectableClass(klassName);
    }));
  }

  _queryReflectableClass(klassName) {
    return this.channel.send('QUERY', {
      klass_name: klassName
    }).then(data => {
      this.reflectedKlasses[klassName] = Reflection.createFor(klassName, {
        agent: this,
        instanceMethods: data.instance_methods,
      });
    });
  }

  disconnect() {
    return new Promise(resolve => {
      if (this.socket) {
        const closeSocket = () => {
          this.socket.onclose = (/*closeEvent*/) => {
            console.debug('SOCKET closed !');
            this.channel = null;

            resolve();
          };

          this.socket.close();
          this.socket = null;
        };

        const closeSession = () => {
          if (!this.channel) {
            return Promise.resolve();
          }
          else {
            return this.channel.send('TEARDOWN', {});
          }
        };

        closeSession().then(() => {
          console.debug('OK, tore down the session remotely, now closing socket...');
          closeSocket();
        }, () => {
          console.warn("Unable to cleanly disconnect from server... terminating socket session.");

          closeSocket();
        });

      }
      else {
        resolve();
      }
    });
  }

  send(procedure, payload, options) {
    return this.channel.send('RPC', {
      procedure,
      payload,
      options: Object.assign({}, this.remoteOptions, options),
    }).then(this._reflect.bind(this));
  }

  eval(string, options) {
    return this.channel.send('EVAL', {
      string,
      options: Object.assign({}, this.remoteOptions, options),
    }).then(this._reflect.bind(this));
  }

  _reflect(response) {
    const klass = this.reflectedKlasses[response.klass];

    if (klass) {
      return new klass(response.object_id, response.value);
    }
    else {
      return response.value;
    }
  }
}

export default RubyRPCAgent;