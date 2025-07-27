"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./app/configs/db"));
const env_1 = require("./app/configs/env");
const seedSuperAdmin_1 = __importDefault(require("./app/utils/seedSuperAdmin"));
const redis_config_1 = require("./app/configs/redis.config");
let server;
// Graceful shutdown logic reused in all error signals
const gracefulShutdown = (reason, error) => {
    console.error(`\n${reason}`);
    if (error) {
        console.error('Error:', error);
    }
    if (server) {
        server.close(() => {
            console.log('🔴 Server closed gracefully.');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
};
const cleanExit = (signal) => {
    console.log(`\n🟡 ${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            console.log('🟢 Server closed cleanly.');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
};
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.default)();
            server = app_1.default.listen(env_1.environmentVariables.PORT, () => {
                console.log(`🚀 Traveler Server running on port: ${env_1.environmentVariables.PORT}`
                    .bgMagenta.bold);
            });
        }
        catch (error) {
            gracefulShutdown('❌ Failed to connect to database or start server', error);
        }
    });
}
;
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, redis_config_1.connectRedis)();
    yield startServer();
    yield (0, seedSuperAdmin_1.default)();
}))();
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
