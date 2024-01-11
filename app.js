var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config()
require('./mongodb/connection')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var populateRouter = require('./routes/populate');

var app = express();

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/populate', populateRouter);

//require ('./discord/old_connectBot')
require('./discord/index');

module.exports = app;
