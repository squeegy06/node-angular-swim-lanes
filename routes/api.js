var express = require('express');
var router = express.Router();

var employees = require('../src/database/employees');

router.get('/swims', function(req, res, next) {
	var data = {};
	
  	res.status(200).json(data);
});

router.get('/employees', function(req, res, next){
	employees.getAll(function(err, results){
		res.status(200).json(results);
	});
});

router.post('/employees', function(req, res, next){
	if(typeof req.body.employees !== 'object')
		return res.status(400).json(new Error('Missing Employees'));
	
	req.body.employees.forEach(function(element, index, array){
		if(typeof element.name === 'string') {
			employees.add(element, function(err, result){
				if(err !== null)
				{
					return res.status(400).json(err);
				}
				console.log(result);
				array[index] = result;
			});
		}
	});
	
	console.log(req.body.employees);
	
	res.status(201).json(req.body.employees);
});

module.exports = router;
