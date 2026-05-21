/* eslint-disable no-console */
import app from './app';
import connectDB from './app/configs/db';
import { Server } from 'http';
import { environmentVariables } from './app/configs/env';
import seedSuperAdmin from './app/utils/seedSuperAdmin';
import { connectRedis } from './app/configs/redis.config';

let server: Server;

// Graceful shutdown logic reused in all error signals
const gracefulShutdown = (reason: string, error?: unknown) => {
  console.error(`\n${reason}`);
  if (error) {
    console.error('Error:', error);
  }
  if (server) {
    server.close(() => {
      console.log('🔴 Server closed gracefully.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const cleanExit = (signal: string) => {
  console.log(`\n🟡 ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('🟢 Server closed cleanly.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    server = app.listen(environmentVariables.PORT, () => {
      console.log(
        `🚀 Traveler Server running on port: ${environmentVariables.PORT}`.bgMagenta.bold
      );
    });
    await seedSuperAdmin();
  } catch (error) {
    gracefulShutdown('❌ Failed to connect to database or start server', error);
  }
}
(async () => {
  await startServer();
})();

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason) => {
  gracefulShutdown('❌ Unhandled Rejection Detected. Shutting down...', reason);
});

// Uncaught Exception
process.on('uncaughtException', (error) => {
  gracefulShutdown('❌ Uncaught Exception Detected. Shutting down...', error);
});

// Signal Termination (e.g., Docker, Heroku, PM2)
process.on('SIGTERM', () => cleanExit('SIGTERM'));
process.on('SIGINT', () => cleanExit('SIGINT'));

// === Test Code ===
// Uncomment one at a time to simulate errors

// Test: Unhandled Rejection
// Promise.reject(new Error('Simulated Unhandled Rejection'))

// Test: Uncaught Exception
// throw new Error('Simulated Uncaught Exception')

// Test: Termination Signals
// (Run `kill -SIGTERM <pid>` from terminal)
