import 'dotenv/config';
import type { Server } from 'http';
import bootServer, { dbClient } from './app';
import Logger from './utils/Logger';

let server: Server;
bootServer()
  .then((s) => (server = s))
  .catch((e) => {
    Logger.error('Something went wrong while booting up the server...');
  });

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function cleanup(): Promise<void> {
  Logger.info('Server is closing...\n');
  server.close(async (error) => {
    if (error) {
      Logger.error('Server was never opened');
    }
    const hasConnection = dbClient != null;
    if (hasConnection) {
      Logger.log('Closing database connection...');
      await dbClient.close();
    }
  });
}
