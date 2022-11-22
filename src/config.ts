import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import Logger from './utils/Logger';

const { PORT, ID_TYPE, DATABASE_URL, DATABASE_NAME, DATABASE_CONNECTION_TIMEOUT, JWT_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, CHATBOT_API } = process.env;

if (CHATBOT_API === undefined) {
  throw Error('chatbot api not set!');
}
if (DATABASE_NAME === undefined || DATABASE_URL === undefined || DATABASE_CONNECTION_TIMEOUT === undefined) {
  throw Error('Database variables not set!');
}

if (JWT_SECRET === undefined || ACCESS_TOKEN_EXPIRATION === undefined || REFRESH_TOKEN_EXPIRATION === undefined) {
  throw Error('Token variables are not set!');
}

if (typeof ID_TYPE === 'undefined' || (ID_TYPE !== 'ObjectID' && ID_TYPE !== 'UUID')) {
  throw Error('ID_TYPE not specified, needs to be ObjectID or UUID');
}

export const env_variables = {
  PORT: PORT ? parseInt(PORT) : 8080,
  DATABASE: { url: DATABASE_URL, name: DATABASE_NAME, timeout: parseInt(DATABASE_CONNECTION_TIMEOUT) },
  CHATBOT_API,
  TOKENS: {
    secret: JWT_SECRET,
    atExpiration: parseInt(ACCESS_TOKEN_EXPIRATION),
    rtExpiration: parseInt(REFRESH_TOKEN_EXPIRATION),
  },
  ID_TYPE: ID_TYPE as 'ObjectID' | 'UUID',
};

// function that finishes after the connection to the database has successfully been made or not
// eslint-disable-next-line no-async-promise-executor
export const connectDB = new Promise<{ database: Db; client: MongoClient }>(async (resolve, reject) => {
  try {
    const client = new MongoClient(DATABASE_URL);
    await client.connect();

    // connection successfully made
    resolve({ database: client.db(DATABASE_NAME), client });
  } catch (e) {
    Logger.error(e);
    // could not connect to the database
    reject(false);
  }
});
