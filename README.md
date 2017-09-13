# bugsnag-slack-reporter
Daily crash reporting batch running on AppEngine + Cloud Functions.

# Deploy
Set the following env vars to `functions/.env`.

```
AUTH_TOKEN=123456789abcdefghijk
PROJECT_ID=563196737765621c140006ae
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/abcdefghijk
```

- Where `AUTH_TOKEN` means Bugsnag Auth Token (you can issue it [from here](https://app.bugsnag.com/settings/my-account)).
- `PROJECT_ID` is Bugsnag project ID to report crashes.
- `SLACK_WEBHOOK_URL` is incoming webhook URL to send report.

Run the following commands to deploy AppEngine app and functions to Firebase.

```
~/repo_root $ firebase login
~/repo_root $ gcloud auth login
~/repo_root $ gcloud config set project [firebase_project_id]
~/repo_root $ cd functions
~/repo_root/functions $ gcloud app deploy app.yaml cron.yaml
~/repo_root/functions $ cd ..
~/repo_root $ firebase deploy --only functions --project [firebase_project_id]
```

# Confirm it works
- See [Stackdriver](https://console.cloud.google.com/logs/viewer) to ensure that `/publish/daily-tick` successfully completed.
- To confirm functions are working,  see functions logs (https://console.firebase.google.com/u/1/project/[firebase_project_id]/functions/logs).

# License
MIT © [horimislime](https://horimisli.me/about)
