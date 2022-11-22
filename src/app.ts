import type { Application } from 'express';
import type { Server } from 'http';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import type { User } from './models/user.model';
import express from 'express';
import Logger from './utils/Logger';
import helmet from 'helmet';
import { rateLimiter } from './middlewares/rateLimiter';
import { bodyCheck, errorHandler } from './middlewares/general';
import { routes } from './routes/index';
import { connectDB, env_variables } from './config';
import authorizationMiddleware from './middlewares/authorization';
import cors from 'cors';

declare global {
  namespace Express {
    export interface Request {
      user?: Partial<User>;
    }
  }
}

export let db: Db;
export let dbClient: MongoClient = new MongoClient(env_variables.DATABASE.url);

export default function BootServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    try {
      Logger.log('Booting up the server');

      Logger.log('\tTrying to connect to the database..');

      connectDB
        .then(({ database, client }) => {
          Logger.info('Successfully connected to db.');

          db = database;
          dbClient = client;

          const app: Application = express();

          app.use(cors());

          // is a set of middlewares that sets response headers to help prevent some well-known web vulnerabilities
          app.use(helmet());

          // set the rate limit middleware, if the requester has reached the rate limit, the request will end here and won't go further through the request chain.
          app.use(rateLimiter);

          // first middleware in the request chain is the urencoded and parses form data (application/x-www-form-urlencoded)
          app.use(express.urlencoded({ extended: false }));

          // second middleware in the request chain is the JSON parser middleware. Parsed request body if the application/json Content-Type is set
          app.use(express.json());

          // if the JSON parser fails due to an invalid JSON body this middleware catches it and returns an error response
          app.use(bodyCheck);

          app.use(authorizationMiddleware);

          // add the routes
          routes(app);

          // the last middleware in the request chain catches all thrown Errors in the routes, depending on the type of error an appropiate message will be returned to the client
          app.use(errorHandler);

          const server = app.listen(env_variables.PORT, () => {
            Logger.info(`\nServer is listening on port ${env_variables.PORT}`);
            resolve(server);
          });
        })
        .catch((e: unknown) => {
          Logger.error(e);
          // database connection could not be made, the server and it's endpoints won't be exposed
          Logger.error('Could not connect to the database...\n  - Is the database running?\n  - Are the .env variables correct?');
        });
    } catch (err) {
      Logger.error('The server is NOT exposed');
    }
  });
}
