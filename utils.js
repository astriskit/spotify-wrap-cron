const axios = require("axios");
const { SPOTIFYWRAP_API_BASE_URL, ...config } = require("./config");

const getAPIUrl = (suffix, version = 1) => {
  return `${SPOTIFYWRAP_API_BASE_URL}/api/${version}/${suffix}`;
};

const getToken = () => {
  const {
    SPOTIFYWRAP_API_USERNAME: username,
    SPOTIFYWRAP_API_PASSWORD: password,
  } = config;
  return axios.post(getAPIUrl("login"), {
    data: {
      username,
      password,
    },
  });
};

const getNewReleases = (token) => {
  return axios.post(getAPIUrl("fetchNewReleases"), {
    Authorization: `Bearer ${token}`,
  });
};

const upload2DB = async (data) => {
  try {
    const {
      SPOTIFYWRAP_DB_USER,
      SPOTIFYWRAP_DB_PASSWORD,
      SPOTIFYWRAP_DB_URI,
      SPOTIFYWRAP_DB_NAME,
      SPOTIFYWRAP_DB_COLL,
    } = config;
    const { MongoClient } = require("mongodb");
    const uri = `mongodb://${SPOTIFYWRAP_DB_USER}:${SPOTIFYWRAP_DB_PASSWORD}@${SPOTIFYWRAP_DB_URI}`;
    const client = new MongoClient(uri);
    await client.connect();
    const db = await client.db(SPOTIFYWRAP_DB_NAME);
    const releases = await db.collection(SPOTIFYWRAP_DB_COLL);
    const docs = data;
    await releases.insertMany(docs);
    await client.close();
  } catch (err) {
    throw err;
  }
};

const uploadFlow = async () => {
  const {
    data: { access_token: token },
  } = await getToken();
  const albums = await getNewReleases(token);
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

module.exports = {
  getToken,
  getNewReleases,
  upload2DB,
  uploadFlow,
  validateConfig,
};
