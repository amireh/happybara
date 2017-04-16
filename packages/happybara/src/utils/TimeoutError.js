function TimeoutError(message) {
  this.name = 'TimeoutError';
  this.message = message;
  this.stack = (new Error()).stack;
}

TimeoutError.prototype = Object.create(Error.prototype);
TimeoutError.prototype.constructor = TimeoutError;

export default TimeoutError;