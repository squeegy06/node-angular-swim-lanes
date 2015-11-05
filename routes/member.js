var express = require('express');
var router = express.Router();

var Group = require('../src/database/group');
var Member = require('../src/database/member');

var Promise = require('bluebird');

/******************
  Parameters
 *****************/

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

/*******************
  Member Management
 ******************/
 
/**
 * Search Members.
 * 
 * GET /member/search/:string<optional>
 */
router.get('/member/search/:string*?', function(req, res, next){
	if(req.params.string === undefined)
		req.params.string = '';
		
	var member = new Member();
	member.search(req.params.string, function(err, ids){
		if(err !== null)
			return res.status(500).json({error: err.message});
		
		return res.status(200).json(ids);
	});
});


/**
 * Get Member.
 * 
 * GET /member/:memberid
 */
router.get('/member/:memberid', function(req, res, next){
	return res.status(200).json(req.member);
});
 
/**
 * Add new member.
 * 
 * POST /member
 * {
 * 	data: <object>
 * }
 */
router.post('/member', function(req, res, next){
	var member = new Member();
	
	if(typeof req.body.data !== "object")
		return res.status(400).json({error: "Missing Member data."});
		
	member.save(req.body.data, function(err, id){
		if(err)
			return res.status(400).json({error: err.message});
		
		return res.status(201).json(id);
	});
});

/**
 * Update existing member replacing all data.
 * 
 * PUT /member/:memberid
 * {
 * 	data: <object>
 * }
 */
router.put('/member/:memberid', function(req, res, next){
	var member = new Member();
	
	if(typeof req.body.data !== "object")
		return res.status(400).json({error: "Missing Member data."});
	
	member.save(req.body.data, req.member.id, function(err, id){
		if(err)
			return res.status(400).json({error: err.message});
		
		return res.status(201).json(true);
	});
});

/**
 * Update existing member adding/replacing given data.
 * 
 * POST /member/:memberid
 * {
 * 	data: <object>
 * }
 */
router.post('/member/:memberid', function(req, res, next){
	var member = new Member();
	
	req.member.data = req.member.data || {};
	
	if(typeof req.body.data !== "object")
		return res.status(400).json({error: "Missing Member data."});
		
	for(var key in req.body.data){
		req.member.data[key] = req.body.data[key];
	}
	
	member.save(req.member.data, req.member.id, function(err, id){
		if(err)
			return res.status(400).json({error: err.message});
		
		return res.status(201).json(true);
	});
});

/**
 * Catch any request that didn't match an action.
 * 
 * ALL /member
 */
router.all('/member', function(req, res, next){
	res.status(400).json({error: 'No action found for "' + req.originalUrl + '".'});
});

module.exports = router;