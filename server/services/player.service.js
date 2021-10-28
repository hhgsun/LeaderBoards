const Player = require('../models/player.model');
const cacheService = require('../services/cache.service');

const CACHE_ENABLE = true;

exports.findAll = async () => {
  if (CACHE_ENABLE) {
    const cacheValue = await cacheService.getPlayers();
    if (cacheValue && cacheValue.length > 0) {
      console.log("Response from Redis");
      return cacheValue;
    }
  }
  return Player.find()
    .then(players => {
      console.log("Response from Mongodb");
      if (CACHE_ENABLE) {
        return players.map(p => {
          if (CACHE_ENABLE)
            cacheService.setPlayer(p._id, p._doc);
          return p;
        });
      }
      return players;
    });
};

exports.findOne = async (pid) => {
  if (CACHE_ENABLE) {
    const cacheValue = await cacheService.getPlayer(pid);
    if (cacheValue) {
      console.log("Response from Redis");
      return cacheValue;
    }
  }
  console.log("Response from Mongodb");
  return Player.findById(pid)
    .then(p => {
      if (p != null && CACHE_ENABLE) {
        cacheService.setPlayer(p._id, p._doc);
      }
      return p._doc;
    });
};


exports.findLeaders = async (limit) => {
  if (CACHE_ENABLE) {
    const cacheValue = await cacheService.getLeaders(limit);
    if (cacheValue && cacheValue.length > 0) {
      console.log("Response from Redis");
      return cacheValue;
    }
  }
  console.log("Response from Mongodb");
  return Player.find().sort({ money: -1 }).limit(100);
}

exports.findPlayerRankAndRange = async (pid) => {
  if (CACHE_ENABLE) {
    const cacheValue = await cacheService.getPlayerRankAndRange(pid);
    if (cacheValue && cacheValue != null && cacheValue.length > 0) {
      console.log("Response from Redis");
      return cacheValue;
    }
  }
  console.log("Response from Mongodb");
  return this.findOne(pid).then(p => [p]);
}

exports.create = async (playerData) => {
  const newPlayer = new Player(playerData);
  return newPlayer.save().then(player => {
    if (CACHE_ENABLE)
      cacheService.setPlayer(player._id, player._doc);
    return player._doc;
  });
};

exports.update = async (pid, playerData) => {
  return Player.findByIdAndUpdate(pid, playerData)
    .then(player => {
      const upData = { ...player._doc, ...playerData }
      if (CACHE_ENABLE && player)
        cacheService.setPlayer(player._id, upData);
      return upData;
    });
};

exports.delete = async (pid) => {
  return Player.findByIdAndRemove(pid)
    .then(p => {
      if (CACHE_ENABLE)
        cacheService.delPlayer(pid);
      return p;
    });
};
