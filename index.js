var url = require('url');
var http = require('http');
var fs = require('fs');
var replace = require("replace");
var async = require("async");
var qs = require('querystring');
var express = require('express');
var session		=	require('express-session');
var bodyParser  	= 	require('body-parser');
var Parse = require('parse').Parse;

var parseInit = require(__dirname+"/parsekeys.js");


//EXPRESS
var app = express();

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



          }
          else if (res2[1] == "geoPoint") {

            if (events[i].get(res2[0]) != null) {
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2] + ":" + res2[3] + "%", events[i].get(res2[1])[res2[2]] );
            }

          }
          else {

            //if (res2[1] != "repeat" && res2[1] != "endrepeat") {


            if (res2[1] == "id") {
              dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%", events[i].id );
            } else {
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

function setSignup(res, formData, callback) {


  //res.writeHead(200, {'Content-Type': 'text/html'});

  //var dataStr = data.toString();
  //dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");



  var user = new Parse.User();
  user.set("username", formData.username);
  user.set("password", formData.password);
  user.set("email", formData.email);

  // other fields can be set just like with Parse.Object
  user.set("name", formData.name);


  user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now.
      /*
      var re = /%(.*?)%/g;
      var i = 0;

      while( jsreap = re.exec(dataStr) ) {
      var res2 = jsreap[1].split(":");

      dataStr = dataStr.replace("%"+res2[0] +"%", formData[res2[0]] != null ? formData[res2[0]] : "" );

    }
    */
    //res.write(dataStr);
    //res.end()

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
  //sess=req.session;

  //res.writeHead(200, {'Content-Type': 'text/html'});

  //var dataStr = data.toString();
  //dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");


  Parse.User.logIn(formData.username, formData.password, {
    success: function(user) {
      // Do stuff after successful login.
      var re = /%(.*?)%/g;
      var i = 0;

      /*
      while( jsreap = re.exec(dataStr) ) {
      var res2 = jsreap[1].split(":");

      dataStr = dataStr.replace("%"+res2[0] +"%", user.get(res2[0]) != null ? user.get(res2[0]) : "" );

    }
    */
    sess.currentUser = Parse.User.current();
    console.log(sess.currentUser);
    callback()

    //res.write(dataStr);
    //res.end()


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

  //if (currentUser) {
  if (sess.currentUser) {

    var re1 = /(%if currentuser%)(.*?)(%endif%)/g;
    var foundRepeat  = "";

    foundRepeat
    while( jsreap = re1.exec(dataStr) ) {

      foundRepeat = true;

    }


    if (foundRepeat) {

      dataStr = dataStr.replace("%if currentuser%", "" );
      dataStr = dataStr.replace("%endif%", "" );

      var re = /%(.*?)%/gi;

      while( jsreap = re.exec(dataStr) ) {

        var res2 = jsreap[1].split(":");

        if (res2[0] == classname ) {


          if (res2[1] == "id") {
            dataStr = tdataStr.replace("%"+res2[0] + ":" +res2[1] + "%", currentUser.id );
          } else {
            dataStr = dataStr.replace("%"+res2[0] + ":" +res2[1] + "%",sess.currentUser.name);
          }



        }


      }




    }


  } else {
    // show the signup or login page

    dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

    var re1 = /(%if currentuser%)(.*?)(%endif%)/g;
    while( jsreap = re1.exec(dataStr) ) {

      dataStr = dataStr.replace(re1 , "" );

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

//All other pages
app.get(/\/(login|signup)/, function(req,res){

  parseado = url.parse(req.url, true);
  dir = parseado.pathname.split('/');

  console.log("OKA");
  fs.readFile(dir[1] + ".html", 'utf8', function (err,data) {

    res.writeHead(200, {"Content-Type": "text/html"})
    res.write(data);
    res.end()

  });
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




  //});


  //sess.email=req.body.username;
  //res.end('done');
});



app.listen( (process.env.PORT || 5000) ,function(){
  console.log("Hello Cruel World");
  console.log("Node app is running at localhost: 5000");

  Parse.initialize(parseInit.appKeys.appid, parseInit.appKeys.jsid);

});
