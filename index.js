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

app.use(express.static(__dirname + '/public'));

//app.set('views', __dirname + '/views');
//app.engine('html', require('ejs').renderFile);
//app.engine('css', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh',saveUninitialized: false,resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view options', { pretty: true });

var sess;

var path = require('path')
app.use(express.static(path.join(__dirname, 'public')));

function formatDate (object) {
    var month = new Array();

    month[0] = "Enero";
    month[1] = "Febrero";
    month[2] = "Marzo";
    month[3] = "Abril";
    month[4] = "Mayo";
    month[5] = "Junio";
    month[6] = "Julio";
    month[7] = "Agosto";
    month[8] = "Septiembre";
    month[9] = "Octubre";
    month[10] = "Noviembre";
    month[11] = "Diciembre";


    return (object != null) ? (object.getDate() + " de " +  month[object.getMonth()] + " " + object.getFullYear()  ) : "" ;
}

function changeValuesWithParseObject(data, classname, object) {
    var re = /%(.*?)%/g;

    while( jsreap = re.exec(data) ) {
        var res2 = jsreap[1].split(":");
        if (res2[0] == classname) {

            if (res2[2] == "image" ) {

                var profilePhoto = object.get(res2[1]);
                var photourlN = "https://browshot.com/static/images/not-found.png";
                var photourl = (profilePhoto.url() ? profilePhoto.url() : photourlN )  ;

                data = data.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", photourl );
            } else if (res2[2] == "date") {

                if (res2[1] == "createdAt" || res2[2] == "updateAt") {
                    data = data.replace("%"+res2[0] + ":" +res2[1] + ":" +res2[2] + "%", formatDate(object.createdAt) );
                } else {
                    data = data.replace("%"+res2[0] + ":" +res2[1] + ":" +res2[2] + "%", formatDate(object.get(res2[1]) ) );
                }

            } else if (res2[2] == "geoPoint") {
            } else {


                if(res2.length < 3) {
                    if (res2[1] == "id") {
                        data = data.replace("%"+res2[0] + ":" +res2[1] + "%", ( object[res2[1]] ? object[res2[1]] : ""  ) );
                    } else {
                        data = data.replace( "%"+ res2[0] + ":" + res2[1]+"%" , ( object.get(res2[1]) ? object.get(res2[1]) : ""  ) );
                    }
                } else {
                    if (res2[1] == "id") {
                        data = data.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", object.get(res2[2])[res2[1]] );
                    } else {
                        data = data.replace("%"+res2[0] + ":" +res2[1] + ":" + res2[2]+ "%", object.get( res2[2]).get(res2[1]) );

                    }
                    
                }


            }
        }
    }

    return data;
}


