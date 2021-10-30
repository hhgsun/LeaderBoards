require('dotenv').config();

exports.MONGODB_URL = process.env.MONGODB_CONNSTRING || "mongodb+srv://hhgsun:hhgsun@cluster0.yllgz.mongodb.net/scores_db?retryWrites=true&w=majority";

exports.REDIS_HOST = process.env.REDIS_HOST || "localhost";
exports.REDIS_PORT = process.env.REDIS_PORT || 6379;

exports.GAME_CYCLE_TIME = process.env.GAME_CYCLE_TIME || "0 0 * * *";
exports.GAME_FINISH_ROUND = process.env.GAME_FINISH_ROUND || 7;
