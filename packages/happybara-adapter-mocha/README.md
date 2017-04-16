# happybara-adapter-mocha

A Mocha adapter for Happybara sessions that instantiates a session for your
regression suite.

The adapter exposes two primary APIs to the `window` global in the runner's
context: `feature()` in place of `describe()` for starting a new regression
testing suite, and `scenario` in place of `it()` for creating individual
regression tests.

## Example

```javascript
import { assert } from 'chai';
import { drill, m } from 'react-drill';

feature('Patients', function(page) {
  scenario('I can view my patients', async function() {
    await page.execRuby('a_patient', { name: 'My Patient' });
    await page.visit('/patients');

    assert.ok(drill(page.component).has('a', m.hasText('My Patient')));
  })
})
```

## API

### `feature(message: String, handler: (Session) -> void) -> void`

The counter-part to plain Mocha's `describe()` routine. This function will
create a new MochaSuite bound to a Happybara session ([[PAMMSession]] in our
case.)

### `scenario(message:String, handler: Function) -> void`

The counter-part to plain Mocha's `it()` routine with the addition to a guard
installed around the handler for `async` functions. This guard will ensure that
any uncaught exceptions are propagated to mocha, in case you forget to do so
explicitly.