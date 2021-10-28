const playerService = require('./player.service');
const cacheService = require('./cache.service');

exports.resetWeeklyEndGame = () => {
  return new Promise((resolve, reject) => {
    cacheService.getPlayersTotalScores().then(async playersTotalScores => {
      // score a göre sırala
      playersTotalScores = Object.entries(playersTotalScores).sort((a, b) => b[1] - a[1]).map(p => p);

      let totalMoney = 0;

      for (const index in playersTotalScores) {
        const pid = playersTotalScores[index][0];
        const score = playersTotalScores[index][1];

        // her kullanıcı kazandığı skor kadar para kazanır 1 skor = 1 money
        const player = await cacheService.getPlayer(pid);
        cacheService.setPlayer(pid, { ...player, money: player.money + score }); //redis e kaydet
        playerService.update(pid, { money: player.money + score }); //mongo ya kaydet

        totalMoney = totalMoney + score;
      }

      lootLeaders(totalMoney).then(() => {
        resolve(true);
      }).catch(err => reject(err));

    }).catch(err => reject(err));
  })
}

const lootLeaders = (totalMoney) => {
  let loot = totalMoney * 0.02; // toplam paranın %2 si havuza
  return new Promise((resolve, reject) => {
    // ödül havuzu leaders tablosuna dağıtılır
    console.log("ÖDÜL HAVUZU", loot);
    cacheService.getLeaders(100).then(leaders => {
      leaders.map(leader => {
        if (leader.rank == 1) {
          console.log("1. oyuncu ödülü", loot * 0.20);
          leader.money = leader.money + (loot * 0.20);
        } else if (leader.rank == 2) {
          console.log("2. oyuncu ödülü", loot * 0.15);
          leader.money = leader.money + (loot * 0.15);
        } else if (leader.rank == 3) {
          console.log("3. oyuncu ödülü", loot * 0.10);
          leader.money = leader.money + (loot * 0.10);
        } else {
          console.log("97 oyuncuya ödül:", loot * 0.55, "her birine:", (loot * 0.55) / 97);
          leader.money = leader.money + ((loot * 0.55) / 97);
        }
        cacheService.setPlayer(leader._id, leader); // redise güncel hali set edilir
        playerService.update(leader._id, { money: leader.money }); // mongo oyuncu güncellenir
      });
      resolve(true);
    }).catch(err => reject(err));
  });
}