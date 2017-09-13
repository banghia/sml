var express = require('express');
var db = require('../modules/db_sml');
var md5 = require('md5');
var rsa = require('../modules/rsa');
var router = express.Router();

router.post('/', function(req, res, next) {
    var params = req.body;
    if(!params.account || !params.password){
        res.json({
            statusCode: 0,
            err: "Missing info"
        });
        return;
    }
    db.query("SELECT * FROM accounts WHERE AccUserName=? OR AccEmail=?",
        [params.account,params.account],
        function (err, result, fields) {
            if(err || !result.length){
                res.json({
                    statusCode: 0,
                    err: "Account not exist"
                });
                return;
            }
            var userInfo = result[0];
            if(userInfo.AccPassword!=md5(params.password)){
                res.json({
                    statusCode: 0,
                    err: "Password fail"
                });
                return;
            }
            var userEncrypted = rsa.encrypt({
                AccId: userInfo.AccId,
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
                    AccId: userInfo.AccId,
                    AccUserName: userInfo.AccUserName,
                    AccEmail: userInfo.AccEmail,
                    AccDisplayName: userInfo.AccDisplayName,
                    AccEnableNotify: userInfo.AccEnableNotify,
                    AccAllowSearch: userInfo.AccAllowSearch
                }
            });
            return;
        });
});

module.exports = router;