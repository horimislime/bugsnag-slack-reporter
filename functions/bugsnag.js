'use strict';

const Promise = require('bluebird');
const request = require('request');
require('dotenv').config();

module.exports = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      console.log(url);
      setTimeout(function() {
        console.log(`url = ${url}`);
        request.get({
          url: url,
          headers: {
            Authorization: `token ${process.env.AUTH_TOKEN}`,
            'X-Version': 2
          },
          qs: params,
          json: true
        }, (error, response, body) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log('request success.');
            resolve(body);
          }
        });
      }, 10 * 1000);
    });
  },
  errors: function(projectId, filters) {
    return this.get(`https://api.bugsnag.com/projects/${projectId}/events`, filters);
  },
  events: function(errorId, filters) {
    return this.get(`https://api.bugsnag.com/errors/${errorId}/events`, filters);
  },
  project: function(projectId) {
    return this.get(`https://api.bugsnag.com/projects/${projectId}`);
  }
};
