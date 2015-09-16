var redis = require('./redis');
var redlock = require('./redlock');
var uuid = require('uuid');

var defaults = {
	key: 'member',
	defaultRank: 0,
	defaultGroup: 'default'
};

function Member(obj, options)
{
	options = options || {};
	
	this.defaultRank = options.defaultRank || defaults.defaultRank;
	if(this.defaultRank % 1 !== 0)
		throw new Error('Value of defaultRank must be an integer.');
		
	this.defaultGroup = options.defaultGroup || defaults.defaultGroup;
	
	//If this member doesn't have an id, give it one.
	if(typeof obj.id !== 'string')
		obj.id = uuid.v4();
		
	//Make sure the member belongs to a group and the groups are valid.
	if(obj.group === undefined)
	{
		obj.group = {};
		obj.group[this.defaultGroup] = {
			rank: this.defaultRank
		};
	}
	else if(typeof obj.group !== 'object')
	{
		var groupKey = obj.group;
		obj.group = {};
		obj.group[groupKey] = {
			rank: this.defaultRank
		}
	}
	
	for(var key in obj.group)
	{
		if(typeof key !== 'string')
			throw new Error('Group IDs must be of type string.');
			
		if(typeof obj.group[key].rank !== 'number')
			throw new Error('Group Ranks must be of type number.')
	}
	
	this.member = obj;
	
	var keyPrefix = options.key || defaults.key;
	this.key = "__" + keyPrefix + "__" + this.member.id;
}

Member.prototype.save = 
Member.prototype.persist = function _persist(callback) {
	if(typeof this.member.name !== 'string')
		return callback(new Error('You must specify a name for your member.'));
		
	var self = this;
	redis.set(self.key, JSON.stringify(self.member), function(err, result){
		if(err)
			return callback(err);
			
		var Group = require('./group');
		
		for(var key in self.member.group)
		{
			var group = new Group(key);
			group.update(self, function(err){
				if(err)
					console.log(err);
			});
		}
		
		return callback(null);
	});
};

/**
 * Reload/Get the values of Member.member from the database.
 */
Member.prototype.reload = 
Member.prototype.get = function _get(callback){
	var self = this;
	
	redis.get(self.key, function(err, result){
		if(err)
		{
			return callback(err);
		}
			
		if(!result)
		{
			return callback(new Error('Employee not found.'));
		}
			
		var obj = JSON.parse(result);
		self.member = obj;
		return callback();
	})
};

module.exports = Member;