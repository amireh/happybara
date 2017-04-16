# happybara-plugin-pagejs

Clean up zombie timers in your Happybara Session. This plugin will make sure
the following timers are properly cleaned up so that the tests won't bleed:

- `window.setTimeout`
- `window.setInterval`
- `window.requestAnimationFrame`

## Example

```javascript
import { assert } from 'chai';

feature('Application', function(page) {
  scenario('I do not have to worry about deferred timers', async function() {
    // in reality, your application logic is expected to trigger the timer
    // but for this example's purposes, we'll do it manually:
    setTimeout(function() {
      console.log('boo')
    }, 500);

    assert.ok(true);
  });

  // 500ms later, "boo" will never be logged
})
```

## API

### `clearTimers() -> void`
