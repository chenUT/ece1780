
const isDev = process.env.NODE_ENV !== 'production';
let dbUrl = 'mongodb://localhost';
let dbName = 'wondering_bot'

if (!isDev) {
    dbUrl = 'mongodb://localhost';
}

let brainUrl = '';

module.exports = {
    dbUrl: dbUrl,
    dbName: dbName,

    brainUrl: brainUrl
}