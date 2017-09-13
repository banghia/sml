var express = require('express');
var http = require('http');
var router = express.Router();

/* GET home page. */
router.get('/rd_*', function(req, resc, next) {
    var path = req.originalUrl;
    var random = path.slice(9);
    http.get({
        path: "/api/anony/post?random="+random,
        port: 3000,
        headers: {'Cookie': req.headers.cookie||""}
    },function (res) {
        res.on('data',function (data) {
            data = JSON.parse(data);
            if(data.statusCode){
                resc.render('comments', { post: data.post, comments: data.comments });
            }else {
                resc.send("khong ton tai");
                console.log(data);
            }
        });
    });
});

module.exports = router;
