# elasticsearch-each

Efficiently loop over documents in elasticsearch. Handy for reporting.

```js
var each = require('elasticsearch-each');

each({
  url: 'http://localhost:9200/test',
  query: {
    match: {
      title: 'elasticsearch'
    }
  }
}, function (err, doc) {
  if (err) console.error(err);
  console.log(doc);
});
```
