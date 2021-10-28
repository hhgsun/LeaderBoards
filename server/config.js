require('dotenv').config();

exports.MONGODB_URL = process.env.MONGODB_URL ?? "mongodb://localhost:27017/scores_db";

exports.REDIS_HOST = process.env.REDIS_HOST ?? "localhost";
exports.REDIS_PORT = process.env.REDIS_PORT ?? 6379;

exports.GAME_CYCLE_TIME = process.env.GAME_CYCLE_TIME ?? "0 0 * * *";
exports.GAME_FINISH_ROUND = process.env.GAME_FINISH_ROUND ?? 7;
