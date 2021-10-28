const mongoose = require('mongoose');
const { MONGODB_URL } = require('../config');

// Connecting to the database
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database", MONGODB_URL);
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});


// Collection Name = "players"
const PlayerSchema = mongoose.Schema({
    country: String,
    username: String,
    money: Number,
}, {
    timestamps: true
});

module.exports = mongoose.model('Player', PlayerSchema);