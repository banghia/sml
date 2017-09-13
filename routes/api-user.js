var express = require('express');
var db = require('../modules/db_sml');
var md5 = require('md5');
var rsa = require('../modules/rsa');
var randomstring = require("randomstring");
var datetime = require('node-datetime');
var router = express.Router();
//get info user
router.get('/', function(req, res, next) {
    var accessToken = req.cookies["access-token"] || req.body["access-token"];
    if(!accessToken && req.query["access-token"])
        accessToken = req.query["access-token"].replace(/\s/g,"+");
    console.log(accessToken);
    if(!accessToken){
        res.json({
            statusCode: 0,
            err: "Not access token"
        });
        return;
    }
    var userDecrypted = "";
    try{
        userDecrypted = JSON.parse(rsa.decrypt(accessToken, 'utf8'));
    }catch (err){
        res.json({
            statusCode: 0,
            err: "Access token fail"
        });
        return;
    }
    var range = {
        start: req.query.start || req.body.start,
        end: req.query.end || req.body.end
    }
    db.query("SELECT * FROM accounts WHERE AccId=? AND AccPassword=? ",
        [userDecrypted.AccId,userDecrypted.AccPassword],
        function (err, result,  fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Access token fail"
                });
                return;
            }
            res.json({
                statusCode: 1,
                "access-token": accessToken,
                user: {
                    AccId: result[0].AccId,
                    AccUserName: result[0].AccUserName,
                    AccEmail: result[0].AccEmail,
                    AccDisplayName: result[0].AccDisplayName,
                    AccEnableNotify: result[0].AccEnableNotify,
                    AccAllowSearch: result[0].AccAllowSearch
                }
            });
        });
});
//get all comment user
router.get('/posts', function(req, res, next) {
    var accessToken = req.cookies["access-token"] || req.body["access-token"];
    if(!accessToken && req.query["access-token"])
        accessToken = req.query["access-token"].replace(/\s/g,"+");
    console.log(accessToken);
    if(!accessToken){
        res.json({
            statusCode: 0,
            err: "Not access token"
        });
        return;
    }
    var userDecrypted = "";
    try{
        userDecrypted = JSON.parse(rsa.decrypt(accessToken, 'utf8'));
    }catch (err){
        res.json({
            statusCode: 0,
            err: "Access token fail"
        });
        return;
    }
    console.log(userDecrypted.AccPassword);
    db.query("SELECT AccId FROM accounts WHERE AccId=? AND AccPassword=?",
        [userDecrypted.AccId,userDecrypted.AccPassword],
        function (err, result,  fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Access token fail"
                });
                return;
            }
            var range = {
                start: req.query.start || req.body.start,
                end: req.query.end || req.body.end
            }
            if(/[0-9]+/.test(range.start) && /[0-9]+/.test(range.end)){
                db.query("SELECT PId, FromAccId, ToAccId, PContent, DATE_FORMAT(PDate, '%d/%m/%Y %H:%i') as PDate FROM posts WHERE ToAccId=? ORDER BY Pdate DESC LIMIT ?,?",
                    [userDecrypted.AccId,parseInt(range.start),parseInt(range.end)],
                    function (err, result, fields) {
                        if(err){
                            res.json({
                                statusCode: 0,
                                err: "Get posts fail"
                            });
                            console.log(err);
                            return;
                        }
                        res.json({
                            statusCode: 1,
                            AccId: userDecrypted.AccId,
                            start: range.start,
                            end: range.end,
                            posts: result
                        });
                    });
            }else{
                db.query("SELECT PId, FromAccId, ToAccId, PContent, PRandom, DATE_FORMAT(PDate, '%d/%m/%Y %H:%i') as PDate FROM posts WHERE ToAccId="+userDecrypted.AccId+" ORDER BY Pdate DESC",
                    function (err, result, fields) {
                        if(err){
                            res.json({
                                statusCode: 0,
                                err: "Get posts fail"
                            });
                            return;
                        }
                        res.json({
                            statusCode: 1,
                            AccId: userDecrypted.AccId,
                            posts: result
                        });
                    });
            }
        });
});

