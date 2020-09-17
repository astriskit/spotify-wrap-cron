# spotify-wrap-cron: a part of [spotify-wrap](https://github.com/astriskit/spotify-wrap)
cron to fetch latest releases and upload to given mongodb database

# Instructions to run
1. Get it configured using `.env` or `config.js`. Make sure the api related username and password are same as defined with spotify-wrap.
2. `npm install` to install dependencies.
3. `npm start` to run the cron. Optionally to override the schedule of running every 12 hours, one may do `npm start . 1 . . .` where `.` is equivalent to `*` in a cron world. More on cron-syntax can be read @ [node-cron](https://www.npmjs.com/package/node-cron#cron-syntax).
4. Wait for cron to run.
