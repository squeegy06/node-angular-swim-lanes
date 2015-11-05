var express = require('express');
var router = express.Router();

var Group = require('../src/database/group');
var Member = require('../src/database/member');

var Promise = require('bluebird');

/******************
  Parameters
 *****************/

router.param('taskid', function(req, res, next, id){
	var task = new Member({
		key: "task"
	});
	task.get(id, function(err, obj){
		if(err)
			return res.status(500).json({error: err.message});
			
		if(obj === null)
			return res.status(404).json({error: "Task not found."});
		
		req.task = {
			id: id,
			data: obj
		};
		
		next();
	});
});

/**
 * Search Tasks.
 * 
 * GET /task/search/:string<optional>
 */
router.get('/task/search/:string*?', function(req, res, next){
	if(req.params.string === undefined)
		req.params.string = '';
		
	var task = new Member({
		key: 'task'
	});
	task.search(req.params.string, function(err, ids){
		if(err !== null)
			return res.status(500).json({error: err.message});
		
		return res.status(200).json(ids);
	});
});

/**
 * Get Task.
 * 
 * GET /task/:taskid
 */
router.get('/task/:taskid', function(req, res, next){
	return res.status(200).json(req.task);
});
 
/**
 * Add new task.
 * 
 * POST /task
 * {
 * 	data: <object>
 * }
 */
router.post('/task', function(req, res, next){
	var task = new Member({
		key: "task"
	});
	
	if(typeof req.body.data !== "object")
		return res.status(400).json({error: "Missing Task data."});
		
	task.save(req.body.data, function(err, id){
		if(err)
			return res.status(500).json({error: err.message});
		
		return res.status(201).json(id);
	});
});

/**
 * Update existing task replacing all data.
 * 
 * PUT /task/:taskid
 * {
 * 	data: <object>
 * }
 */
router.put('/task/:taskid', function(req, res, next){
	var task = new Member({
		key: "task"
	});
	
	if(typeof req.body.data !== "object")
		return res.status(400).json({error: "Missing Task data."});
	
	task.save(req.body.data, req.task.id, function(err, id){
		if(err)
			return res.status(500).json({error: err.message});
		
		return res.status(201).json(true);
	});
});

/**
 * Update existing task adding/replacing given data.
 * 
 * POST /task/:taskid
 * {
 * 	data: <object>
 * }
 */
router.post('/task/:taskid', function(req, res, next){
	var task = new Member({
		key: "task"
	});
	
	if(typeof req.body.data !== "object")
		return res.status(400).json({error: "Missing Task data."});
		
	for(var key in req.body.data){
		req.task.data[key] = req.body.data[key];
	}
	
	task.save(req.task.data, req.task.id, function(err, id){
		if(err)
			return res.status(500).json({error: err.message});
		
		return res.status(201).json(true);
	});
});

/**
 * Catch any request that didn't match an action.
 * 
 * ALL /task
 */
router.all('/task', function(req, res, next){
	res.status(400).json({error: 'No action found for "' + req.originalUrl + '".'});
});

module.exports = router;