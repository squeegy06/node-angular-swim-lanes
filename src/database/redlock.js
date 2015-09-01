var redis = require('./redis');
var Redlock = require('redlock');

var redlock = new Redlock([redis], {
	driftFactor: 0.01,
	retryCount: 3,
	retryDelay: 200
});

module.exports = redlock;