var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, resc, next) {
    resc.cookie('access-token', "", {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    resc.redirect("/");
});

module.exports = router;
