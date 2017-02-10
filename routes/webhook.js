const express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.query['hub.verify_token'] === 'ece1780_test_token_62378461238461238') {
    res.send(req.query['hub.challenge']);
  }
  else {
    res.send('Error, wrong validation token');
  }
});

router.get('/health', function (req, res, next) {
    res.sendStatus(200);
});

module.exports = router;