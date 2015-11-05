var express = require('express');
var router = express.Router();

var Group = require('../src/database/group');
var Member = require('../src/database/member');

var Promise = require('bluebird');

/******************
  Parameters
 *****************/

router.param('groupid', function(req, res, next, id){
	req.group = new Group();
	next();
});

router.param('memberid', function(req, res, next, id){
	var member = new Member();
	member.get(id, function(err, obj){
		if(err)
			return res.status(500).json({error: err.message});
		
		if(obj === null)
			return res.status(404).json({error: "Member not found."});
			
		req.member = {
			id: id,
			data: obj
		};
		
		next();
	});
});

/******************
  Group Management
 *****************/

/**
 * Get the memebers of a group.
 * 
 * GET /group/:groupid
 */
router.get('/group/:groupid', function(req, res, next){
	req.group.getMembers(req.params.groupid, function(err, members){
		if(err)
		{
			console.log(err);
			res.status(500).json({error: err.message});
		}
		
		res.status(200).json(members);
	});
});

 /**
 * Update a Group replacing all existing members with the new members.
 * 
 * PUT /group/:groupid
 * [
 * 	{
 * 		id: <string>,
 * 		rank: <number>
 * 	},
 * 	...
 * ]
 */
 router.put('/group/:groupid', function(req, res, next){
	var errors = [];
	
	if(req.body.length === 0)
		return res.status(400).json({error: "Missing Members."});
	
	//Validate the incoming data before erasing the group.
	for(var i = 0; i < req.body.length; i++){
		if(typeof req.body[i].id !== "string")
			errors.push('Member ID must be of type "string" got "' + typeof req.body[i].id + '".')
		
		req.body[i].rank = req.body[i].rank || null;
		
		if(typeof req.body[i].rank !== "number" && req.body[i].rank !== null)
			errors.push('Member Rank must be of type "number" got "' + typeof req.body[i].rank + '".')
	}
	
	if(errors.length > 0)
		return res.status(400).json({error: errors.join('\n ')});
	
	// Clear the group.
	req.group.clear(req.params.groupid, function(err){
		if(err)
			return res.status(500).json({error: err.message});
		
		var promise = [];
		
		// Add our new members.
		req.body.forEach(function(element, index, array){
			promise.push(new Promise(function(resolve, reject){
				req.group.add(req.params.groupid, element.id, element.rank, function(err){
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
 * Add / Update a Member of the group.
 * 
 * PUT /group/:groupid/member/:id
 * {
 * 	rank: <number>
 * }
 */
 router.put('/group/:groupid/member/:memberid', function(req, res, next){
	req.body.rank = req.body.rank || null;
	
	if(typeof req.body.rank !== "number" && req.body.rank !== null)
		return res.status(400).json({error: 'Member Rank must be of type "number" got "'+ typeof req.body.rank +'".'});
		
	req.group.update(req.params.groupid, req.member.id, req.body.rank, function(err){
		if(err)
			return res.status(500).json({error: err.message});
			
		return res.status(201).json(true);
	});
 });
 
 /**
 * Remove a Member from the group.
 * 
 * DELETE /group/:groupid/member/:id
 */
router.delete('/group/:groupid/member/:memberid', function(req, res, next){
	req.group.remove(req.params.groupid, req.member.id, function(err){
		if(err)
			return res.status(500).json({error: err.message});
		
		return res.status(200).json(true);
	})
});

/**
 * Remove the Group.
 * 
 * DELETE /group/:groupid
 */
router.delete('/group/:groupid', function(req, res, next){
	req.group.delete(function(err){
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
router.all('/group', function(req, res, next){
	res.status(400).json({error: 'No action found for "'+ req.originalUrl +'".'});
});

module.exports = router;