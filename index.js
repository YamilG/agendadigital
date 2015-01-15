var url = require('url');
var http = require('http');
var fs = require('fs');
var replace = require("replace");
var async = require("async");
var Parse = require('parse').Parse;
var parseInit = require(__dirname+"/parsekeys.js");
//var express = require('express');
//var app = express();

console.log("Hello Cruel World");
console.log("Node app is running at localhost: 5000");


function getEvents(eventId, data, res, callback) {


  var dataStr = data.toString();
  dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

  var re1 = /(%search:)(.*?)%/g;
  var temp  = ""

  //Get Events


  var classname = "Event";

  var eventT = Parse.Object.extend(classname);
  var query = new Parse.Query(eventT);

  if (eventId) {
    query.equalTo("objectId", eventId);
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

            if (res2[0] == classname ) {

              if (res2[2] == "image") {

                if (events[i].get(res2[1]) != null) {
                  var profilePhoto = events[i].get(res2[1]);
                  var photourl = profilePhoto.url();
                  tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
                } else {
                  var photourl = "https://browshot.com/static/images/not-found.png";
                  tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
                }

              }
              else if (res2[2] == "geoPoint") {

                if (events[i].get(res2[0]) != null) {
                  tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2] + ":" + res2[3] + "%", events[i].get(res2[0])[res2[2]] );
                } else {
                  tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2] + ":" + res2[3] + "%", "0");
                }

              }
              else {

                if (res2[0] != "repeat" && res2[0] != "endrepeat") {
                  if (res2[1] == "id") {
                    tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + "%", events[i].id );
                  } else {
                    tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get(res2[1]));
                  }
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

      }

      else {

        //One Value

        var re = /%(.*?)%/g;
        var i = 0;

        while( jsreap = re.exec(dataStr) ) {
          var res2 = jsreap[1].split(":");

          if (res2[2] == "image" ) {

            if (events[i].get(res2[1]) != null) {
              var profilePhoto = events[i].get(res2[1]);
              var photourl = profilePhoto.url();
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
            } else {
              var photourl = "https://browshot.com/static/images/not-found.png";
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
            }

          } else if (res2[1] == "geoPoint") {

            if (events[i].get(res2[0]) != null) {
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2] + ":" + res2[3] + "%", events[i].get(res2[1])[res2[2]] );
            }

          } else {

            if (res2[1] != "repeat" && res2[1] != "endrepeat") {
              if (events[i].get(res2[1]) != null) {

                if (res2[1] == "id") {
                  dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].id );
                } else {
                  dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get(res2[1]) != null ? events[i].get(res2[1]) : "" );
                }

              }
            }

          }

        }

      }


      callback(dataStr);


    },
    error: function(error) {
      console.log("Error")
      res.writeHead(202, {"Content-Type": "text/html"})
      //response.write("Error: " + error.code + " " + error.message);

      callback(data);

    }
  });



}

function getFeaturedEvent(eventId, data, res, callback) {

  var dataStr = data.toString();
  dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");


  var classname = "Featured";

  var eventT = Parse.Object.extend(classname);
  var query = new Parse.Query(eventT);
  query.include("event");
  query.limit(1);
  if (eventId) {
    query.equalTo("objectId", eventId);
  }

  query.find({
    success: function(events) {

      //One Value

      var re = /%(.*?)%/g;
      var i = 0;

      while( jsreap = re.exec(dataStr) ) {
        var res2 = jsreap[1].split(":");

        if (res2[0] == classname) {

          if (res2[2] == "image" ) {

            if (events[i].get("event").get(res2[1]) != null) {
              var profilePhoto = events[i].get("event").get(res2[1]);
              var photourl = profilePhoto.url();
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
            } else {
              var photourl = "https://browshot.com/static/images/not-found.png";
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
            }

          }
          else if (res2[2] == "geoPoint") {

            if (events[i].get("event").get(res2[0]) != null) {
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2] + ":" + res2[3] + "%", events[i].get("event").get(res2[1]).res2[2] );
            }

          }
          else {
            if (res2[1] != "repeat" && res2[1] != "endrepeat") {



              if (res2[1] == "id") {
                dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get("event").id );
              } else {
                if (events[i].get("event").get(res2[1]) != null) {
                  dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get("event").get(res2[1]) != null ? events[i].get("event").get(res2[1]) : "" );
                }
              }
            }

          }

        }
      }

      callback(dataStr);

    },
    error: function(error) {
      console.log("Error")
      res.writeHead(202, {"Content-Type": "text/html"})
      //response.write("Error: " + error.code + " " + error.message);

      callback(data);
    }
  });
}


var server = http.createServer(function (req, res) {

  Parse.initialize(parseInit.appKeys.appid, parseInit.appKeys.jsid);

  parseado = url.parse(req.url, true)
  dir = parseado.pathname.split('/')

  var direct = parseado.pathname.replace(/\//, '');

  if(direct.search(".png") > -1 ) {
    var img = fs.readFileSync(direct);
    res.writeHead(200, {"Content-Type": "image/png" });
    res.write(img);
    res.end()
  }
  else if(direct.search(".jpg") > -1 ) {
    var img = fs.readFileSync(direct);
    res.writeHead(200, {"Content-Type": "image/jpg" });
    res.write(img);
    res.end()
  }
  else  if (direct.search(".css") > -1 ) {

    fs.readFile(direct, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      res.writeHead(200, {"Content-Type": "text/css"})
      res.write(data);
      res.end()
    });

  }
  else  if (direct.search(".js") > -1 ) {

    fs.readFile(direct, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      res.writeHead(200, {"Content-Type": "text/javascript"})
      res.write(data);
      res.end()
    });


  }
  else {

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
        }

        if (dir[1] == "index") {





          async.series([
            function(callback){
              res.writeHead(200, {"Content-Type": "text/html"})

              callback(null, 'one');
            },
            function(callback){
              getEvents(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'two'); } );
            },
            function(callback){
              getFeaturedEvent(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'three'); } );
            },
            function(callback){
              // arg1 now equals 'three'
              res.write(data);
              res.end()
              callback(null, 'done');
            }
            ],
            function (err, result) {
              // result now equals 'done'
            });


          } else if (dir[1] == "event") {

            async.series([
              function(callback){
                res.writeHead(200, {"Content-Type": "text/html"})

                callback(null, 'one');
              },
              function(callback){
                getEvents(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'two'); } );
              },
              function(callback){
                getFeaturedEvent(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'three'); } );
              },
              function(callback){
                // arg1 now equals 'three'
                res.write(data);
                res.end()
                callback(null, 'done');
              }
              ],
              function (err, result) {
                // result now equals 'done'
              });


            } else {

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
