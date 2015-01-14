var fs = require('fs');
var replace = require("replace");
var Parse = require('parse').Parse;
var express = require('express');
var app = express();

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
