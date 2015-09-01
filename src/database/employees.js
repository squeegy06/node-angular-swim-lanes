var redis = require('./redis');
var redlock = require('./redlock');

var defaults = {
	key: 'employees',
	lockTTL: 1000,
	startingIncrement: 13,
	incrementBy: 1
};


function Employees (options){
	options = options || {};
	this.key = options.key || defaults.key;
	this.lockTTL = options.lockTTL || defaults.lockTTL;
	this.startingIncrement = parseInt(options.startingIncrement) || defaults.startingIncrement;
	this.incrementBy = parseInt(options.incrementBy) || defaults.incrementBy;
	this.lockKey = 'lock.' + this.key;
	this.incrementKey = 'increment.' + this.key;
};

Employees.prototype.update =
Employees.prototype.add = function add(employee, next){
	var self = this;
	
	if(typeof employee.name !== 'string')
	{
		return next(new Error('Employee name not set.'));
	}
	
	if(typeof employee.id !== 'number')
	{
		self._add(employee, function(err, result){
			return next(err, result);
		});
	}
	else
	{
		redis.zrangebyscore(self.key, employee.id, employee.id, function(err, result){
			if(result === null)
			{
				self._add(employee, function(err, result){
					return next(err, result);
				});
			}
			else
			{
				self._update(employee, function(err, result){
					return next(err, result);
				});
			}
		});
	}
};

Employees.prototype._add = function _add(employee, next){
	var self = this;
	
	redlock.lock(self.lockKey, self.lockTTL)
	.then(function(lock){
		redis.get(self.incrementKey, function(err, result){
			if(err !== null)
			{
				lock.unlock();
				return next(err);
			}
			
			result = parseInt(result) || self.startingIncrement;
			var score = result + self.incrementBy;
			
			redis.zadd(self.key, 'NX', score, employee.name, function(err){
				redis.set(self.incrementKey, score);
				employee.id = score;
				lock.unlock();
				return next(err, employee);
			});
		});
	})
	.error(function(err){
		return next(err);
	});
};

Employees.prototype._update = function _update(employee, next){
	var self = this;
	
	redlock.lock(self.lockKey, self.lockTTL)
	.then(function(lock){
		redis.zremrangebyscore(self.key, employee.id, employee.id, function(err, result){
			if(err !== null)
			{
				lock.unlock();
				return next(err);
			}
			
			redis.zadd(self.key, employee.id, employee.name, function(err){
				lock.unlock();
				return next(err, employee);
			});
		});
	})
	.error(function(err){
		return next(err);
	});
};

Employees.prototype.findAll = function findAll(next){
	redis.zrange(this.key, '0', '-1', 'WITHSCORES', function(err, result){
		var data = [];
		
		for(var i = 0; i < result.length; i = i + 2)
		{
			data.push({
				name: result[i],
				id: parseInt(result[i + 1])
			});
		}
		
		next(null, data);
	});
};

module.exports = Employees;