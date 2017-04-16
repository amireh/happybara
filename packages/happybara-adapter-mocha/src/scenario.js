import { propagateAsyncErrors } from 'happybara';

function scenario(message, callback) {
  it(message, propagateAsyncErrors(callback));
}

scenario.only = function(message, callback) {
  it.only(message, propagateAsyncErrors(callback));
};

scenario.skip = function(message, callback) {
  it.skip(message, propagateAsyncErrors(callback));
};

export default scenario;