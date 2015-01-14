var url = require('url');
var http = require('http');
var fs = require('fs');
var replace = require("replace");
var Parse = require('parse').Parse;
//var express = require('express');
//var app = express();

console.log("Hello Cruel World");
console.log("Node app is running at localhost: 5000");

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
       dir[1] = (dir[1] == "") ? "index" : dir[1] 
       
       fs.exists(dir[1] + ".html", function (exists) {
            if (!exists) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                fs.createReadStream('404.html').pipe(res);
                return false;
        }});
           
	  fs.readFile(dir[1] + ".html", 'utf8', function (err,data) {

		  if (err) {
              return console.log(err);
		  } else {
          
          res.writeHead(200, {"Content-Type": "text/html"})
          
          var dataStr = data.toString();
          dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");
          
          var re1 = /(%search:)(.*?)%/g;
          var temp  = ""
          while( jsreap = re1.exec(dataStr) ) {
              
              dataStr = dataStr.replace(jsreap[0], "" );
              var eventT = Parse.Object.extend(jsreap[2]);
              var query = new Parse.Query(eventT);
          
              if (dir[2]) {
                  query.equalTo("objectId", dir[2]);
              }

              query.find({
                  
                   success: function(events) {
                       
                       


                       var prot = "";
                       var foundRepeat = false;

                       var re1 = /(%repeat%)(.*?)(%endrepeat%)/g;
                       var temp  = "";
                       
                       while( jsreap = re1.exec(dataStr) ) {

                            temp = jsreap[2];
                            foundRepeat = true;

                       }
                       
                       //Repeating cycle
                       
                       if (foundRepeat) {

                           var tmpsPans = [];
                           for (var i = 0; i < events.length; ++i) {
                               tmpsPans[i] = temp
                           }

                           for (var i = 0; i < events.length; ++i) {
                               
                               var re = /%(.*?)%/gi;

                               while( jsreap = re.exec(dataStr) ) {

                                   var res2 = jsreap[1].split(":");

                                   if (res2[1] == "image") {
                                       
                                       if (events[i].get(res2[0]) != null) {
                                           var profilePhoto = events[i].get(res2[0]);
                                           var photourl = profilePhoto.url();
                                           tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" + res2[1]+ "%", photourl );
                                       }
                                       
                                   } else if (res2[1] == "geoPoint") {
                                       
                                       if (events[i].get(res2[0]) != null) {
                                           tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" + res2[1] + ":" + res2[2] + "%", events[i].get(res2[0])[res2[2]] );
                                       } else {
                                           tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" + res2[1] + ":" + res2[2] + "%", "0");
                                       }
                                       
                                   } else {

                                       if (res2[0] != "repeat" && res2[0] != "endrepeat") {
                                           if (res2[0] == "id") {
                                               tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + "%", events[i].id );
                                            } else {
                                                tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + "%", events[i].get(res2[0]));
                                            }
                                       }
                                       
                                   }

                               }


                           }

                           dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

                           var re1 = /(%repeat%)(.*?)(%endrepeat%)/g;
                           while( jsreap = re1.exec(dataStr) ) {
                                
                                for (var i = 0; i < events.length; ++i) {
                                    prot =   prot + tmpsPans[i];
                                }

                                dataStr = dataStr.replace(re1 , prot );

                            }

                       } else {
                           
                           //One Value
                           
                           var re = /%(.*?)%/g;
                           var i = 0;

                           while( jsreap = re.exec(dataStr) ) {
                               var res2 = jsreap[1].split(":");

                               if (res2[1] == "image") {
                                   
                                   if (events[i].get(res2[0]) != null) {
                                       var profilePhoto = events[i].get(res2[0]);
                                       var photourl = profilePhoto.url();
                                       dataStr = dataStr.replace("%"+res2[0] + ":" + res2[1]+ "%", photourl );
                                   }
                                   
                               } else if (res2[1] == "geoPoint") {
                                   
                                   if (events[i].get(res2[0]) != null) {
                                       dataStr = dataStr.replace("%"+res2[0] + ":" + res2[1] + ":" + res2[2] + "%", events[i].get(res2[0])[res2[2]] );
                                   }
                                   
                               } else {

                                   if (res2[0] != "repeat" && res2[0] != "endrepeat") {
                                       if (events[i].get(res2[0]) != null) {

                                           if (res2[0] == "id") {
                                                dataStr = dataStr.replace("%"+res2[0] + "%", events[i].id );
                                            } else {
                                                dataStr = dataStr.replace("%"+res2[0] + "%", events[i].get(res2[0]));
                                            }

                                       }
                                   }
                                   
                               }

                           }

                       }

                       res.write(dataStr);
                       res.end()
                       
                   },
                  error: function(error) {
                      console.log("Error")
                      res.writeHead(202, {"Content-Type": "text/html"})
                      //response.write("Error: " + error.code + " " + error.message);

                      res.end()
                  }
              });
          
          
          
          
          }
          
              
          }
          /*
		  res.writeHead(200, {"Content-Type": "text/html"})
		  res.write(data);
		  res.end()
          */
	  });
	
   }



})
server.listen(process.env.PORT || 5000)
