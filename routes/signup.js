var express = require('express');
var http = require('http');
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
            if(data.statusCode){
                resc.redirect("/messages");
            }else {
                resc.render('signup');
            }
        });
    });
});

module.exports = router;
