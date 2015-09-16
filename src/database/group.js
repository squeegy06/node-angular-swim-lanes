var redis = require('./redis');
var redlock = require('./redlock');
var Promise = require('bluebird');

var defaults = {
	key: 'group'
};


function Group (id, options){
	options = options || {};
	
	if(typeof id !== 'string')
		throw new Error('Group ID must be a string.');
	
	this.id = id;
	
	var keyPrefix = options.key || defaults.key;
	this.key = '__' + keyPrefix + '__' + this.id;
	
	this.memberKey = options.memberKey || null;
};

Group.prototype.findAll = function _findAll(callback){
	var self = this;
	
	redis.zrange(self.key, '0', '-1', function(err, result){
		if(err)
			return callback(err);
		
		var Member = require('./member');
		var promises = [];
		var data = [];
		
		for(var i = 0; i < result.length; i++)
		{	
			promises.push(new Promise(function(resolve, reject){
				var member = new Member({
					id: result[i]
				}, {key: self.memberKey});
				
				member.reload(function(err){
					if(err)
						reject(err.message);
						
					resolve(data.push(member));
				});
			}));
		}
		
		Promise.all(promises).then(function(){
			return callback(null, data);
		},function(rejection){
			return callback(new Error(rejection));
		}).error(function(e){
			return callback(e);
		});
	});
};

Group.prototype.update =
Group.prototype.add = function _add(member, callback){
	var self = this;
	var Member = require('./member');
	
	if(!(member instanceof Member))
		return callback(new Error('Value of member must be instance of Member.'));
	
	if(member.member.group[self.id] === undefined)
		return callback(new Error('Member does not belong to this group.'));
	
	redis.zadd(self.key, member.member.group[self.id].rank, member.member.id, function(err, result){
		if(err)
			return callback(err);
			
		return callback(null);
	});
};

Group.prototype.delete = 
Group.prototype.remove = function _remove(member, callback){
	var self = this;
	var Member = require('./member');
	
	if(!(member instanceof Member))
		return callback(new Error('Value of member must be instance of Member()'));
	
	redis.zrem(self.key, member.member.id, function(err){
		if(err)
			return callback(err);
			
		return callback();
	});
};

module.exports = Group;