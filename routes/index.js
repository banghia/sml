var express = require('express');
var http = require('http');
var db = require('../modules/db_sml');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, resc, next) {
    console.log(req.headers.cookie);
    http.get({
        path: "/api/user",
        port: 3000,
        headers: {'Cookie': req.headers.cookie||""}
    },function (res) {
        res.on('data',function (data) {
            data = JSON.parse(data);
            resc.render('index', { statusCode: data.statusCode });
        });
    });
});

router.get('/*.sml', function(req, resc, next) {
    var path = req.originalUrl;
    var username = path.slice(1,path.length-4);
    db.query("SELECT AccUserName FROM accounts WHERE AccUserName='"+username+"'",
        function (err, result, fields) {
           if(err || !result.length){
               return;
           }
            resc.render('chatbox',{username: username});
        });
});

module.exports = router;