//send post by user
router.post('/posts', function(req, res, next) {
    var accessToken = req.cookies["access-token"] || req.body["access-token"];
    if(!accessToken && req.query["access-token"])
        accessToken = req.query["access-token"].replace(/\s/g,"+");
    console.log(accessToken);
    if(!accessToken){
        res.json({
            statusCode: 0,
            err: "Not access token"
        });
        return;
    }
    var userDecrypted = "";
    try{
        userDecrypted = JSON.parse(rsa.decrypt(accessToken, 'utf8'));
    }catch (err){
        res.json({
            statusCode: 0,
            err: "Access token fail"
        });
        return;
    }
    db.query("SELECT AccId FROM accounts WHERE AccId=? AND AccPassword=?",
        [userDecrypted.AccId,userDecrypted.AccPassword],
        function (err, result,  fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Access token fail"
                });
                return;
            }
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
                   db.query("INSERT INTO `db_sml`.`posts`(`FromAccId`, `ToAccId`, `PContent`, `PRandom`, `PCode`, `PPass`, `PDate`) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       [userDecrypted.AccId,parseInt(accId),params.content, pRandom, params.code||"",params.pass||"",datetime.create().format("Y/m/d H:M:S").toString()],
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
});

//get all comments by postid
router.get('/comments', function(req, res, next) {
    var accessToken = req.cookies["access-token"] || req.body["access-token"];
    if(!accessToken && req.query["access-token"])
        accessToken = req.query["access-token"].replace(/\s/g,"+");
    console.log(accessToken);
    if(!accessToken){
        res.json({
            statusCode: 0,
            err: "Not access token"
        });
        return;
    }
    var userDecrypted = "";
    try{
        userDecrypted = JSON.parse(rsa.decrypt(accessToken, 'utf8'));
    }catch (err){
        res.json({
            statusCode: 0,
            err: "Access token fail"
        });
        return;
    }
    console.log(userDecrypted.AccPassword);
    db.query("SELECT AccId FROM accounts WHERE AccId=? AND AccPassword=?",
        [userDecrypted.AccId,userDecrypted.AccPassword],
        function (err, result,  fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Access token fail"
                });
                return;
            }
            var postid = req.query.postid || req.body.postid;
            if(!postid){
                res.json({
                    statusCode: 0,
                    err: "Missing postid"
                });
                return;
            }
            var range = {
                start: req.query.start || req.body.start,
                end: req.query.end || req.body.end
            }
            if(/[0-9]+/.test(range.start) && /[0-9]+/.test(range.end)){
                db.query("SELECT CId, CContent, CIsSelf FROM comments INNER JOIN posts ON comments.PId = posts.PId WHERE posts.PId = ? AND ToAccId=? LIMIT ?,?",
                    [parseInt(postid),userDecrypted.AccId,parseInt(range.start),parseInt(range.end)],
                    function (err, result, fields) {
                        console.log(err);
                        if (err) {
                            res.json({
                                statusCode: 0,
                                err: "Get all comment fail"
                            });
                            return;
                        }
                        res.json({
                            statusCode: 1,
                            PId: postid,
                            comments: result
                        });
                    });
            }else {
                db.query("SELECT CId, CContent, CIsSelf FROM comments INNER JOIN posts ON comments.PId = posts.PId WHERE posts.PId = ? AND ToAccId=?",
                    [parseInt(postid),userDecrypted.AccId],
                    function (err, result, fields) {
                        console.log(err);
                        if (err) {
                            res.json({
                                statusCode: 0,
                                err: "Get all comment fail"
                            });
                            return;
                        }
                        res.json({
                            statusCode: 1,
                            PId: postid,
                            comments: result
                        });
                    });
            }
        });
});

//send comment to postid by user
router.post('/comments', function(req, res, next) {
    var accessToken = req.cookies["access-token"] || req.body["access-token"];
    if(!accessToken && req.query["access-token"])
        accessToken = req.query["access-token"].replace(/\s/g,"+");
    console.log(accessToken);
    if(!accessToken){
        res.json({
            statusCode: 0,
            err: "Not access token"
        });
        return;
    }
    var userDecrypted = "";
    try{
        userDecrypted = JSON.parse(rsa.decrypt(accessToken, 'utf8'));
    }catch (err){
        res.json({
            statusCode: 0,
            err: "Access token fail"
        });
        return;
    }
    db.query("SELECT AccId FROM accounts WHERE AccId=? AND AccPassword=?",
        [userDecrypted.AccId,userDecrypted.AccPassword],
        function (err, result,  fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Access token fail"
                });
                return;
            }
            var postid = req.query.postid || req.body.postid;
            var content = req.body.content;
            if(!postid || !content){
                res.json({
                    statusCode: 0,
                    err: "Missing postid or content"
                });
                return;
            }
            db.query("SELECT PId FROM posts WHERE ToAccId = ? AND PId= ?",
                [userDecrypted.AccId,parseInt(postid)],
                function (err, result, fields) {
                    if(err || !result.length){
                        res.json({
                            statusCode: 0,
                            err: "Post not exist"
                        });
                        return;
                    }
                    db.query("INSERT INTO `db_sml`.`comments`(`PId`, `CContent`, `CIsSelf`) VALUES (?, ?, 1)",
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
});

module.exports = router;