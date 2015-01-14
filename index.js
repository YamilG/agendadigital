var url = require('url')
var http = require('http')
var fs = require('fs');
//var replace = require("replace");
var Parse = require('parse').Parse;

var server = http.createServer(function (req, res) {
	
    Parse.initialize("fg0ZfyAMCK6qnm2URlPUL7cmhOHpX4JUxeX4ZHsq", "A4eeWOJvusBCL8xvYDZfsD2ETgIopkM5swzGluCa");
    parseado = url.parse(req.url, true)
	dir = parseado.pathname.split('/')
	
	var direct = parseado.pathname.replace(/\//, '');
    
    
	if(direct.search(".png") > -1 ) {
		var img = fs.readFileSync(direct);
     	res.writeHead(200, {"Content-Type": "image/png" });
		res.write(img);
	 	res.end()
   } else if(direct.search(".jpg") > -1 ) {
		var img = fs.readFileSync(direct);
     	res.writeHead(200, {"Content-Type": "image/jpg" });
		res.write(img);
	 	res.end()
   } else  if (direct.search(".css") > -1 ) {
	   
	   fs.readFile(direct, 'utf8', function (err,data) {
		  if (err) {
			  return console.log(err);
		  }
		  res.writeHead(200, {"Content-Type": "text/css"})
		  res.write(data);
		  res.end()
	 	});

   } else {

	  fs.readFile(dir[1] + ".html", 'utf8', function (err,data) {
		  res.writeHead(200, {"Content-Type": "text/html"})
		  res.write(data);
		  res.end()
          
	  });
   }

})

server.listen(5000)
