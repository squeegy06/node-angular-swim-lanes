var express = require('express');
var router = express.Router();

var Group = require('../src/database/group');
var Member = require('../src/database/member');

var Promise = require('bluebird');

router.get('/swims', function(req, res, next) {
	var data = {};
	
  	res.status(200).json(data);
});

/******************
 * Group Management
 *****************/

router.param('groupid', function(req, res, next, id){
	try
	{
		req.group = new Group(id);
		next();
	}
	catch(e)
	{
		console.log(e);
		return res.status(400).json({error: e.message});
	}
});

/**
 * Get the memebers of a group.
 * 
 * GET /group/:groupid
 */
router.get('/group/:groupid', function(req, res, next){
	req.group.findAll(function(err, members){
		if(err)
		{
			console.log(err);
			res.status(500).json({error: err.message});
		}
		
		var returnData = [];
		
		for(var i = 0; i < members.length; i++)
		{
			returnData.push(members[i].member);
		}
		
		res.status(200).json(returnData);
	});
});

/**
 * Update the Order of a Group and add any additional members found in the request that are not part of the group.
 * 
 * POST /group/:groupid?action=updateOrder
 */
 router.post('/group/:groupid', function(req, res, next){
	 if(req.query.action !== "updateOrder")
		return next();
	
	if(typeof req.body.members !== 'object')
		return res.status(400).json({error: 'Missing Group Members'});
		
	var promise = [];
	
	req.body.members.forEach(function(element, index, array){
		promise.push(new Promise(function(resolve, reject){
			var member = new Member(element);
			member.get(function(err){
				if(err)
					return reject(err.message);
				
				var updateMember = false;
				
				//Check if the member is part of this group.  If not, add them.
				if(member.member.group[req.group.id] === undefined)
				{
					member.member.group[req.group.id] = {
						rank: member.defaultRank
					};
					
					updateMember = true;
				}
				
				//See if their rank has changed.
				if(element.group[req.group.id] === undefined)
				{
					//Do nothing.
				}
				else if(typeof element.group[req.group.id].rank !== 'number')
				{
					//Do Nothing.
				}
				else if(element.group[req.group.id].rank != member.member.group[req.group.id].rank)
				{
					member.member.group[req.group.id].rank = element.group[req.group.id].rank;
					updateMember = true;
				}
				
				if(updateMember)
				{
					member.persist(function(err){
						if(err)
							return reject(err.message);
							
						resolve(member);
					});
				}
				else
				{
					resolve(member);
				}
			});
		}));
	});
	
	//Finally, pull a fresh list of the group and return it to the front.
	Promise.all(promise)
	.then(function(){
		req.group.findAll(function(err, members){
			if(err)
			{
				console.log(err);
				res.status(500).json({error: err.message});
			}
			
			var returnData = [];
			
			for(var i = 0; i < members.length; i++)
			{
				returnData.push(members[i].member);
			}
			
			res.status(200).json(returnData);
		});
	},
		function(rejection){
			console.log(rejection);
			res.status(400).json({error: rejection});
	})
	.error(function(e){
		res.status(400).json({error: e.message});
	});
 });

/**
 * Catch any requests that didn't match an action.
 * 
 * ALL /group
 */
router.all('/group/:groupid', function(req, res, next){
	res.status(400).json({error: 'No action found for "' + req.query.action + '".'});
});


/*******************
 * Member Management
 ******************/
 
 router.param('memberid', function(req, res, next, id){
	try
	{
		req.member = new Member({id: id});
		req.member.get(function(err){
			if(err)
				return res.status(404).json({error: err.message});
			
			next();
		})
	}
	catch(e)
	{
		console.log(e);
		return res.status(404).json({error: e.message});
	}
});
 
/**
 * Add a new member.
 * 
 * POST /member?action=add
 */
router.post('/member', function(req, res, next){
	if(req.query.action !== "add")
		return next();
	
	try {
		var member = new Member(req.body.member);	
	}
	catch(err) {
		return res.status(400).json({error: err.message});
	}
		
	member.save(function(err){
		if(err)
			return res.status(400).json({error: err.message});
		
		return res.status(201).json(member.member);
	});
});

/**
 * Update the name of an existing member.
 * 
 * POST /member/:memberid?action=updateName
 */
router.post('/member/:memberid', function(req, res, next){
	if(req.query.action !== "updateName")
		return next();
		
	if(typeof req.body.member !== "object")
		return res.status(400).json({error: "Missing member data."});
		
	var updateMember = false;
	
	//Check if the name has been changed.
	if(typeof req.body.member.name === "string" && req.body.member.name != req.member.member.name)
	{
		req.member.member.name = req.body.member.name;
		updateMember = true;
	}
	
	if(updateMember)
	{
		req.member.save(function(err){
			if(err)
				return res.status(400).json({error: err.message});
			
			return res.status(201).json(req.member.member);
		});
	}
	else
	{
		return res.status(201).json(req.member.member);
	}
});

/**
 * Catch any request that didn't match an action.
 * 
 * ALL /member
 */
router.all('/member', function(req, res, next){
	res.status(400).json({error: 'No action found for "' + req.query.action + '".'});
});

module.exports = router;
