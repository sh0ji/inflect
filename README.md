# (html-)inflect
Inflect is a JavaScript module that improves the semantics of an HTML document. Its name comes from [semantic inflection](http://www.idpf.org/epub/301/spec/epub-contentdocs.html#sec-xhtml-semantic-inflection), which the IDPF defines as "the process of attaching additional meaning" to a document.

## Usage
The Inflect class takes a document and a config object.
```javascript
let inflect = new htmlInflect(document, config)
```
* The `document` can be either the actual DOM document or a virtual DOM document such as [jsdom's](https://github.com/tmpvar/jsdom) implementation.
* The `config` has the following options:
    * `autoRun` (boolean | default: `true`): run tasks automatically on class initialization.
    * `debug` (boolean | default: `false`): output debugging information to the console. Turn this on if things aren't working as expected.
    * `presets` (array of objects | default: unset): presets should be defined as modules. Currently, the only one that exists is [html-inflect-preset-indesign](https://www.npmjs.com/package/html-inflect-preset-indesign), which cleans up files that have been exported with InDesign.
    * `removeWhitespace` (boolean | default: `true`): remove whitespace surrounding the elements. This can be helpful if you're using the `removeElement` task a lot.
    * `tasks` (array of object | default: unset): An array of tasks that you would like to run.
    * `vocab` (string | default: `epub`): the semantic vocabulary that should be used. Options are currently `epub` or `dpub`. Submit an issue if you would like to have more added.

### Example Usage
```javascript
import htmlInflect from 'html-inflect'
let inflect = new htmlInflect(document, {
    presets: [ 'html-inflect-preset-indesign' ],
    tasks: [{
        selector: '.italics',
        tag: 'em'
    }]
})
```

## How It Works
Inflect uses `document.querySelectorAll()` to find all elements matching a given selector, and performs actions on those elements depending on options specified in the task definition. This can include removing the element entirely, removing a specified attribute, or adding attributes to the element.


## Tasks
Tasks are an array of objects that contain a `selector` and other items.

### `selector`
* `string` | required
* Any valid CSS selector. Use this to target the elements you want to change.

### `action`
* `string` or `function` | optional

| Action | Description |
|----|----|
| `removeElement` | The selected element will be completely removed. Child elements are left in place. |
| `removeAttribute` | Remove the attribute specified in the `attribute` key. Specifying 'all' will wipe all attributes from the element. |
| `replaceTag` | Change the element's tag name. e.g. turn a `<span class="bold">` into `<strong class="bold">`. Specify the replacement with the `tag` key. |
| `setAttribute` | Set any number of attributes. This will overwrite existing attributes with the same name. |
| `function(done)` | Perform custom functions with the `this` context is set to the selected element. The callback accepts an error and a success string, e.g. `done(null, 'spellCorrection')`. |
| `undefined` | If action is undefined, inflect will attempt to perform actions based on the other provided keys (`attribute`, `tag`, etc.). |


### `attribute`
* `string`, `array`, `object` | optional
* Required for the `removeAttribute` and `setAttribute` actions.
* For `removeAttribute`, both of these are valid:

```javascript
// remove one attribute with a string
{ action: 'removeAttribute', attribute: 'id' }

// remove multiple attributes with an array of strings
{ action: 'removeAttribute', attribute: [ 'class', 'href' ] }
```
* The `all` keyword will remove all attributes from the element.
* For `setAttribute`, a name and a value must be provided:

```javascript
// set one attribute
{ action: 'setAttribute', attribute: { name: 'href', value: '#my-link' } }

// set multiple attributes
{ action: 'setAttribute', attribute: [{ name: 'role', value: 'button' }, { name: 'tabindex', value: '0' }] }
```
### `tag`
* `string` | optional
* Required for the `replaceTag` action.

### `epub`
* `string` | optional
Any valid [epub:type](https://idpf.github.io/epub-vocabs/structure/) value.

### `dpub`
* `string` | optional
Any valid [dpub role](https://www.w3.org/TR/dpub-aria-1.0/#role_definitions) value.

### Examples
**Apply Style Maps After InDesign Export**

If [style maps](http://www.adobe.com/in/accessibility/products/indesign/mapping.html) aren't created prior to InDesign export, elements with the `A-HEAD` class will simply be output as `<p class="A-HEAD">...</p>` elements. The following map would turn all `.A-HEAD` elements into semantic `<h1>` tags with `epub:type="title"`.

**Task**
```javascript
[{
    "selector": ".A-HEAD",
    "tag": "h1",
    "epub": "title"
}]
```
**Input**
```html
<p class="A-HEAD">Lorem ipsum dolor sit amet</p>
```
**Output**
```html
<h1 class="A-HEAD" epub:type="title">Lorem ipsum dolor sit amet</h1>
```
