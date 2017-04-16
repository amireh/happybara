# happybara-pagejs

Upgrade your Happybara Session with
[page.js](https://visionmedia.github.io/page.js/)-powered routing capabilities.

## Example

```javascript
import { m } from 'react-drill';
import { assert } from 'chai';

feature('Patients', function(page) {
  scenario('I can visit the patients page', async function() {
    assert.notOk(page.isTransitioning());

    page.transitionTo('/patients');

    assert.ok(page.isTransitioning());

    await page.pendingTransitions;

    assert.notOk(page.isTransitioning());
  })
})
```

## API

### `transitionTo(url: String) -> Promise`
### `isTransitioning() -> Boolean`
