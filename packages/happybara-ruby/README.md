# happybara-ruby

Interact with your Happybara Ruby test server in JavaScript. Has basic support
for object _reflection_ (or weak references.)

## Example

```javascript
feature('Patients', function(page) {
  scenario('I can create and update Ruby objects', async function() {
    const user = await page.execRuby('a_user');

    console.log(user.name); // Bob

    await user.update_attribute('name', 'Alice');
    await user.reload();

    console.log(user.name); // Alice    
  });
})
```

## API

_TBD_

#### `connect() -> Promise`
#### `exec(procedure: String, payload: Object, options?: Object): Promise<mixed>`
#### `eval(procedure: String, payload: Object, options?: Object): Promise<mixed>`
#### `isConnected() -> Boolean`
#### `disconnect() -> Promise`
