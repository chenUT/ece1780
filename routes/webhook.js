const express = require('express');
let router = express.Router();

const token = 'EAAF7ZBlLWrhEBAHub4HdA06nrHgW6PNei9lRJgcjaLyXFpv1Nk7IReRpceBtnM7GHS0kODWKS2ZCxrWg7XL2upgbqrZCV2ZCOVeJ4hqzvcCZAZBXiH1OZAlKNfNHXSgo8VDc82hm27dOy1b8isBTXhAEIGZBZAdsPovzwZCNEsf5rEGwZDZD';

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.query['hub.verify_token'] === 'ece1780_test_token_62378461238461238') {
    console.log('verified');
    res.send(req.query['hub.challenge']);
  }
  else {
    console.log('Error, wrong validation token');
    res.sendStatus(403);
  }
});

router.get('/health', (req, res, next) => {
    res.sendStatus(200);
});


router.post('/', (req, res, next) => {
   console.log('receive message');
  var messaging_events = req.body.entry[0].messaging;
   console.log(JSON.stringify(messaging_events, null ,2));
   try {
    for (let i = 0; i < messaging_events.length; i++) {
      var event = messaging_events[i];
      var sender = event.sender.id;
      var msg = event.message;
      console.log(msg);
      sendTextMessage(sender, msg);
      return;
    }
   } catch (e) {

   }
   res.sendStatus(200);
});


function sendTextMessage(sender, texts, index) {
  if (index === texts.length) {
    return;
  }
  let messageData = {
    text: texts[index]
  }
  let indexPlusOne = (index + 1);
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: { id: sender },
      //recipient: {id:'10206521755625611'},
      message: messageData,
    }
  }, function (error, response, body) {
    if (error) {
      // console.log('Error sending message: ');
      // console.log('Error sending message: ', error);
      logger.error('Error sending message', JSON.stringify(error));
    } else if (response.body.error) {
      // console.log('Error: !');
      // console.log('Error: ', response.body.error);
      logger.error('Error', JSON.stringify(response.body.error));
    } else {
      sendTextMessage(sender, texts, indexPlusOne);
    }
  });
}

module.exports = router;