'use strict';

const request = require('request');
require('dotenv').config();

module.exports = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
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
          reject(error);
        } else {
          console.log(`success. href = ${response.request.href}`);
          resolve(body);
        }
      });
    });
  },
  errors: function(projectId, filters) {
    return this.get(`https://api.bugsnag.com/projects/${projectId}/errors`, filters);
  },
  events: function(errorId, filters) {
    return this.get(`https://api.bugsnag.com/errors/${errorId}/events`, filters);
  },
  project: function(projectId) {
    return this.get(`https://api.bugsnag.com/projects/${projectId}`);
  }
};
