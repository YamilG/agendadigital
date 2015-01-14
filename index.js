var url = require('url')
var http = require('http')
var fs = require('fs');
var replace = require("replace");
var Parse = require('parse').Parse;

var server = http.createServer(function (req, res) {
	res.writeHead(200, {"Content-Type": "text/html"})
    res.write("hi");
	res.end()
    console.log("ok");
    


})

server.listen(5000)
