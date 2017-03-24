
const request = require("request");

const constants = require("../constants/constants.js");

function parseSentence (text, category){
    let url = `${constants.brainUrl}/qa`;
    if (category) {
      url = `${constants.brainUrl}/qa?category=${category}`;
    }

    return new Promise(function (resolve, reject){
        var options = { method: 'GET',
            url: url,
            qs: { question: text },
            headers: { 
                    'cache-control': 'no-cache',
                    authorization: 'super_secure_token_IaqqmVVNrX2R7zm_IDcgzQPPrgcoFrcKF25l' 
                },
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                console.log(`ERROR: ${JSON.stringify(error)}`);
                reject(error);
                return;
            }
            resolve(body);
        });
    });
}

function getCategories (){
    return new Promise((resolve, reject) => {
        var options = { method: 'GET',
            url: `${constants.brainUrl}/categories`,
            headers: { 
               'cache-control': 'no-cache',
               authorization: 'super_secure_token_IaqqmVVNrX2R7zm_IDcgzQPPrgcoFrcKF25l' 
            }, 
            json: true
        };

        request(options, function (error, response, body) {
            if (error) {
                console.log(`Get Categories ERROR: ${JSON.stringify(error)}`);
                reject(error);
                return;
            }
            console.log(body)
            resolve(body);
        });
    });
}

let apis = {
    parseSentence: parseSentence,
    getCategories: getCategories
}

module.exports = apis;
