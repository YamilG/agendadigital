var url = require('url');
var http = require('http');
var fs = require('fs');
var replace = require("replace");
var Parse = require('parse').Parse;
//var express = require('express');
//var app = express();


var server = http.createServer(function (req, res) {

	parseado = url.parse(req.url, true)
	dir = parseado.pathname.split('/')
	
	//res.write("<h1>"+dir[1]+"</h1>"); /\*/
	console.log(dir[1] );
	
	var direct = parseado.pathname.replace(/\//, '');
	console.log(direct );
	if(direct.search(".png") > -1 ) {
		var img = fs.readFileSync(direct);
     	res.writeHead(200, {"Content-Type": "image/png" });
     	//res.end(img, 'binary');
		res.write(img);
	 	res.end()
   } else if(direct.search(".jpg") > -1 ) {
		var img = fs.readFileSync(direct);
     	res.writeHead(200, {"Content-Type": "image/jpg" });
     	//res.end(img, 'binary');
		res.write(img);
	 	res.end()
   } else  if (direct.search(".css") > -1 ) {
	   
	   fs.readFile(direct, 'utf8', function (err,data) {
		  if (err) {
			  return console.log(err);
		  }
		  res.writeHead(200, {"Content-Type": "text/css"})
		  
		  //console.log(data);
		  res.write(data);
		  res.end()
	 	});

   } else {

	  fs.readFile(direct, 'utf8', function (err,data) {
		  if (err) {
			  return console.log(err);
		  }
		  res.writeHead(200, {"Content-Type": "text/html"})
		  
		  //console.log(data);
		  res.write(data);
		  res.end()
	  });
	
   }


})
server.listen(process.env.PORT || 5000)

/*

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    
    Parse.initialize("rtduL3AiJ6Gt4g74rzlmKm09i2OlJ23GJPkVmEiv", "3sKYmLhuq79HxCTpErTTJG7o9LzewszO63f1Azos");
    
    var wallpaper = Parse.Object.extend("Wallpaper");
    var query = new Parse.Query(wallpaper);

    var page = "<h1>Hello World!</h1>";
    query.find({
      success: function(users) {
          //response.write("Hello World :) ?");
          page = page + "<ul>";
          for (var i = 0; i < users.length; ++i) {
            page = page + "<li>"+ users[i].get('illustrator') + "</li>";
          }
          page = page + "</ul>";
          
          response.send(page);
      },
        error: function(error) {
            response.write("Error: " + error.code + " " + error.message);
        }
    });
    
    
    
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
*/