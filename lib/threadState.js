
/**
 * this is a in memory database store thread state
 */

const STATE_TOPIC = 'topic';
const STATE_QUESTION = 'question';

function stateQuestion(userId, topic) {
  threadState[userId] = {
     state: STATE_QUESTION,
     topic: topic,
     topics: []
  };
}

function stateTopic(userId, topics) {
  threadState[userId] = {
     state: STATE_TOPIC,
     topic: '',
     topics: topics
  };
}

function getState(userId) {
  if (!threadState[userId]) {
    threadState[userId] = {
        state: STATE_TOPIC,
        topic: '',
        topics: []
    };
  }
  return threadState[userId];
}

const threadState = {
    stateQuestion: stateQuestion,
    stateTopic: stateTopic,
    getState: getState,
    STATE_TOPIC : STATE_TOPIC,
    STATE_QUESTION: STATE_QUESTION
};

module.exports = threadState;