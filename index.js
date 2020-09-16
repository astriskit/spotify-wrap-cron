const dotEnv = require("dotenv");
dotEnv.config();

const { validateConfig, uploadFlow } = require("./utils");

const main = async () => {
  if (!validateConfig()) {
    throw new Error(
      "Configuration error: One or more configuration is missing!"
    );
  }
  console.info("Fetcher: starting to fetch new releases.");
  try {
    await uploadFlow();
    console.info("Fetcher: fetched and upload done.");
  } catch (err) {
    console.error("Fetcher: Flow failed. Error: \n %j", err.message);
  } finally {
    console.info("Fetcher: exiting.");
  }
};

const run = (cronString = "0 */12 * * *") => {
  const cron = require("node-cron");
  cron.schedule(cronString, async () => {
    try {
      console.info("Cron: starting.");
      await main();
      console.info("Cron: finishing.");
    } catch (err) {
      console.info("Cron: error while running!");
      console.error(err.message);
    }
  });
};

exports = {
  main,
  run,
};

if (require.main === module) {
  if (process.argv.length > 2) {
    const cron = require("node-cron");
    const cstr = process.argv
      .slice(2)
      .map((s) => (s === "." ? "*" : s))
      .join(" ");
    if (cron.validate(cstr)) {
      run(cstr);
    } else {
      console.error("Invalid cron string!");
    }
  } else {
    run();
  }
}
