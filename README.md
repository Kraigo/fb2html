## Example

```javascript
const options = {
    hyphenate: true
}
const book = new FB2JS(data);
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