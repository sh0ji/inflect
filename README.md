# html-inflect
html-inflect is a tool for cleaning up and improving the semantics of HTML in a Node.js environment. Its name comes from [semantic inflection](http://www.idpf.org/epub/301/spec/epub-contentdocs.html#sec-xhtml-semantic-inflection), which the IDPF defines as "the process of attaching additional meaning" to a document.

## Usage
html-inflect must be instantiated with a document object, and then The only parameter for instantiation is a document object. When used in the browser, html-inflect will always use the actual `document` object.

### Methods
There are only two methods available, `.runTask(task)` and `.runTasks(tasks)`.

`.runTask(task)`
Accepts a task object and returns a promise.

`.runTasks(tasks)`
Accepts an array of task objects and returns a promise.

## Task API
A task is an object with two required keys: a `selector`, and an `action`. The third key, `parameter`, will be passed to the `action` function.
```javascript
let myTask = {
    selector: '.h3',
    action: 'changeTag',
    parameter: 'h2'
};
```
`selector` | String
The selector can be any valid CSS selector. It is used to find the element you would like to manipulate.

`action` | String|Function
Actions can be one of the pre-defined actions, or a function. When providing a function, the selected element will be the main argument. It is strongly recommended that you return a promise.
```javascript
let myTask = {
  selector: '.foo',
  action: (el) => {
    return new Promise((resolve, reject) => {
      el.classList.add('bar');
      resolve('foobar');
    });
  }
};
```

`parameter` | String
The parameter is used in a few of the pre-defined actions. They are also static methods on the Inflect class, so you could use them independently of the task API if desired.

## Actions
html-inflect comes with a few pre-defined actions, defined below with their parameters.

* `changeTag` (newTag) : Change the selected element to the `parameter` key.
* `removeAttributes` (...attributes) : Remove a comma-delimited list of attribute names. Providing the word 'all' will remove all attributes.
* `removeContainer` () : Remove the selected element, but keep all children in its place.
* `removeElement` () : Remove the element and its children. This works the same way as [.remove()](https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove).
* `removeParent` () : Remove the selected element's parent, leaving the element and its children in place.
* `setEpubType` (...types) : Set the `epub:type` attribute. Providing multiple comma-delimited types will result in multiple space-delimited `epub:type` values (e.g. `epub:type="type1 type2 type3"`). See [EPUB 3 Structural Semantics](https://idpf.github.io/epub-vocabs/structure/).
* `setRole` (...roles) : Set the `role` attribute. Providing multiple comma-delimited roles will result in multiple space-delimited `role` values (e.g. `role="role1 role2 role3"`). See [The ARIA Roles Model](https://www.w3.org/TR/wai-aria/roles).

## Example Usage
This example uses [jsdom](https://github.com/tmpvar/jsdom) to create a document object, but any HTML parser will work.
```javascript
const fs = require('fs');
const jsdom = require('jsdom');
const myDoc = require('./myDoc.html');
const Inflect = require('html-inflect');

// define a task
let myTask = {
    selector: '.h3',
    action: 'changeTag',
    parameter: 'h2'
};

// get your document
let html = fs.readFileSync(myDoc);
let doc = jsdom.jsdom(html);

// load the document into a new instance of html-inflect
let inflect = new Inflect(doc);

// run the task
inflect.runTask(myTask);

// do something with the result
fs.writeFile('mydoc_edited.html', inflect.doc, (err) => {
    if (err) throw err;
});
```
