'use strict';

const request = require('request');
require('dotenv').config();

module.exports = (url, params) => {
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
};
