var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

// module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}, {safe: true}));
// 新版本 手动指定端口号
module.exports = new Db(settings.db, new Server(settings.host,'27017', {}), {safe: true});
