var redis = require('./redis');
var redlock = require('./redlock');

var defaults = {
	key: 'employees',
	lockKey: 'lock.employees',
	lockTTL: 1000
};


function Employees (options){
	options = options || {};
	this.key = options.key || defaults.key;
	this.lockKey = options.lockKey || defaults.lockKey;
	this.lockTTL = options.lockTTL || defaults.lockTTL;
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
		redlock.lock(self.lockKey, self.lockTTL)
		.then(function(lock){
			redis.zcount(self.key, '-inf', '+inf', function(err, result){
				self._add(employee, function(err, result){
					lock.unlock();
					return next(err, result);
				});
			});
		})
		.error(function(err){
			return next(err);
		});
	}
	else
	{
		redlock.lock(self.lockKey, self.lockTTL)
		.then(function(lock){
			redis.zrangebyscore(self.key, employee.id, employee.id, function(err, result){
				if(result === null)
				{
					self._add(employee, function(err, result){
						lock.unlock();
						return next(err, result);
					});
				}
				else
				{
					self._update(employee, function(err, result){
						lock.unlock();
						return next(err, result);
					});
				}
			});
		})
		.error(function(err){
			return next(err);
		});
	}
};

Employees.prototype._add = function _add(employee, next){
	var self = this;
	
	redis.zcount(self.key, '-inf', '+inf', function(err, result){
		var score = result + 1;
		
		redis.zadd(self.key, 'NX', score, employee.name, function(err){
			employee.id = score;
		
			next(err, employee);
		});
	});
};

Employees.prototype._update = function _update(employee, next){
	var self = this;
	
	redis.zremrangebyscore(self.key, employee.id, employee.id, function(err, result){
		if(err !== null)
		{
			return next(err);
		}
		
		redis.zadd(self.key, employee.id, employee.name, function(err){
			return next(null, employee);
		});
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