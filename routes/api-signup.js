var express = require('express');
var db = require('../modules/db_sml');
var md5 = require('md5');
var rsa = require('../modules/rsa');
var router = express.Router();

router.post('/', function(req, res, next) {
    var params = req.body;
    if(!params.email || !params.username || !params.password || !params.displayname){
        res.json({
           statusCode: 0,
           err: "Missing info"
        });
        return;
    }
    console.log(params.username);
    if(!/([a-z]|[A-Z]|[0-9]){5,15}/.test(params.username)){
        res.json({
            statusCode: 0,
            err: "Username fail"
        });
        return;
    }
    if(!/([a-z]|[A-Z]|[0-9]){5,15}/.test(params.password)){
        res.json({
            statusCode: 0,
            err: "Password fail"
        });
        return;
    }
    if(!/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/igm.test(params.email)){
        res.json({
            statusCode: 0,
            err: "Email fail"
        });
        return;
    }
    db.query("SELECT AccEmail FROM accounts WHERE AccEmail = '"+params.email+"'",function (err, result, fields) {
       if(err || result.length){
           res.json({
               statusCode: 0,
               err: "Email existed"
           });
           return;
       }
        db.query("SELECT AccUserName FROM accounts WHERE AccUserName = '"+params.username+"'",function (err, result, fields) {
            if(err || result.length){
                res.json({
                    statusCode: 0,
                    err: "Username existed"
                });
                return;
            }
            db.query("INSERT INTO `db_sml`.`accounts`(`AccUserName`, `AccEmail`, `AccPassword`, `AccDisplayName`, `AccPhotoAddress`, `AccEnableNotify`, `AccAllowSearch`) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [params.username,params.email,md5(params.password),params.displayname,params.photoaddress||"",params.notify?1:0,params.search?1:0],
                function (err, result, fields) {
                    if(err){
                        console.log(err);
                        res.json({
                            statusCode: 0,
                            err: "Signup fail"
                        });
                        return;
                    }
                    var userEncrypted = rsa.encrypt({
                        AccId: result.insertId,
                        AccPassword: md5(params.password)
                    }, 'base64');
                    res.cookie('access-token', userEncrypted, {
                        expires: new Date(Date.now() + 900000),
                        httpOnly: true
                    });
                    res.json({
                        statusCode: 1,
                        "access-token": userEncrypted,
                        user: {
                            AccId: result.insertId,
                            AccUserName: params.username,
                            AccEmail: params.email,
                            AccDisplayName: params.displayname,
                            AccEnableNotify: params.notify?1:0,
                            AccAllowSearch: params.search?1:0
                        }
                    });
                    return;
                }
            );
        });
    });
});

module.exports = router;