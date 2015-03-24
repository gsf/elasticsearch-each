var http = require('http');
var url = require('url');

module.exports = function each (options, callback) {
  options.query = options.query || {query: {match_all: {}}};

  var u = url.parse(options.url);
  var scrollU = url.parse(options.url);
  var scrollId;

  u.path = u.path + '/_search?search_type=scan&scroll=10m&size=50';
  u.method = 'POST';
  scrollU.path = '/_search/scroll?scroll=10m';
  scrollU.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
  scrollU.method = 'POST';

  function scroll () {
    http.request(scrollU, function (res) {
      var data = '';
      res.on('data', function (chunk) {data += chunk});
      res.on('end', function () {
        var result = JSON.parse(data);
        if (!result.hits.hits.length) return;
        result.hits.hits.forEach(function (doc) {
          callback(null, doc);
        });
        scroll();
      });
    }).on('error', function (e) {
      callback(e);
    }).end(scrollId);
  }

  http.request(u, function (res) {
    var data = '';
    res.on('data', function (chunk) {data += chunk});
    res.on('end', function () {
      var result = JSON.parse(data);
      if (result.error) return callback(Error(result.error));
      scrollId = result._scroll_id;
      scrollU.headers['Content-Length'] = Buffer.byteLength(scrollId);
      scroll();
    });
  }).on('error', function (e) {
    callback(e);
  }).end(JSON.stringify(options.query));
};
