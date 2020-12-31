const axios = require("axios");
const config = require("./config");

const getAPIUrl = (suffix, version = 1) => {
  return `${config.SPOTIFYWRAP_API_BASE_URL}/api/v${version}/${suffix}`;
};

const getNewReleases = () => {
  const {
    SPOTIFYWRAP_API_USER: username,
    SPOTIFYWRAP_API_PASSWORD: password,
  } = config;

  const authStr = `${username}:${password}`;

  return axios.post(getAPIUrl("fetchNewReleases"), null, {
    headers: {
      Authorization: `Bearer ${atob(authStr)}`,
    },
  });
};

const upload2DB = async (docs) => {
  try {
    const {
      SPOTIFYWRAP_DB_USER,
      SPOTIFYWRAP_DB_PASSWORD,
      SPOTIFYWRAP_DB_URI,
      SPOTIFYWRAP_DB_NAME,
      SPOTIFYWRAP_DB_COLLECTION,
    } = config;
    const { MongoClient } = require("mongodb");
    const uri = `mongodb+srv://${SPOTIFYWRAP_DB_USER}:${SPOTIFYWRAP_DB_PASSWORD}@${SPOTIFYWRAP_DB_URI}/${SPOTIFYWRAP_DB_NAME}?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const db = await client.db(SPOTIFYWRAP_DB_NAME);
    const cls = await db.collections();
    let collectionFound = false;
    for (const cl of cls) {
      if (cl.collectionName === SPOTIFYWRAP_DB_COLLECTION) {
        collectionFound = true;
      }
    }
    if (!collectionFound) {
      await db.createCollection(SPOTIFYWRAP_DB_COLLECTION);
    }
    const releases = await db.collection(SPOTIFYWRAP_DB_COLLECTION);
    await releases.deleteMany();
    await releases.insertMany(docs);
    await client.close();
  } catch (err) {
    throw err;
  }
};

const uploadFlow = async () => {
  const { data: albums } = await getNewReleases();
  return await upload2DB(albums);
};

const validateConfig = () => {
  let allValidated = true;
  for (const key in config) {
    if (!config[key]) {
      allValidated = false;
    }
  }
  return allValidated;
};

const atob = (str) => Buffer.from(str).toString("base64");

module.exports = {
  getNewReleases,
  upload2DB,
  uploadFlow,
  validateConfig,
  atob,
};
