// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// var functions = require('firebase-functions');
//
// exports.hourly_job =
//   functions.pubsub.topic('hourly-tick').onPublish((event) => {
//     console.log("This job is ran every hour!")
//   });

'use strict';

const _ = require('lodash');
const api = require('./bugsnag.js');
require('dotenv').config();

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

api(`https://api.bugsnag.com/projects/${process.env.PROJECT_ID}/errors`, filterParams)
  .then((errors) => {
    const req = errors.map((error) => api(`https://api.bugsnag.com/errors/${error.id}/events`));
    return Promise.all(req);
  })
  .then((events) => {
    const req = _.flatten(events).map((event) => api(event.url));
    return Promise.all(req);
  })
  .then((details) => {
    const userGroups = _.groupBy(details, (detail) => detail.user.name);
    const versionGroups = _.groupBy(details, (detail) => detail.app.version);

    for (const key in userGroups) {
      console.log(`${key}: ${userGroups[key].length}`);
    }
    for (const key in versionGroups) {
      console.log(`ver ${key}: ${versionGroups[key].length}`);
    }
  });
