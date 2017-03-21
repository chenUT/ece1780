
const isDev = process.env.NODE_ENV !== 'production';
let url = 'mongodb://localhost';
let dbName = 'wondering_bot'

if (!isDev) {
    url = 'mongodb://localhost';
}

module.exports = {
    url:url,
    name: dbName
}