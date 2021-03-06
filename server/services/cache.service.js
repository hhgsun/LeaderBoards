const redis = require("redis");
const util = require("util");
const { REDIS_HOST, REDIS_PORT } = require("../config");

console.log("RUNNING REDIS:", REDIS_HOST, REDIS_PORT);

exports.rClient = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  retry_strategy: () => 1000
});
// this.rClient.get = util.promisify(this.rClient.get);

exports.getPlayers = async () => {
  return new Promise((resolve, reject) => {
    this.rClient.hgetall("player_profiles", (err, dataobj) => {
      if (err) {
        console.log(err);
        return resolve([]);
      }
      const profiles = [];
      if (dataobj && util.isObject(dataobj)) {
        for (const key in dataobj) {
          profiles.push(JSON.parse(dataobj[key]));
        }
      }
      resolve(profiles);
    });
  });
}

exports.getPlayer = async (pid) => {
  return new Promise((resolve, reject) => {
    this.rClient.hget('player_profiles', pid, async (err, player) => {
      if (err) {
        console.log(err);
        return resolve(null);
      }
      if (pid == null || !player) {
        resolve(null)
      }
      const scoreAndDailyDiff = await this.getPlayerTotalScoreAndDailyDiff(pid);
      resolve({
        ...JSON.parse(player),
        ...scoreAndDailyDiff
      });
    });
  });
}

exports.getLeaders = (limit) => {
  return new Promise((resolve, reject) => {
    this.rClient.ZREVRANGE("player_money_leaders", 0, parseInt(limit) - 1, async (err, pkeys) => {
      if (err) {
        console.log(err);
        return resolve([]);
      }
      const leaders = [];
      if (pkeys)
        for (let i = 0; i < pkeys.length; i++) {
          const pid = pkeys[i];
          if (pid == null) {
            return null;
          }
          const player = await this.getPlayer(pkeys[i]);
          const p = { ...player, rank: i + 1 };
          leaders.push(p);
        }
      resolve(leaders);
    });
  });
}

exports.getPlayerRankAndRange = async (pid) => {
  return new Promise((resolve, reject) => {
    if (!pid) resolve([]);
    this.rClient.ZREVRANK("player_money_leaders", pid.toString(), async (err, specificRank) => {
      if (err) {
        console.log(err);
        return resolve([]);
      }
      let startRank = specificRank;
      if (startRank > 100) {
        let diff = startRank - 100;
        startRank = startRank - (diff > 3 ? 3 : diff);
      }
      let stopRank = specificRank;
      if (stopRank > 97) {
        stopRank = stopRank + 2;
      }
      this.rClient.ZREVRANGE("player_money_leaders", startRank, stopRank, async (err, pkeys) => {
        const leaders = [];
        if (pkeys)
          for (let i = 0; i < pkeys.length; i++) {
            const player = await this.getPlayer(pkeys[i]);
            const p = { ...player, rank: startRank + i + 1 };
            leaders.push(p);
          }
        resolve(leaders);
      });
    });
  });
}

exports.setPlayer = (pid, doc) => {
  // oyuncu profil bilgisini player_profiles listesine ekle
  const hset = this.rClient.HSET("player_profiles", pid.toString(), JSON.stringify(doc));
  // oyuncu paras??n?? player_money_leaders listesine ekle
  const zadd = this.rClient.ZADD("player_money_leaders", doc.money ? doc.money : 0, pid.toString());
  // skor tablosuna ekle
  // this.setPlayerDailyScore(pid, 0);
  return hset, zadd;
}


exports.scoresDay = 1;

exports.setPlayerDailyScore = (pid, score) => {
  // table name => `players_scores::${Date.now()}` yap??lacak
  // Date.now ile 7 g??nden sonra yeni kay??t o g??n??n tarihine g??re olu??turulaca???? i??in tablo silme i??lemin veri kayb?? olmaz
  return this.rClient.ZINCRBY(`players_scores::${this.scoresDay}`, score, pid.toString());
}

exports.getPlayerTotalScoreAndDailyDiff = (pid) => {
  if (pid == null) {
    return null;
  }
  return new Promise((resolve, reject) => {
    this.rClient
      .multi()
      .ZSCORE("players_scores::1", pid.toString())
      .ZSCORE("players_scores::2", pid.toString())
      .ZSCORE("players_scores::3", pid.toString())
      .ZSCORE("players_scores::4", pid.toString())
      .ZSCORE("players_scores::5", pid.toString())
      .ZSCORE("players_scores::6", pid.toString())
      .ZSCORE("players_scores::7", pid.toString())
      .exec((err, scores) => {
        if (err) {
          console.log(err);
          return resolve({ score: 0, dailyDiff: 0 });
        }
        let total = 0;
        scores.map(d => {
          total = total + (d ? parseInt(d) : 0);
        });
        let dailyDiff = 0;
        if (this.scoresDay - 1 > 0) {
          let currScore = scores[this.scoresDay - 1];
          currScore = currScore ? parseInt(currScore) : 0;
          let oldScore = scores[this.scoresDay - 2];
          oldScore = oldScore ? parseInt(oldScore) : 0;
          dailyDiff = currScore - oldScore;
        }
        resolve({ score: total, dailyDiff: dailyDiff });
      });
  });
}

exports.getPlayersTotalScores = () => {
  return new Promise((resolve, reject) => {
    this.rClient
      .multi()
      .ZRANGE("players_scores::1", 0, -1, "WITHSCORES")
      .ZRANGE("players_scores::2", 0, -1, "WITHSCORES")
      .ZRANGE("players_scores::3", 0, -1, "WITHSCORES")
      .ZRANGE("players_scores::4", 0, -1, "WITHSCORES")
      .ZRANGE("players_scores::5", 0, -1, "WITHSCORES")
      .ZRANGE("players_scores::6", 0, -1, "WITHSCORES")
      .ZRANGE("players_scores::7", 0, -1, "WITHSCORES")
      .exec((err, tables) => {
        if (err) {
          console.log(err);
          return resolve([]);
        }
        const totalScores = [];
        // tables: [ ["key","score"], ["key","score"], ... ]
        for (let i = 0; i < tables.length; i++) {
          const playersWithScores = tables[i];
          // playersWithScores: ["key", "score", "key", "score", ...]
          for (let k = 0; k < playersWithScores.length; k += 2) {
            const pid = playersWithScores[k];
            totalScores[pid] = (totalScores[pid] ? parseInt(totalScores[pid]) : 0) + parseInt(playersWithScores[k + 1]);
          }
        }
        resolve(totalScores);
      });
  });
}


exports.delDailyScores = () => {
  this.rClient.DEL("players_scores::1");
  this.rClient.DEL("players_scores::2");
  this.rClient.DEL("players_scores::3");
  this.rClient.DEL("players_scores::4");
  this.rClient.DEL("players_scores::5");
  this.rClient.DEL("players_scores::6");
  this.rClient.DEL("players_scores::7");
}

exports.delPlayer = (pid) => {
  this.rClient.HDEL("player_profiles", pid);
  this.rClient.ZREM("player_money_leaders", pid);
}