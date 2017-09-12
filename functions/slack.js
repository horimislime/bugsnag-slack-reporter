'use strict';

const request = require('request');
require('dotenv').config();

module.exports = {
  send: (message) => {
    return new Promise((resolve, reject) => {
      request.post({
        url: process.env.SLACK_WEBHOOK_URL,
        body: { text: message },
        json: true
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }
};
