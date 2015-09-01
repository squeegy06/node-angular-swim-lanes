var Redis = require('ioredis');
var redis = new Redis({
	port: 6379,
	host: '127.0.0.1'
});

module.exports = redis;