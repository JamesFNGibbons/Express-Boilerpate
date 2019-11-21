const express = require('express');
const body = require('body-parser');
const fs = require('fs');

const app = express();

/** 
 * Load the config file, if it exists.
 * if not, then this will error out.
*/
let config = null;
if(fs.existsSync('./config.json')) {
  config = require('./config.json');
}
else {
  throw 'Error! Main configuration file is missing. ./config.json';
}

/** 
 * Load the custom middleware into the express
 * app. This should load from the ./middleware
 * directory.
*/
for(let middleware of fs.readdirSync('./middleware')) {
  if(!middleware == '.keep') {
    app.use(require('./lib/' + middleware));
  }
}

/**
 * Load the routes into the app, from the ./routes
 * directory.
 */
for(let route of fs.readdirSync('./routes')) {
  if(!route == '.keep') {
    
    // Check if the route is a file or directory
    if(fs.lstatSync('./routes/' + route).isDirectory()) {
      for(let subRoute of fs.readdirSync('./routes/' + route + '/')) {
        if(fs.lstatSync('./routes/' + route + '/' + subRoute).isDirectory()) {
          console.log('--> Skipping loading Sub Route ' + subRoute + ' As its a directory.');
        }
        else {
          app.use('/' + route + '/' + subRoute + '/',require('./routes/' + route + '/' + subRoute.split('.js')[0]));
        }
      }
    } 
    else {
      app.use('/' + route.split('.js')[0], require('./routes/' + route));
    }   
  }
}

/** 
 * Start the express app using the HTTP 
 * configuration.
 */
if(config.http) {
  app.listen(config.http.port, () => {console.log('Ready on :' + config.http.port)});
}
else {
  throw 'Invalid config does not contain valid HTTP settings.';
}

