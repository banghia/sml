var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var signUp = require('./routes/signup');
var signIn = require('./routes/singin');
var signOut = require('./routes/signout');
var post = require('./routes/post');
var messages = require('./routes/messages');
var apiSignup = require('./routes/api-signup');
var apiSignin = require('./routes/api-signin');
var apiUser = require('./routes/api-user');
var apiAnony = require('./routes/api-anony');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/account/signup', signUp);
app.use('/account/signin', signIn);
app.use('/account/signout', signOut);
app.use('/post', post);
app.use('/messages', messages);
app.use('/api/signup', apiSignup);
app.use('/api/signin', apiSignin);
app.use('/api/user', apiUser);
app.use('/api/anony', apiAnony);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
