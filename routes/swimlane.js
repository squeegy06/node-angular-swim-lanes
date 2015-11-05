var express = require('express');
var router = express.Router();

var Group = require('../src/database/group');
var Member = require('../src/database/member');

var Promise = require('bluebird');

/******************
  Parameters
 *****************/

router.param('swimlaneid', function(req, res, next, id){
	req.swimlane = new Group({
		key: "swimlane"
	});
	next();
});

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

/******************
  Swim Lane Management
 *****************/

/**
 * Get the tasks of a swimlane.
 * 
 * GET /swimlane/:swimlaneid
 */
router.get('/swimlane/:swimlaneid', function(req, res, next){
	req.swimlane.getMembers(req.params.swimlaneid, function(err, tasks){
		if(err)
		{
			console.log(err);
			res.status(500).json({error: err.message});
		}
		
		res.status(200).json(tasks);
	});
});

 /**
 * Update a Swimlane replacing all existing tasks with the new tasks.
 * 
 * PUT /swimlane/:swimlaneid
 * [
 * 	{
 * 		id: <string>,
 * 		rank: <number>
 * 	},
 * 	...
 * ]
 */
 router.put('/swimlane/:swimlaneid', function(req, res, next){
	var errors = [];
	
	if(req.body.length === 0)
		return res.status(400).json({error: "Missing Tasks."});
	
	//Validate the incoming data before erasing the group.
	for(var i = 0; i < req.body.length; i++){
		if(typeof req.body[i].id !== "string")
			errors.push('Task ID must be of type "string" got "' + typeof req.body[i].id + '".')
		
		req.body[i].rank = req.body[i].rank || null;
		
		if(typeof req.body[i].rank !== "number" && req.body[i].rank !== null)
			errors.push('Task Rank must be of type "number" got "' + typeof req.body[i].rank + '".')
	}
	
	if(errors.length > 0)
		return res.status(400).json({error: errors.join('\n ')});
	
	// Clear the swimlane.
	req.swimlane.clear(req.params.swimlaneid, function(err){
		if(err)
			return res.status(500).json({error: err.message});
		
		var promise = [];
		
		// Add our new tasks.
		req.body.forEach(function(element, index, array){
			promise.push(new Promise(function(resolve, reject){
				req.swimlane.add(req.params.swimlaneid, element.id, element.rank, function(err){
					if(err)
						return reject(err.message);
						
					return resolve(true);
				});
			}));
		});
		
		Promise.all(promise)
		.then(function(){
			res.status(201).json(true);
		},
			function(rejection){
				console.log(rejection);
				res.status(400).json({error: rejection});
		})
		.error(function(e){
			res.status(400).json({error: e.message});
		});
	});
 });
 
 /**
 * Add / Update a Task of the Swimlane.
 * 
 * PUT /swimlane/:swimlaneid/task/:taskid
 * {
 * 	rank: <number>
 * }
 */
 router.put('/swimlane/:swimlaneid/task/:taskid', function(req, res, next){
	req.body.rank = req.body.rank || null;
	
	if(typeof req.body.rank !== "number" && req.body.rank !== null)
		return res.status(400).json({error: 'Task Rank must be of type "number" got "'+ typeof req.body.rank +'".'});
		
	req.swimlane.update(req.params.swimlaneid, req.task.id, req.body.rank, function(err){
		if(err)
			return res.status(500).json({error: err.message});
			
		return res.status(201).json(true);
	});
 });
 
 /**
 * Remove a Task from the swimlane.
 * 
 * DELETE /swimlane/:swimlaneid/task/:taskid
 */
router.delete('/swimlane/:swimlaneid/task/:taskid', function(req, res, next){
	req.swimlane.remove(req.params.swimlaneid, req.task.id, function(err){
		if(err)
			return res.status(500).json({error: err.message});
		
		return res.status(200).json(true);
	})
});

/**
 * Remove the Swimlane.
 * 
 * DELETE /swimlane/:swimlaneid
 */
router.delete('/swimlane/:swimlaneid', function(req, res, next){
	req.swimlane.delete(function(err){
		if(err)
			return res.status(500).json({error: err.message});
		
		return res.status(200).json(true);
	});
});

/**
 * Catch any requests that didn't match an action.
 * 
 * ALL /group
 */
router.all('/swimlane', function(req, res, next){
	res.status(400).json({error: 'No action found for "'+ req.originalUrl +'".'});
});

module.exports = router;