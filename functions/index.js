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
const bugsnag = require('./bugsnag.js');
const slack = require('./slack.js');
require('dotenv').config();

const filters = {
  'filters[event.since][][type]': 'eq',
  'filters[event.since][][value]': '2d',
  'filters[error.status][][type]': 'eq',
  'filters[error.status][][value]': 'open',
  'filters[event.severity][][type]': 'eq',
  'filters[event.severity][][value]': 'error',
  'filters[app.release_stage][][type]': 'eq',
  'filters[app.release_stage][][value]': 'production'
};

bugsnag.errors(process.env.PROJECT_ID, filters)
  .then((errors) => {
    const req = errors.map((error) => bugsnag.events(error.id, filters));
    return Promise.all(req);
  })
  .then((events) => {
    const req = _.flatten(events).map((event) => bugsnag.get(event.url));
    return Promise.all(req);
  })
  .then((details) => {
    const userGroups = _.groupBy(details, (detail) => detail.user.name);
    const versionGroups = _.groupBy(details, (detail) => detail.app.version);

    userGroups['ほげレストラン'] = [1, 2, 3, 4, 5, 6, 7];
    userGroups['居酒屋ぽめ太郎'] = [1, 2, 3, 4, 5];

    const users = _.sortBy(_.keys(userGroups), (user) => userGroups[user].length)
      .reverse()
      .map((user) => `${user}: ${userGroups[user].length}`)
      .join('\n');
    slack.send(`*Crashes by users* \`\`\`${users}\`\`\``);

    versionGroups['13.0'] = [1, 2, 3, 4, 5, 6, 7];
    versionGroups['14.0'] = [1, 2, 3, 4, 5];
    const versions = _.sortBy(_.keys(versionGroups), (ver) => parseFloat(ver))
      .reverse()
      .map((ver) => `${ver}: ${versionGroups[ver].length}`)
      .join('\n');
    slack.send(`*Crashes by versions* \`\`\`${versions}\`\`\``);
  });
