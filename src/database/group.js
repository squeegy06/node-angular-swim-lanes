var redis = require('./redis');
var redlock = require('./redlock');

var defaults = {
	key: 'group',
	defaultRank: 0
};


function Group (options){
	options = options || {};
	
	this.defaultRank = options.defaultRank || defaults.defaultRank;
	if(typeof this.defaultRank !== "number")
		throw new Error('Type of Default Rank must be "number" got "' + typeof this.defaultRank + '".');

	this.key = options.key || defaults.key;
	
	if(typeof this.key !== "string")
		throw new Error('Member Key must be of type "string" got "' + typeof this.key + '".');
	
	this.memberKey = options.memberKey || null;
};

// Get all the members of a group.
Group.prototype.getMembers = function _getMembers(id, callback){
	if(typeof id !== "string")
		return callback(new Error('Type of ID must be "string" got "' + typeof id + '".'));

	var redisKey = this.makeRedisKey(id);
	
	redis.zrange(redisKey, '0', '-1', function(err, result){
		if(err)
			return callback(err);
			
		return callback(null, result);
	});
};

// Add/Update a member of a group.
Group.prototype.update =
Group.prototype.add = function _add(id, memberid, rank, callback){
	var self = this;
	
	callback = arguments[arguments.length - 1];
	if(typeof callback !== "function")
		throw new Error('Expected final argument to be of type "function" got type "' + typeof callback + '" instead.');
		
	if(typeof id !== "string")
		return callback(new Error('Type of ID must be "string" got "' + typeof id + '".'));
	
	if(typeof memberid !== "string")
		return callback(new Error('Type of Member ID be "string" got "' + typeof memberid + '".'));
		
	if (typeof rank !== "number")
		rank = self.defaultRank;
		
	var redisKey = this.makeRedisKey(id);
		
	//Update it's rank.
	redis.zadd(redisKey, rank, memberid, function(err, result){
		if(err)
			return callback(err);
			
		return callback(null);
	});
};

// Remove a Member from a group.
Group.prototype.remove = function _remove(id, memberid, callback){
	if(typeof id !== "string")
		return callback(new Error('Type of ID must be "string" got "' + typeof id + '".'));
	
	if(typeof memberid !== "string")
		return callback(new Error('Type of Member ID be "string" got "' + typeof memberid + '".'));
		
	var redisKey = this.makeRedisKey(id);
	
	redis.zrem(redisKey, memberid, function(err){
		if(err)
			return callback(err);
			
		return callback(null);
	});
};

// Empty a Group of all members.
Group.prototype.clear =
Group.prototype.reset = function _reset(id, callback){
	if(typeof id !== "string")
		return callback(new Error('Type of ID must be "string" got "' + typeof id + '".'));
	
	var redisKey = this.makeRedisKey(id);
	
	redis.zremrangebyrank(redisKey, 0, -1, function(err){
		if(err)
			return callback(err);
			
		return callback(null);
	});
}

// Delete a group.
Group.prototype.delete = function _delete(id, callback){
	if(typeof id !== "string")
		return callback(new Error('Type of ID must be "string" got "' + typeof id + '".'));
	
	var redisKey = this.makeRedisKey(id);
	
	redis.del(redisKey, function(err){
		if(err)
			return callback(err);
			
		return callback(null);
	});
};

Group.prototype.makeRedisKey = function _makeRedisKey(id){
	return '__' + this.key + '__' + id;
};

module.exports = Group;