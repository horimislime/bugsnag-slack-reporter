'use strict';

const _ = require('lodash');
const functions = require('firebase-functions');
const bugsnag = require('./bugsnag.js');
const slack = require('./slack.js');
require('dotenv').config();

const filters = {
  'filters[event.since][][type]': 'eq',
  'filters[event.since][][value]': '1d',
  'filters[error.status][][type]': 'eq',
  'filters[error.status][][value]': 'open',
  'filters[event.severity][][type]': 'eq',
  'filters[event.severity][][value]': 'error',
  'filters[app.release_stage][][type]': 'eq',
  'filters[app.release_stage][][value]': 'production'
};

exports.daily_job = functions.pubsub.topic('daily-tick').onPublish(() => {
  console.log('Job started.');
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

      let message = ':fire: Total number of crashes on yesterday :fire:\n\n\n';

      const users = _.sortBy(_.keys(userGroups), (user) => userGroups[user].length).reverse();
      message += ':cat: *Crashes by user*\n';
      if (users.length > 0) {
        const usersString = users.map((user) => `${user}: ${userGroups[user].length}`).join('\n');
        message += `\`\`\`${usersString}\`\`\``;
      } else {
        message += 'No crashes :tada:';
      }
      message += '\n\n\n';
      message += ':rocket: *Crashes by version*\n';

      const versions = _.sortBy(_.keys(versionGroups), (ver) => parseFloat(ver)).reverse();
      if (versions.length > 0) {
        const versionsString = versions.map((ver) => `${ver}: ${versionGroups[ver].length}`).join('\n');
        const total = _.flatten(_.toArray(versionGroups)).length;
        message += ` \`\`\`${versionsString}\`\`\`\n\n`;
        message += `Total: ${total}`;
      } else {
        message += 'No crashes :tada:';
      }
      message += '\n\n\n';

      bugsnag.project(process.env.PROJECT_ID)
        .then((project) => {
          const filterParam = _.toPairs(filters).map((pair) => pair.join('=')).join('&');
          message += `:sleuth_or_spy: *More detail*\n${project.html_url}/errors?${filterParam}`;
          slack.send(message);
        });
    });
});
