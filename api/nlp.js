
const request = require("request");

const constants = require("../constants/constants.js");
// const parseSentence = function parseSentence(text, callback) {
//    //TODO send request to process text with nlp
// }

function parseSentence (text){
    return new Promise(function (resolve, reject){
        var options = { method: 'GET',
            url: `${constants.brainUrl}/qa`,
            qs: { question: `${text}` },
            headers: { 
                    'cache-control': 'no-cache',
                    authorization: 'super_secure_token_IaqqmVVNrX2R7zm_IDcgzQPPrgcoFrcKF25l' 
                } 
            };
            request(options, function (error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }

                console.log(body);
                resolve(body);
            });
    });
}

module.exports = parseSentence;
