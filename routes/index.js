var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('*', function(req, res, next) {
  res.status(200).render('index', { title: 'Swim' });
});

module.exports = router;
