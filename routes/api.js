var express = require('express');
var router = express.Router();

var Employees = require('../src/database/employees');
var employees = new Employees();

var Promise = require('bluebird');

router.get('/swims', function(req, res, next) {
	var data = {};
	
  	res.status(200).json(data);
});

router.get('/employees', function(req, res, next){
	employees.findAll(function(err, results){
		res.status(200).json(results);
	});
});

router.post('/employees', function(req, res, next){
	if(typeof req.body.employees !== 'object')
		return res.status(400).json(new Error('Missing Employees'));
		
	var promise = [];
	
	req.body.employees.forEach(function(element, index, array){
		if(typeof element.name === 'string') {
			promise.push(new Promise(function(resolve, reject){
				employees.add(element, function(err, result){
					if(err !== null)
					{
						reject(err);
					}
					resolve(result);
				});
			}));
		}
	});
	
	Promise.all(promise)
	.then(function(){
		var data = [];
		
		for(var i = 0; i < promise.length; i++)
		{
			data.push(promise[i].value());
		}
		
		res.status(201).json(data);
	})
	.error(function(e){
		res.status(400).json(e);
	});
});

module.exports = router;
