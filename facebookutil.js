var https = require('https');
var querystring = require('querystring');

exports.auth = function (path, method, args, callback) {
    var args = args || {};
	var path = path + '?' + querystring.stringify(args);
  
  	var options = {
        host: 'graph.facebook.com',
        port: 443,
        method: method,
        path: path,
        headers: {
            'Accept': 'application/json'
        }
    };
	console.log(options);
    var request = https.request(options, function (res) {
        res.setEncoding('utf8');
        var body = [];
        res.on('data', function (chunk) {
            body.push(chunk);
        });
        res.on('end', function () {
            var data = [];
            var error;
            try {
                data = body.toString().split("=");
            } catch(e) {
                data = null;
                error = e;
            }
            if (data && data.error) {
                // Graph API error
                callback( data.error, null);
            } else if (data) {
                // success
                callback(null, data[1]);
            } else {
                // error
                callback(error, null);
            }
        });
    });

    request.on('error', function (error) {
        callback("request.on" + error, null);
    });

    request.end();
};
