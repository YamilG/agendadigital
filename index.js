  var url = require('url');
  var http = require('http');
  var fs = require('fs');
  var replace = require("replace");
  var async = require("async");
  var qs = require('querystring');
  var express = require('express');
  var session		=	require('express-session');
  var bodyParser  	= 	require('body-parser');
  var multer  = require('multer')

  var Parse = require('parse').Parse;


  var parseInit = require(__dirname+"/parsekeys.js");


  //EXPRESS
  var app = express();
  app.use(multer({ dest: './uploads/'}))

  app.set('views', __dirname + '/public');
  app.engine('html', require('ejs').renderFile);
  app.engine('css', require('ejs').renderFile);

  app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  var sess;

  var path = require('path')
  app.use(express.static(path.join(__dirname, 'public')));




  function getEvents(eventId, data, res, callback) {


    var dataStr = data.toString();
    dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

    var re1 = /(%search:)(.*?)%/g;
    var temp  = ""

    //Get Events


    var classname = "Event";

    var eventT = Parse.Object.extend(classname);
    var query = new Parse.Query(eventT);
      query.include("organizer")
      query.ascending("date");
      query.greaterThan("date", new Date());

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
                  else if (res2[2] == "User") {

                  if (events[i].get("organizer") != null) {
                    tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", events[i].get("organizer").get("name") );
                  } else {
                    tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", "" );
                  }

                }
                else {

                  if (res2[0] != "repeat" && res2[0] != "endrepeat") {
                    if (res2[1] == "id") {
                      tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + "%", events[i].id );
                    } else if (res2[1] == "date") {
                    var month = new Array();
                    month[0] = "January";
                    month[1] = "February";
                    month[2] = "March";
                    month[3] = "April";
                    month[4] = "May";
                    month[5] = "June";
                    month[6] = "July";
                    month[7] = "August";
                    month[8] = "September";
                    month[9] = "October";
                    month[10] = "November";
                    month[11] = "December";
                    
                  tmpsPans[i] = tmpsPans[i].replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get(res2[1]) != null ? (events[i].get(res2[1]).getDay() + " de " +  month[events[i].get(res2[1]).getMonth()] + " " + events[i].get(res2[1]).getFullYear()  ): "" );
                    }  else {
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



            }
            else if (res2[1] == "geoPoint") {

              if (events[i].get(res2[0]) != null) {
                dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2] + ":" + res2[3] + "%", events[i].get(res2[1])[res2[2]] );
              }

            }
              else if (res2[2] == "User") {

                  if (events[i].get("organizer") != null) {
                   dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", events[i].get("organizer").get("name") );
                  } else {
                    dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", "" );
                  }

          }
            else {

              //if (res2[1] != "repeat" && res2[1] != "endrepeat") {


              if (res2[1] == "id") {
                dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].id );
              } 
                else if (res2[1] == "date") {
                    var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";
                    
                  dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get(res2[1]) != null ? (events[i].get(res2[1]).getDay() + " de " +  month[events[i].get(res2[1]).getMonth()] ): "" );
              } 
                else {
                if (events[i].get(res2[1]) != null) {
                  dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].get(res2[1]) != null ? events[i].get(res2[1]) : "" );
                }
              }


              //}

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
      query.include("event.organizer");
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
              else if (res2[2] == "User") {

                  if (events[i].get("organizer") != null) {
                   dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", events[i].get("organizer").get("name") );
                  } else {
                    dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", "" );
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

  function setSignup(res, formData, callback) {

    var user = new Parse.User();
    user.set("username", formData.username);
    user.set("password", formData.password);
    user.set("email", formData.email);

    // other fields can be set just like with Parse.Object
    user.set("name", formData.name);


    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
          callback();
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      console.log("Error: " + error.code + " " + error.message);
      res.write("Error: " + error.code + " " + error.message);
      res.end()
    }
  });

  }

  function setLogIn( res, formData, callback) {

      Parse.User.logIn(formData.username, formData.password, {
      success: function(user) {
        // Do stuff after successful login.

          sess.currentUser = Parse.User.current();
          console.log(sess.currentUser);
          callback()

    },
    error: function(user, error) {
      // The login failed. Check error to see why.
      console.log("Error: " + error.code + " " + error.message);
      res.write("Error: " + error.code + " " + error.message);
      res.end()
    }
  });


  }

  function getCurrentUser (data, res, req, callback) {
    sess=req.session;

    var dataStr = data.toString();
    dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

    var classname = "User"
    var currentUser = Parse.User.current();

      var foundRepeat  = false;
    //if (currentUser) {
    if (sess.currentUser) {

      var re1 = /(%if currentuser%)(.*?)(%endif%)/g;
      console.log("··")

      while( currentUserReg = re1.exec(dataStr) ) {

          var re = /%(.*?)%/gi;

        while( jsreap = re.exec(dataStr) ) {

          var res2 = jsreap[1].split(":");

          if (res2[0] == classname ) {


            if (res2[1] == "id") {
              dataStr = tdataStr.replace("%"+res2[0] + ":" +res2[1] + "%", currentUser.id );
            } else {
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%",sess.currentUser[res2[1]]);
            }



          }


        }

        foundRepeat = true;

      }


      if (foundRepeat) {

        //dataStr = dataStr.replace("%if currentuser%", "" );
        //dataStr = dataStr.replace("%endif%", "" );


          var re1 = /(%if currentuser%)/g;
          while( jsreap = re1.exec(dataStr) ) {

              dataStr = dataStr.replace(re1 , "" );

          }



          var re3 = /(%else%)(.*?)(%endif%)/g;
          while( jsreap = re3.exec(dataStr) ) {
              dataStr = dataStr.replace(re3 , "" );
          }



      }


    } else {
      // show the signup or login page

      dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

        var notElse = true;
        var re1 = /(%if currentuser%)(.*?)(%else%)/g;

        while( jsreap = re1.exec(dataStr) ) {
            dataStr = dataStr.replace(re1 , "" );
            notElse = false;
        }

        if (notElse) {
            console.log("notElse");
            var re3 = /(%if currentuser%)(.*?)(%endif%)/g;
          while( jsreap = re3.exec(dataStr) ) {
              dataStr = dataStr.replace(re3 , "" );
          }
        } else {
             var re3 = /(%endif%)/g;
          while( jsreap = re3.exec(dataStr) ) {
              dataStr = dataStr.replace(re3 , "" );
          }
        }

    }

    data = dataStr;

    callback(data);
  }



  //Get

  //Root
  app.get('/', function(req,res){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');


    //res.render('index.html');
    fs.readFile("index.html", 'utf8', function (err,data) {

      async.series(
        [function(callback){
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
          getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'four'); } );
        },
        function(callback){
          // arg1 now equals 'three'
          res.write(data);
          res.end()
          callback(null, 'done');
        } ]
      );

    });


  });

  //Detail Event
  app.get('/:type(event|page)/:id', function(req,res, next){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

      fs.readFile(dir[1] + ".html", 'utf8', function (err,data) {

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
                ]
              );

            });



  });


  app.get('/eventadd', function(req,res){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

      fs.readFile("addevent.html", 'utf8', function (err,data) {
              /*
              res.writeHead(200, {"Content-Type": "text/html"})
              res.write(data);
              res.end()
              */
              async.series(
                  [
                      function(callback){
                          res.writeHead(200, {"Content-Type": "text/html"})
                          callback(null, 'one');
                      },
                      function(callback){
                          getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'two'); } );
                      },
                      function(callback){
                          // arg1 now equals 'three'
                          res.write(data);
                          res.end();
                          callback(null, 'done');
                      }
                  ]
              );


          });


  });

  //All other pages
  app.get(/\/(login|signup)/, function(req,res){

    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

    fs.readFile(dir[1] + ".html", 'utf8', function (err,data) {


        async.series(
                  [
                      function(callback){
                          getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'two'); } );
                      },
                      function(callback){
                          // arg1 now equals 'three'
                          res.writeHead(200, {"Content-Type": "text/html"})
                          res.write(data);
                          res.end()

                          callback(null, 'done');
                      }
                  ]
              );



    });
  });

  //
  app.get('/logout', function(req,res){
      sess=req.session;

      Parse.User.logOut();

      sess.currentUser = null;
      res.redirect('/');

  });

  app.get('/index', function(req,res){
    sess=req.session;
    if(sess.email)
    {
      res.write('<h1>Hello '+sess.email+'</h1><br>');
      res.end('<a href='+'/logout'+'>Logout</a>');
    }
    else
    {
      res.write('<h1>Please login first.</h1>');
      res.end('<a href='+'/'+'>Login</a>');
    }

  });


  //Post

  //Login
  app.post('/login', function(req,res) {
    sess=req.session;
    sess.userReq = req.body;
    //console.log(requestBody);
    async.series([
      function(callback){
        setLogIn(res, sess.userReq,  function () { callback(null, 'one') } );


      },
      function(callback){

        res.redirect('/');
        callback(null, 'done');
      }
      ]
    );

  });

  //Signup
  app.post('/signup', function(req,res) {
    sess=req.session;
    sess.userReq = req.body;
    //console.log(requestBody);

    async.series([
      function(callback){

        setSignup(res, sess.userReq, function () { callback(null, 'one') } )

        //setLogIn(res, sess.userReq,  function () { callback(null, 'one') } );


      },
      function(callback){
        setLogIn(res, sess.userReq,  function () { callback(null, 'two') } );


      },
      function(callback){

        res.redirect('/');
        callback(null, 'done');
      }
      ]
    );

  });

  //Signup
  app.post('/eventadd', function(req,res) {
    sess=req.session;
    sess.userReq = req.body;

      var userPA = "";

      //var currentUser = Parse.User.current();
      var banner = "";
      var bannerMini = "";

      async.series([
          function(callback){

          var query = new Parse.Query(Parse.User);
          query.equalTo("username", sess.currentUser.username);  // find all the women
          query.find({
              success: function(userP) {
                  // Do stuff
                  userPA = userP[0];
                  console.log("!!!!");
                  console.log(userPA);
                  callback(null, 'one')
              }
          });



      },

      function(callback){

          fs.readFile(req.files.bannerMini.path, function (err, data) {
              if (err) throw err;

              var file = new Buffer(data).toString('base64')
              var name = "bannerMini.jpg";

              bannerMini = new Parse.File(name, { base64: file });

              bannerMini.save().then(function() {
                  callback(null, 'two')
              } , function(error) {
                  // The file either could not be read, or could not be saved to Parse.
                  console.log("Error: "+error.message);
              });
          });



      },
      function(callback){

          fs.readFile(req.files.banner.path, function (err, data) {
          if (err) throw err;

          var file = new Buffer(data).toString('base64')
          var name = "banner.jpg";

          banner = new Parse.File(name, { base64: file });

          banner.save().then(function() {
              callback(null, 'three')

          }, function(error) {
              // The file either could not be read, or could not be saved to Parse.
              console.log("Error: "+error.message);
          });

          });



      },
      function(callback){

          // The file has been saved to Parse.
              var eventParse = Parse.Object.extend("Event");
              var event = new eventParse();

              event.set("name", req.body.name);
              event.set("description", req.body.description);
              event.set("eventBriteUrl", req.body.eventurl);
              event.set("date", new Date(req.body.year, Number(req.body.month) -1, req.body.day, 0,0,0,0) );
              event.set("banner", banner);
              event.set("bannerMini", bannerMini);
              event.set("organizer", userPA);

              event.save(null, {
                success: function(eventSaved) {
                  // Execute any logic that should take place after the object is saved.
                  console.log('New object created with objectId: ' + eventSaved.id);
                    res.redirect('/');
                    callback(null, 'done');
                },
                error: function(gameScore, error) {
                  // Execute any logic that should take place if the save fails.
                  // error is a Parse.Error with an error code and message.
                  console.log('Failed to create new object, with error code: ' + error.message);
                }
              });



      }
      ]
    );


  });



  app.listen( (process.env.PORT || 5000) ,function(){
    console.log("Hello Cruel World");
    console.log("Node app is running at localhost: 5000");

    Parse.initialize(parseInit.appKeys.appid, parseInit.appKeys.jsid);

      /*
      fs.readFile("uploads/c217e352c9abad5d721e23d5ed3e8deb.png", function (err, data) {
      if (err) throw err;

      var file = "data: image/jpeg ;base64," + new Buffer(data).toString('base64')
      console.log(file);
      var name = "photo.jpg";

      var bannerFile = new Parse.File(name, { base64: file });

      });
      */
  });
