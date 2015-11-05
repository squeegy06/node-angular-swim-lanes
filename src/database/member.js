var redis = require('./redis');
var uuid = require('uuid');

var defaults = {
	key: 'member'
};

/**
 * Member
 */
function Member(options)
{
	options = options || {};

	this.key = options.key || defaults.key;
	
	if(typeof this.key !== "string")
		throw new Error('Member Key must be of type "string" got "' + typeof this.key + '".');
}

/**
 * Save a new or update a existing member.
 */
Member.prototype.save = 
Member.prototype.persist = function _persist(member, id, callback) {
	callback = arguments[arguments.length - 1];
	if(typeof callback !== "function")
		throw new Error('Expected final argument to be of type "function" got type "' + typeof callback + '" instead.');
	
	if(typeof member !== "object")
		return callback(new Error('Missing data for Member.'));
		
	if (typeof arguments[1] === "string")
		id = arguments[1];
	else
		id = uuid.v4();
		
	var redisKey = this.makeRedisKey(id);
	
	redis.set(redisKey, JSON.stringify(member), function(err, result){
		if(err)
			return callback(err);
			
		return callback(null, id);
	});
};

/**
 * Retrieve an existing Member's Data.
 */
Member.prototype.get = function _get(id, callback){
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

//Search for members
Member.prototype.search = function _search(id, callback){
	if(typeof id !== "string")
		return callback(new Error('Type of ID must be "string" got "' + typeof id + '".'));
		
	var redisKeyBase = this.makeRedisKey('');
	var redisKey = redisKeyBase + '*' + id + '*';
	
	redis.keys(redisKey, function(err, result){
		for(var i = 0; i < result.length; i++) {
			//Remove the key base so we just have the ID.
			result[i] = result[i].replace(redisKeyBase, '');
		}
		
		return callback(err, result);
	});
};

Member.prototype.makeRedisKey = function _makeRedisKey(id){
	return '__' + this.key + '__' + id;
};

module.exports = Member;