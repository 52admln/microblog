// 错误日志记录
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan'); // 4.x
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // 4.x
var partials = require('express-partials'); // 4.x
var session = require('express-session'); // 4.x
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var methodOverride = require('method-override'); // 4.x
var flash = require("connect-flash");
// router
var index = require('./routes/index');

var app = express();
app.listen(3000); // 监听端口号 3000

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

app.set('view options', {
    layout: true
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// error log configuration
app.use(logger('dev'));
app.use(logger("combined",{stream:accessLogfile}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    // cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        db: settings.db,
        // host: settings.host,
        // port: settings.port
        url: 'mongodb://localhost/microblog'
    })
}));
app.use(flash());

// 这个要在 router 上面
// 视图交互：实现用户不同登陆状态下显示不同的页面及显示登陆注册等时的成功和错误等提示信息
app.use(function (req, res, next) {
    console.log("app.usr local");
    //res.locals.xxx实现xxx变量全局化，在其他页面直接访问变量名即可
    //访问session数据：用户信息
    res.locals.user = req.session.user;
    console.log("user:" + req.session.user);
    console.log("error:" + req.session.error);
    //获取要显示错误信息
    var error = req.flash('error'); //获取flash中存储的error信息
    res.locals.error = error.length ? error : null;
    //获取要显示成功信息
    var success = req.flash('success');
    res.locals.success = success.length ? success : null;
    next(); //控制权转移，继续执行下一个app。use()
});

app.use('/', index);

console.log("something happening");


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
