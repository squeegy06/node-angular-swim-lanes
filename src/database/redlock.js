var redis = require('./redis');
var Redlock = require('redlock');

var redlock = new Redlock([redis], {
	driftFactor: 0.01,
	retryCount: 10,
	retryDelay: 400
});

module.exports = redlock;