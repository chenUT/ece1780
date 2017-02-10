const express = require('express');
const request = require('request');
let router = express.Router();
const qas = require('../lib/qa_constants.js');

const token = 'EAAF7ZBlLWrhEBAKDNqanANpssuaLRTyt7Cogf6wcwnI8vQjzgk2FE2UP7u1IEIRzQ85aTRWbWIT2rOp0fZB1GvtqZCTjoImn5sM825tmojmYWk1uehiWmfqdBoq6q4gZCFFS7MifMKjc1sGjzWjTJUZCAgndEZBCXZAhHfyZAke5swZDZD';
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
  //  console.log('receive message');
   var messaging_events = req.body.entry[0].messaging;
   try {
    for (let i = 0; i < messaging_events.length; i++) {
      var event = messaging_events[i];
      var sender = event.sender.id;
      var msg = event.message;
      let msgArr = [];
      if (!msg.is_echo && msg){
         let msgText = msg.text.replace(/[^\w\s]/gi, '').toLowerCase().trim();
         let ans = qas[msgText];
         if (ans) {
            msgArr.push(ans);
            sendTextMessage(sender, msgArr, 0);
        } else {
            msgArr.push('I am sorry, I really don\'t know how to answer that. This may sound stupid but I only know 7 sentences in total.');
            sendTextMessage(sender, msgArr, 0);
        }
      }
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
  };
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
      console.log('Error sending message', JSON.stringify(error));
    } else if (response.body.error) {
      // console.log('Error: !');
      // console.log('Error: ', response.body.error);
      console.log('Error', JSON.stringify(response.body.error));
    } else {
      sendTextMessage(sender, texts, indexPlusOne);
    }
  });
}

module.exports = router;
