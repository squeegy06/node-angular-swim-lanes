var express = require('express');
var router = express.Router();

var redis = require('../redis');

router.get('/swims', function(req, res, next) {
	var data = {};
	
  	res.status(200).json(data);
});

router.get('/employees', function(req, res, next){
	var data = {};
	
	redis.zrange('employees', '-inf', '+inf', 'WITHSCORES', function(err, result){
		console.log(result);
	});
	
	res.status(200).json(data)
});

router.post('/employees', function(req, res, next){
	var data = req.body;
	console.log(req.body);
	
	if(typeof data.employees !== 'object')
		return res.status(400).json();
	
	for(var i = 0; i < data.employees.length; i++) {
		var employeeID = data.employees[i].id;
		var employeeName = data.employees[i].name;
		
		if(typeof employeeName !== 'string')
			continue;
			
		if(typeof employeeID !== 'number')
		{
			redis.zcount('employees', '-inf', '+inf', function(err, result){
				var score = result + 1;
				
				redis.zadd("employees", score, employeeName)
				
				 data.employees[i].id = score;
			});
		}
		else
		{
			redis.zrangescoreby('employees', employeeID, employeeID, function(err, result){
				if(result === null)
				{
					redis.zcount('employees', '-inf', '+inf', function(err, result){
						var score = result + 1;
						
						redis.zadd("employees", score, employeeName)
						
						 data.employees[i].id = score;
					});
				}
				else
				{
					redis.zrem('employees', employeeID, function(err, result){
						redis.zadd('employees', employeeID, employeeName);
					});
				}
			});
		}
	}
	
	res.status(201).json();
});

module.exports = router;
