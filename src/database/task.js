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
};

Task.prototype.save =
Task.prototype.persist = function _persist(callback) {
	var self = this;
	redis.set(self.key, JSON.stringify(self.task), function(err, result){
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
}