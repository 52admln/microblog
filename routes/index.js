var express = require('express');
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var router = express.Router();
/* 首页路由 */
router.get('/', function(req, res) {
    Post.get(null, function (err, posts) {
        if(err) {
            posts = [];
        }
        res.render('index', {
            title: '首页',
            posts: posts
        });
    })
});
/* 注册页 GET 路由 */
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', {
        title: '用户注册'
    });
});
/* 注册页 POST 路由 */
router.post('/reg', function(req, res) {
    // 检验用户输入的两次密码是否一样
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', '两次输入的口令不一致');
        return res.redirect('/reg');
    }
    //  生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
            name: req.body.username,
            password: password
        });
    console.log(req.body.username);
        // 检查用户是否存在
    User.get(newUser.name, function(err, user) {
        if (user)
            err = 'Username already exists.';
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }
        console.log("--------------------");
        console.log(err);
        newUser.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success', '注册成功');
            res.redirect('/');
        });
    });
});


/* 登录页 GET 路由 */
router.get('/reg', checkNotLogin);
router.get('/login', function(req, res) {
    res.render('login', {
        title: '用户登入'
    });
});
/* 登录页 POST 路由 */
router.post('/login', function(req, res) {
    // 生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username, function (err, user){
        if(!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        if(user.password != password) {
            req.flash('error', '用户口令错误');
        }
        req.session.user = user;
        req.flash('success', '登入成功');
        res.redirect('/');
    });
});
/* 登出页面路由 */
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});

/* 用户页面 GET 路由 */
router.get('/u/:user', function(req, res) {
    User.get(req.params.user, function (err, user){
        if(!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        Post.get(user.name, function (err, posts){
            if(err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts
            })
        })
    })
});
/* 发表微博 POST 路由*/
router.post('/post', checkNotLogin);
router.post('/post', function(req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post);
    console.log(currentUser);
    console.log(req.body.post);
    post.save(function (err) {
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发表成功');
        res.redirect('/u/' + currentUser.name);
    });
});


// 检查用户是否已登录
function checkNotLogin(req, res, next){
    if(!req.session.user){
        req.flash('error', '已登入');
        return res.redirect('/');
    }
    next();
}



module.exports = router;
