
const isDev = process.env.NODE_ENV !== 'production';
let dbUrl = 'mongodb://localhost';
let dbName = 'wondering_bot'

if (!isDev) {
    dbUrl = 'mongodb://localhost';
}

// let brainUrl = 'http://138.197.64.93:8080';
let brainUrl = 'http://localhost:8080';

module.exports = {
    dbUrl: dbUrl,
    dbName: dbName,

    brainUrl: brainUrl
}