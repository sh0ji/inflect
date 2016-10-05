# Inflect
Inflect is a JavaScript module that improves the semantics of an HTML document. Its name comes from [semantic inflection](http://www.idpf.org/epub/301/spec/epub-contentdocs.html#sec-xhtml-semantic-inflection), which the IDPF defines as "the process of attaching additional meaning" to a document.

## Usage
The Inflect class takes a document, an array of items, and a config object.
```javascript
new Inflect(document, items, config)
```
* The `document` can be either the actual DOM document or a virtual DOM document such as [jsdom's](https://github.com/tmpvar/jsdom) implementation.
* The `items` array (aka the semantic map) is an array of objects that contain a `selector` and any number of other options. This is covered in detail in the Semantic Map section below.
* The `config` has three options:
    * `includeInDesignTasks` (boolean | default: `true`): a set of cleanup tasks that are useful if the source HTML document was output by InDesign.
    * `removeWhitespace` (boolean | default: `true`): remove whitespace that is left behind by removing elements.
    * `vocab` (string | default: `epub`): what semantic vocabulary should be used. Options are `epub` or `dpub`.

### Example Usage
```javascript
import 'html-inflect'
import inflectionMap from './inflectionMap.json'
new Inflect(document, inflectionMap, { vocab: 'dpub' })
```

## How It Works
Inflect uses `document.querySelectorAll()` to find all elements matching a given selector, and performs actions on that element depending on options specified in the semantic map. This can include removing the element entirely, removing a specified attribute, or adding attributes to the element.


## The Semantic Map
The semantic map is an array of objects that contain a `selector` and other items.

### `selector` | `string` | required
Any valid CSS selector. Use this to target the elements you want to change.

### `action` | `string` | optional
Valid options are `removeElement`, `removeAttribute`, or `addAttribute` (default).
| Action | Description |
|----|----|
| `removeElement` | The selected element will be completely removed. Child elements are left in place, similar to [jQuery's `.unwrap()`](https://api.jquery.com/unwrap/). |
| `removeAttribute` | Remove the attribute specified in the `attribute` key. |

### `attribute` | `string` | optional
Only required for `"action": "removeAttribute"`. Any attribute name can be specified. The `all` keyword will remove all attributes from the element.

### `epub` | `string` | optional
Any valid [epub:type](https://idpf.github.io/epub-vocabs/structure/) value.

### `dpub` | `string` | optional
Any valid [dpub role](https://www.w3.org/TR/dpub-aria-1.0/#role_definitions) value.

## Examples

### Apply Style Maps After InDesign Export
If [style maps](http://www.adobe.com/in/accessibility/products/indesign/mapping.html) aren't created prior to InDesign export, elements with the `A-HEAD` class will simply be output as `<p class="A-HEAD">...</p>` elements. The following map would turn all `.A-HEAD` elements into semantic `<h1>` tags.

**Map**
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
### Remove Useless Containers
InDesign often outputs containers with a generated id that begins with "_id".

**Map**
```javascript
[{
    "selector": "[id^=_id]",    // id begins with "_id"
    "action": "removeElement"
}]
```
**Input**
```html
<div id="_idContainer003">
    <p class="TX">Lorem ipsum dolor sit amet...</p>
</div>
```
**Output**
```html
<p class="TX">Lorem ipsum dolor sit amet...</p>
```
### Remove Useless Classes
InDesign also often outputs images with classes that begin with "_id".

**Map**
```javascript
[{
    "selector": "[class^=_id]",    // class begins with "_id"
    "action": "removeAttribute",
    "attribute": "class"
}]
```
**Input**
```html
<img class="_idGenObjectAttribute-1" src="..." alt="..." />
```
**Output**
```html
<img src="..." alt="..." />
```
