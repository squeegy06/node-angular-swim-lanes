var redis = require('./redis');
var uuid = require('uuid');

var defaults = {
	key: 'task'
};

function Task(options) {
	
	options = options || {};
		
	this.key = options.key || defaults.key;
	
	if(typeof this.key !== "string")
		throw new Error('Task Key must be of type "string" got "' + typeof this.key + '".');
};

/**
 * Save or update an existing Task.
 */
Task.prototype.save =
Task.prototype.persist = function _persist(task, id, callback) {
	callback = arguments[arguments.length - 1];
	if(typeof callback !== "function")
		throw new Error('Expected final argument to be of type "function" got type "' + typeof callback + '" instead.');
	
	if(typeof task !== "object")
		return callback(new Error('Missing data for Task.'));
		
	if (typeof arguments[1] === "string")
		id = arguments[1];
	else
		id = uuid.v4();
		
	var redisKey = this.makeRedisKey(id);
	
	redis.set(redisKey, JSON.stringify(task), function(err, result){
		if(err)
			return callback(err);
			
		return callback(null, id);
	});
}

/**
 * Retrieve an existing Task's Data.
 */
Task.prototype.get = function _get(id, callback){
	if(typeof id !== "string")
		return callback(new Error('ID must be of type "string" got "' + typeof id + '" instead.'));
		
	var redisKey = this.makeRedisKey(id);
	
	redis.get(redisKey, function(err, result){
		if(err)
			return callback(err);
		
		var obj = null;
		if(result !== null)
			obj = JSON.parse(result);
			
		return callback(null, obj);
	})
};

Member.prototype.remove = 
Member.prototype.delete = function _remove(id, callback){
	if(typeof id !== "string")
		return callback(new Error('ID must be of type "string" got "' + typeof id + '" instead.'));
		
	var redisKey = this.makeRedisKey(id);
	
	redis.del(redisKey, function(err, result){
		if(err)
			return callback(err);
		
		return callback(null);
	});
};

Task.prototype.makeRedisKey = function _makeRedisKey(id){
	return '__' + this.key + '__' + id;
};

module.exports = Task;