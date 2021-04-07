## Install
```
npm install fb2html --save
```

## Example

```javascript
const FB2HTML = require('fb2html');
const options = {
    hyphenate: true
}
const book = new FB2HTML(data);
const result = book.format();
```

## Options
* `hyphenate` (boolean) - using [Hyphen](https://www.npmjs.com/package/hyphen) plugin if language present in book


## Methods
* `getTitle()` (string)
* `getAuthors()` (string)
* `getGenres()` (string)
* `getAnnotation()` (string)
* `getCover()` (string) - url or base64 image
* `getBody()` (string)
* `getLanguage()` (string)
* `getTranslators()` (string)
* `getKeywords()` (string)