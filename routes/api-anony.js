var express = require('express');
var db = require('../modules/db_sml');
var md5 = require('md5');
var randomstring = require("randomstring");
var datetime = require('node-datetime');
var router = express.Router();

//anony get post
router.get('/post', function(req, res, next) {
    var pRandom = req.query.random;
    if(!pRandom) {
        res.json({
            statusCode: 0,
            err: "Missing random code"
        });
        return;
    }
    db.query("SELECT PId,PContent,DATE_FORMAT(PDate,'%m/%d/%Y %H:%i') as PDate FROM posts WHERE PRandom=?",
        [pRandom],
        function (err, result, fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Random fail"
                });
                return;
            }
            var post = result[0];
            db.query("SELECT * FROM comments WHERE PId="+post.PId,function (err, result, fields) {
                res.json({
                    statusCode: 1,
                    post: post,
                    comments: result
                });
            });
        });
});
router.post('/post-code', function(req, res, next) {
    var pCode = req.body.code || req.query.code;
    var pPass = req.body.password || req.query.password;
    if(!pCode){
        res.json({
            statusCode: 0,
            err: "Missing code"
        });
        return;
    }
    console.log([pCode,pPass]);
    db.query("SELECT PId,PContent,DATE_FORMAT(PDate,'%m/%d/%Y %H:%i') as PDate FROM posts WHERE PCode=? AND PPass=?",
        [pCode,pPass?md5(pPass):""],
        function (err, result, fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Code or Pass fail"
                });
                return;
            }
            var post = result[0];
            db.query("SELECT * FROM comments WHERE PId="+post.PId,function (err, result, fields) {
                res.json({
                    statusCode: 1,
                    post: post,
                    comments: result
                });
            });
        });
});

//send post by anony
router.post('/post', function(req, res, next) {
    var params = req.body;
    params.account = params.account || req.query.account;
    console.log(params.account);
    if(!params.account || !params.content){
        res.json({
            statusCode: 0,
            err: "Missing info"
        });
        return;
    }
    db.query("SELECT AccId FROM accounts WHERE AccId=? OR AccUserName=?",
        [params.account, params.account],
        function (err, result, fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Account Id not existed"
                });
                return;
                console.log(err);
            }
            var accId = result[0].AccId;
            var pRandom = randomstring.generate(32);
            db.query("INSERT INTO `db_sml`.`posts`(`ToAccId`, `PContent`, `PRandom`, `PCode`, `PPass`, `PDate`) VALUES (?, ?, ?, ?, ?, ?)",
                [parseInt(accId),params.content, pRandom, params.code||"",params.pass?md5(params.pass):"",datetime.create().format("Y/m/d H:M:S").toString()],
                function (err, result, fields) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json({
                        statusCode: 1,
                        post:{
                            PId: result.insertId,
                            PContent: params.content,
                            PRandom: pRandom,
                            PCode: params.code
                        }
                    });
                }
            );
        });
});

//send comment to postid by anony
router.post('/comments', function(req, res, next) {
    var postid = req.query.postid || req.body.postid;
    var content = req.body.content;
    if(!postid || !content){
        res.json({
            statusCode: 0,
            err: "Missing postid or content"
        });
        return;
    }
    db.query("SELECT PId FROM posts WHERE PId= ?",
        [parseInt(postid)],
        function (err, result, fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Post not exist"
                });
                return;
            }
            db.query("INSERT INTO `db_sml`.`comments`(`PId`, `CContent`, `CIsSelf`) VALUES (?, ?, 0)",
                [parseInt(postid),content],
                function (err, result, fields) {
                    if (err) {
                        res.json({
                            statusCode: 0,
                            err: "Comment fail"
                        });
                        return;
                    }
                    db.query("UPDATE posts SET PDate = ? WHERE PId = ?",
                        [datetime.create().format("Y/m/d H:M:S").toString(),parseInt(postid)],function (err, result, fields) {

                        });
                    res.json({
                        statusCode: 1,
                        pId: postid,
                        cId: result.insertId,
                        cContent: content
                    });
                });
        });
});

module.exports = router;
