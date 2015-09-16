var redis = require('./redis');
var redlock = require('./redlock');
var uuid = require('uuid');

var defaults = {
	key: 'task',
	defaultRank: 0
};

function Task(obj, options) {
	
	options = options || {};
	
	this.defaultRank = options.defaultRank || defaults.defaultRank;
	if(this.defaultRank % 1 !== 0)
		throw new Error('Value of defaultRank must be an integer.');
		
	this.defaultGroup = options.defaultGroup || defaults.defaultGroup;
	
	//If this task doesn't have an id, give it one.
	if(typeof obj.id !== 'string')
		obj.id = uuid.v4();
	
	this.task = obj;
	
	var keyPrefix = options.key || defaults.key;
	this.key = "__" + keyPrefix + "__" + this.task.id;
}