var express = require("express");
var path = require("path");
//var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require('express-session');
var MangoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var routes = require("./routes/index");
var settings = require("./settings");

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: settings.cookieSecret,
	name: settings.db,
	cookie: {MaxAge: 100 * 60 * 60 * 24},
	resave: true,
	saveUninitialized: false,
	store: new MangoStore({
		url: 'mongodb://localhost/blog'
	})
}));

app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json(settings.cookieSecret));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

app.listen(app.get('port'), function(){
	console.log('Express server listening op port '+app.get('port'));
})