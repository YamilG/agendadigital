var url = require('url')
var http = require('http')
//var fs = require('fs');
//var replace = require("replace");
var Parse = require('parse').Parse;

var server = http.createServer(function (req, res) {
	
    Parse.initialize("fg0ZfyAMCK6qnm2URlPUL7cmhOHpX4JUxeX4ZHsq", "A4eeWOJvusBCL8xvYDZfsD2ETgIopkM5swzGluCa");
    
	res.writeHead(404, {"Content-Type": "text/html"})
    res.write("error");
    res.end;


})

server.listen(5000)
