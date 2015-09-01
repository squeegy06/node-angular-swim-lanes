var redis = require('./redis');

var employees = {};

employees.add = function(employee, next) {
	if(typeof employee.name !== 'string')
	{
		return next(new Error('Employee name not set.'));
	}
	
	if(typeof employee.id !== 'number')
	{
		redis.zcount('employees', '-inf', '+inf', function(err, result){
			employees.addNew(employee, function(err, result){
				return next(err, result);
			});
		});
	}
	else
	{
		redis.zrangescoreby('employees', employee.id, employee.id, function(err, result){
			if(result === null)
			{
				employees.addNew(employee, function(err, result){
					return next(err, result);
				});
			}
			else
			{
				employees.update(employee, function(err, result){
					return next(err, result);
				});
			}
		});
	}
};

employees.addNew = function(employee, next){
	
	if(typeof employee.name !== 'string')
	{
		return next(new Error('Employee name not set.'));
	}
	
	redis.zcount('employees', '-inf', '+inf', function(err, result){
		var score = result + 1;
		
		redis.zadd("employees", score, employee.name);
		
		employee.id = score;
		
		next(null, employee);
	});
};

employees.update = function(employee, next){
	if(typeof employee.name !== 'string')
	{
		return next(new Error('Employee name not set.'));
	}
	
	if(typeof employee.id !== 'number')
	{
		return next(new Error('Employee ID not set.'));
	}
	
	redis.zrem('employees', employee.id, function(err, result){
		redis.zadd('employees', employee.id, employee.name, function(err){
			return next(null, employee);
		});
	});
};

employees.getAll = function(next){
	redis.zrange('employees', '0', '-1', 'WITHSCORES', function(err, result){
		var data = [];
		
		for(var i = 0; i < result.length; i = i + 2)
		{
			data.push({
				name: result[i],
				id: result[i + 1]
			});
		}
		
		next(null, data);
	});
};

module.exports = employees;