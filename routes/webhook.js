const express = require('express');
const request = require('request');
let router = express.Router();
const qas = require('../lib/qa_constants.js');
const nlpApi = require('../api/nlp.js');
const threadState = require('../lib/threadState.js');

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
   console.log('receive message');
   var messaging_events = req.body.entry[0].messaging;
   console.log('message '+JSON.stringify(messaging_events));
   try {
    for (let i = 0; i < messaging_events.length; i++) {
      var event = messaging_events[i];
      var sender = event.sender.id;
      var msg = event.message;
      let msgArr = [];
      if (event.postback && event.postback.payload === 'START_TOPIC'){
        // get all categories
        // sendTextMessage(sender, ['Hi, I am wondering bot, I can answer your questions.'], 0);
        nlpApi.getCategories().then((result) =>{
           threadState.stateTopic(sender, result.categories);
           sendQRMsg(sender, result.categories);
        }, error => {
           sendTextMessage(sender, ['Oops, somethign went wrong :(.'], 0);
        });
      } else if (msg && !msg.is_echo){
        // check current state
        let currState = threadState.getState(sender);
        if (currState.state === threadState.STATE_TOPIC) {
          let qrTopic = msg.quick_reply ? msg.quick_reply.payload : msg.text;
          console.log('known topics: '+JSON.stringify(currState.topics));
          console.log('qr topic: '+qrTopic);
          if(currState.topics.indexOf(qrTopic) > -1){
              threadState.stateQuestion(sender, qrTopic);
              console.log('state to question');
              sendTextMessage(sender, [`What do you want to know about ${qrTopic}?`], 0);
          } else { // if we dont know this topic
              sendTextMessage(sender, ['I am sorry, I really dont know that topic'], 0);
              setTimeout(sendQRMsg(sender, currState.topics), 500);

          }
        } else {
          let msgText = msg.text.replace(/[^\w\s]/gi, '').toLowerCase().trim();
          console.log('text msg '+ msg.text);
          nlpApi.parseSentence(msgText, currState.topic)
            .then(function(result){
              // console.log('result ');
              // console.log(result);
              if (result.score < 1) {
                msgArr.push('I am sorry, I really don\'t know how to answer that. Please be more specific about your question.');
                sendTextMessage(sender, msgArr, 0);
              } else {
                let answerArray = getMessageArray(result.answer);
                sendTextMessage(sender, answerArray, 0);
              }
            }, function (error){
              console.log(error);
              msgArr.push('I am sorry, I really don\'t know how to answer that. This may sound stupid but I only know 7 sentences in total.');
              sendTextMessage(sender, msgArr, 0);
            }).catch(e => {console.log(e)})
        }
      }
    }
  } catch (e) {
     console.log(e);
   }
   res.sendStatus(200);
});

function getMessageArray(message) {
  if (message.length < 641) {
    return [message];
  }
  let chunkCount = Math.ceil(message.length/640);
  let i = 0;
  let messages = [];
  for (; i < chunkCount; i++) {
      messages.push(message.substring(i*640, (i+1)*640));
  }
  return messages;
}

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

function sendQRMsg(userId, categories){
  let qrMsg = getCategoriesQuickReply(userId, categories);
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: qrMsg
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
      // console.log(JSON.stringify(response));
    }
  });
}

function getCategoriesQuickReply(userId, categories) {
  let qrs = [];
  categories.forEach((cat) => {
       qrs.push({
         content_type: 'text',
         title: cat,
         payload: cat
       });
  });
  let qrObj = {
     recipient: {
       id: userId
     },
     message: {
       text: 'Here are the topics I may know the answer, please pick one.',
       'quick_replies': qrs
     }
  }

  return qrObj;
}

module.exports = router;
