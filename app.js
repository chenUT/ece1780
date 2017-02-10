const express = require('express');
const logger = require('./logger');
const argv = require('minimist')(process.argv.slice(2));
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const app = express();

const webhook = require('./routes/webhook.js');
const isDev = process.env.NODE_ENV !== 'production';
const ngrok = (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel ? require('ngrok') : false; 

// get the intended port number, use port 3000 if not provided
const port = argv.port || process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/webhook', webhook);

if (isDev) {
  // Start your app in dev.
  app.listen(port, (err) => {
    if (err) {
      return logger.error(err.message);
    }
    logger.appStarted(port);

    if (ngrok) {
      // Connect to ngrok in dev mode
      ngrok.connect(port, (innerErr, url) => {
        if (innerErr) {
          return logger.error(innerErr);
        }

        logger.appStarted(port, url);
      });
    }
  });
} else {
  // returns an instance of node-letsencrypt with additional helper methods
  const lex = require('greenlock-express').create({ // eslint-disable-line 
    // set to https://acme-v01.api.letsencrypt.org/directory in production
    // server: 'staging'
    server: 'https://acme-v01.api.letsencrypt.org/directory',

  // If you wish to replace the default plugins, you may do so here
  //
    challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) }, // eslint-disable-line 
    store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' }), // eslint-disable-line 

  // You probably wouldn't need to replace the default sni handler
  // See https://github.com/Daplie/le-sni-auto if you think you do
  // , sni: require('le-sni-auto').create({})

    approveDomains,
  });

  logger.appStarted(443);
  // handles acme-challenge and redirects to https
  const httpPort = 80;

  require('http').createServer(lex.middleware(require('redirect-https')())).listen(httpPort, function () { // eslint-disable-line 
    console.log('Listening for ACME http-01 challenges on', this.address());
  });

  // handles your app
  require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () { // eslint-disable-line 
    console.log('Listening for ACME tls-sni-01 challenges and serve app on', this.address());
  });
}

function approveDomains(opts, certs, cb) {
  // This is where you check your database and associated
  // email addresses with domains and agreements and such
  // console.log(opts.domains);
  // check domain
  if (opts.domains
        && opts.domains.indexOf('chenwebservice.com') < 0
        && opts.domains.indexOf('www.chenwebservice.com') < 0
        ) {
    // throw 'error: wrong domain';
    return;
  }

  // The domains being approved for the first time are listed in opts.domains
  // Certs being renewed are listed in certs.altnames
  if (certs) {
    opts.domains = certs.altnames; // eslint-disable-line 
  } else {
    opts.email = 'charlie@aworkingapp.com'; // eslint-disable-line 
    opts.agreeTos = true; // eslint-disable-line 
  }

  // NOTE: you can also change other options such as `challengeType` and `challenge`
  // opts.challengeType = 'http-01';
  // opts.challenge = require('le-challenge-fs').create({});

  cb(null, { options: opts, certs });
}

