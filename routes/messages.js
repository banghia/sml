var express = require('express');
var http = require('http');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, resc, next) {
    http.get({
        path: "/api/user",
        port: 3000,
        headers: {'Cookie': req.headers.cookie||""}
    },function (res) {
        res.on('data',function (data1) {
            data1 = JSON.parse(data1);
            if(data1.statusCode){
                http.get({
                    path: "/api/user/posts",
                    port: 3000,
                    headers: {'Cookie': req.headers.cookie||""}
                },function (res) {
                    res.on('data',function (data) {
                        data = JSON.parse(data);
                        if(data.statusCode){
                            resc.render('messages',{username: data1.user.AccUserName ,posts: data.posts});
                        }else {
                            resc.redirect("/");
                        }
                    });
                });
            }else {
                resc.redirect("/");
            }
        });
    });
});

module.exports = router;
