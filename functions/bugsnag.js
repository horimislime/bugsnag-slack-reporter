'use strict';

const request = require('request');
require('dotenv').config();

Object.defineProperty(Array.prototype, 'group', {
  enumerable: false,
  value: (key) => {
    let map = {};
    this.map(e => ({k: key(e), d: e})).forEach(e => {
      map[e.k] = map[e.k] || [];
      map[e.k].push(e.d);
    });
    return Object.keys(map).map((k) => ({key: k, data: map[k]}));
  }
});

const filterParams = {
  'filters[event.since][][type]': 'eq',
  'filters[event.since][][value]': '2d',
  'filters[error.status][][type]': 'eq',
  'filters[error.status][][value]': 'open',
  'filters[event.severity][][type]': 'eq',
  'filters[event.severity][][value]': 'error',
  'filters[app.release_stage][][type]': 'eq',
  'filters[app.release_stage][][value]': 'production'
};

const flatten = (arr) => {
  return Array.prototype.concat(...arr);
};

const api = (url, params) => {
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

api(`https://api.bugsnag.com/projects/${process.env.PROJECT_ID}/errors`, filterParams)
  .then((errors) => {
    const req = errors.map((error) => api(`https://api.bugsnag.com/errors/${error.id}/events`));
    return Promise.all(req);
  })
  .then((events) => {
    const req = flatten(events).map((event) => api(event.url));
    return Promise.all(req);
  })
  .then((details) => {
    details.forEach((detail) => {
      console.log(detail.user.name);
    });

    const restaurantGroups = details.group((detail) => detail.user.id);
    const versionGroups = details.group((detail) => detail.app.version);

    console.log(`restaurant group count = ${restaurantGroups.length}`);
    console.log(`version group count = ${versionGroups.length}`);
  });
