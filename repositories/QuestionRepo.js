
const dbConstants = require('../constants/dbConstants.js');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let db = mongoose.createConnection(`${dbConstants.url}/${dbConstants.name}`);

const QuestionSchema = new mongoose.Schema({
    question: String,
    answer: String,

    questionSubject: String,
    questionSummary: String,

    answerSubject: String,
    answerSummary: String,

    questionWords: [String],
    answerWrods: [String]
});

function addQA(questionObj, answerObj) {
    let questionWords = questionObj.question.split(/[^a-zA-Z\d']/).filter( w => w && (w!==''));
    
}

const questionRepo = {};

module.exports = questionRepo;