function getEvents(data, res, callback) {


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
    query.greaterThanOrEqualTo("date", new Date());


    query.find({

        success: function(events) {

            if (events.length == 0) {
                //callback(dataStr);
                res.redirect("/")
                return;
            }


            var repeatCycle = /(%repeat%)(.*?)(%endrepeat%)/g;
            var temp  = "";

            while( jsreap = repeatCycle.exec(dataStr) ) {

                temp = jsreap[2];

            }

            //Repeating cycle


            var tmpsPans = [];

            for (var i = 0; i < events.length; ++i) {

                tmpsPans[i] = changeValuesWithParseObject(temp, classname, events[i]);

            }

            dataStr = dataStr.replace(/(\r\n|\n|\r)/gm,"");

            var repeatSection = /(%repeat%)(.*?)(%endrepeat%)/g;

            dataStr = dataStr.replace(repeatSection , tmpsPans.join("") );




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

function getEvent(eventId, data, res, callback) {


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
    query.equalTo("objectId", eventId);


    query.find({

        success: function(events) {

            if (events.length == 0) {
                //callback(dataStr);
                res.redirect("/")
                return;
            }

            dataStr = changeValuesWithParseObject(dataStr, classname, events[0]);


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
    //query.include();
    query.include(["event", "event.organizer"]);
    query.limit(1);
    if (eventId) {
        query.equalTo("objectId", eventId);
    }

    query.find({
        success: function(events) {

            //data Value
            if (events.length == 0) {callback(dataStr); return;}

            dataStr = changeValuesWithParseObject(data, "Featured", events[0].get("event"));

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

function validateField(regexp, field, errorMessage) {
	return {
		validField: regexp.test(field),
		errorMessage: errorMessage
	};
}

function setSignup(res, formData, callback) {

	var user = new Parse.User();
	var validFields = true;

	user.set("username", formData.username);
	user.set("password", formData.password);
	user.set("email", formData.email);

	// other fields can be set just like with Parse.Object
	user.set("name", formData.name);

	var validName = validateField(/([^\s])/, formData.name, 'Error: Nombre no puede ser vacio');
	var validUsername = validateField(/^[a-zA-Z0-9]+$/, formData.username, 'Error: Solo se aceptan valores alfanumericos para el usuario');
	var validPassword = validateField(/([^\s])/, formData.password, 'Error: Contraseña no puede ser vacia');
	var validEmail = validateField(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm, formData.email, 'Error: Email invalido');

	if (!validUsername.validField) {
		res.write(validUsername.errorMessage);
		validFields = false;
	}

	if (!validName.validField) {
		res.write(validName.errorMessage);
		validFields = false;
	}

	if (!validPassword.validField) {
		res.write(validPassword.errorMessage);
		validFields = false;
	}

	if (!validEmail.validField) {
		res.write(validEmail.errorMessage);
		validFields = false;
	} 

	if(validFields){
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
}

function setLogIn( res, formData, callback) {

    Parse.User.logIn(formData.username, formData.password, {
        success: function(user) {
            // Do stuff after successful login.

            sess.currentUser = Parse.User.current();
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

function getUser (userId, data, res, callback) {
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);
    query.find({
        success: function(users) {
            if (users.length > 0) {
                data = changeValuesWithParseObject(data, "PUser", users[0]);
                callback(data);
            } else {
                res.redirect("/404");
            }
        },
        error: function(error) {
            console.log("Error")
            callback(data);
        }
    });

}

function getUserByUsername (userId, data, res, callback) {
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", userId);
    query.find({
        success: function(users) {
            if (users.length > 0) {
                data = changeValuesWithParseObject(data, "PUser", users[0]);
                callback(data);
            } else {
                res.redirect("/404");
            }
        },
        error: function(error) {
            console.log("Error")
            callback(data);
        }
    });

}

function getTemplate(data,req,res) {
    sess=req.session;

    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

    fs.readFile("template.html", 'utf8', function (err,templateData) {

        async.series(
            [
                function(callback){
                    getCurrentUser(templateData, res, req, function (newdata) { templateData = newdata; callback(null, 'one'); } );
                },
                function(callback){
                    templateData = templateData.replace(/(\r\n|\n|\r)/gm,"");
                    templateData =templateData.replace("%CONTENT%", data);
                    callback(null, 'two');
                },
                function(callback){
                    // arg1 now equals 'three'
                    res.writeHead(200, {"Content-Type": "text/html"})
                    res.write(templateData);
                    res.end();
                    callback(null, 'done');
                }
            ]
        );

    });

}

//Get

//Root
app.get('/', function(req,res){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');


    //res.render('index.html');
    fs.readFile("views/index.html", 'utf8', function (err,data) {

        async.series(
            [function(callback){

                getEvents(data, res, function (newdata) { data = newdata; callback(null, 'one'); } );
            },
             function(callback){
                 getFeaturedEvent(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'two'); } );
             },
             function(callback){
                 getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'three'); } );
             },
             function(callback){
                 // arg1 now equals 'three'
                 getTemplate(data,req,res);

                 callback(null, 'done');
             } ]
        );

    });


});

//Detail Event
app.get('/event/add', function(req,res){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

    fs.readFile("views/addevent.html", 'utf8', function (err,data) {

        async.series(
            [
                function(callback){
                    getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'one'); } );
                },
                function(callback){
                    getTemplate(data,req,res);

                    callback(null, 'done');
                }
            ]
        );


    });


});


app.get('/:type(event|page)/:id', function(req,res, next){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

    fs.readFile("views/" +dir[1] + ".html", 'utf8', function (err,data) {

        async.series([
            function(callback){
                getEvent(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'one'); } );
            },
            function(callback){
                getFeaturedEvent(dir[2], data, res, function (newdata) { data = newdata; callback(null, 'two'); } );
            },
            function(callback){
                getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'three'); } );
            },
            function(callback){
                // arg1 now equals 'three'
                getTemplate(data,req,res);
                callback(null, 'done');
            }
        ]
                    );

    });



});


//Profile
app.get('/:type(user)/:id', function(req,res){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

    fs.readFile("views/profile.html", 'utf8', function (err,data) {

        async.series(
            [
                function(callback){
                    getUserByUsername(dir[2] ,data, res, function (newdata) { data = newdata; callback(null, 'one'); } );
                },
                function(callback){
                    // arg1 now equals 'three'
                    getTemplate(data,req,res);

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

    fs.readFile("views/" + dir[1] + ".html", 'utf8', function (err,data) {


        async.series(
            [
                function(callback){
                    getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'two'); } );
                },
                function(callback){
                    // arg1 now equals 'three'
                    getTemplate(data,req,res);

                    callback(null, 'done');
                }
            ]
        );



    });
});


//Logout
app.get('/logout', function(req,res){
    sess=req.session;

    Parse.User.logOut();

    sess.currentUser = null;
    res.redirect('/');

});


app.get('/404', function(req,res){
    parseado = url.parse(req.url, true);
    dir = parseado.pathname.split('/');

    fs.readFile("views/" + dir[1] + ".html", 'utf8', function (err,data) {


        async.series(
            [
                function(callback){
                    getCurrentUser(data, res, req, function (newdata) { data = newdata; callback(null, 'two'); } );
                },
                function(callback){
                    // arg1 now equals 'three'
                    getTemplate(data,req,res);

                    callback(null, 'done');
                }
            ]
        );



    });

});

//Page not found
app.get('*', function(req,res){
    res.redirect('/404');

});

//Post

//Login
app.post('/login', function(req,res) {
    sess=req.session;
    sess.userReq = req.body;
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

    async.series([
        function(callback){

            setSignup(res, sess.userReq, function () { callback(null, 'one') } )

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
app.post('/event/add', function(req,res) {
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

});
