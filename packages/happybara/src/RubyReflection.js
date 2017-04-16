export function createFor(klassName, { instanceMethods, agent }) {
  let Klass, klassConstructor; // eslint-disable-line

  // a hack so that constructor.name displays the type name properly
  // eslint-disable-line
  eval(`
Klass = function ${klassName}() { return klassConstructor.apply(this, arguments); };
  `);

  klassConstructor = function(objectId, attributes) {
    this.__object_id__ = objectId;
    this.agent = agent;

    // this will overwrite attribute readers but that's ok
    this.__assign__(attributes);
  };

  Klass.prototype.__assign__ = function(attributes) {
    Object.assign(this, attributes);

    return this;
  };

  Klass.prototype.__acceptNextRepresentation__ = function(payload) {
    if (payload.object_id === this.__object_id__) {
      return this.__assign__(payload.value);
    }
    else {
      return this.agent._reflect(payload);
    }
  };

  Klass.prototype.toJSON = function() {
    return { $$ref: true, $$object_id: this.__object_id__ };
  };

  instanceMethods.forEach(method => {
    Klass.prototype[method] = function() {
      const methodArgs = [].slice.call(arguments);

      return this.agent.channel.send('REFLECT', {
        object_id: this.__object_id__,
        klass_name: klassName,
        method,
        arguments: methodArgs,
        options: this.agent.remoteOptions,
      }).then(this.__acceptNextRepresentation__.bind(this));
    }
  });

  return Klass;
}