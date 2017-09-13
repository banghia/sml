var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '1adgjmptw',
    database        : 'db_sml'
});

module.exports = pool;