var nodeRSA = require('node-rsa');
var key = new nodeRSA({b: 512});

module.exports = key;