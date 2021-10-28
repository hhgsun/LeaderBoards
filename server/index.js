const app = require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const cacheService = require('./services/cache.service');
const replayWeeklyService = require('./services/replayWeekly.service');
const playerService = require('./services/player.service');
const io = require('socket.io')(server, { cors: { origin: '*' } });
const cron = require('node-cron');
const { GAME_CYCLE_TIME, GAME_FINISH_ROUND } = require('./config');

app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    "message": "Hello!",
    "players_endpoint": "/players",
    "player_leaders": "/players/leaders/:limit"
  });
});

// ROUTES
require('./routes/player.routes.js')(app);

server.listen(3001, function () {
  console.log('HTTP server started on port 3001');
});


// initial redis data and cron
(async () => {
  await playerService.findAll();

  // https://crontab.guru/every-day // hergün olması için: "0 0 * * *"
  // şuanda her 1 dk da tekrarlanıyor
  console.log("RUNING CRON DAY:", cacheService.scoresDay);

  cron.schedule(GAME_CYCLE_TIME, () => {
    cacheService.scoresDay++;
    console.log("RUNING CRON DAY:", cacheService.scoresDay);
    if (cacheService.scoresDay > GAME_FINISH_ROUND) {
      cacheService.scoresDay = 1; //reset day
      // end game proccess
      replayWeeklyService.resetWeeklyEndGame().then(() => {

        cacheService.delDailyScores(); // delete daily scores

        // yeni hafta olduğunda liderler tekrar gönderilir
        playerService.findLeaders(leadersLimit).then(leaders => {
          io.sockets.emit('leaders', leaders);
        });

      }).catch(err => console.log("!!! ERROR", err));
    } else {
      // yeni gün olduğunda liderler tekrar gönderilir
      playerService.findLeaders(leadersLimit).then(leaders => {
        io.sockets.emit('leaders', leaders);
      });
    }
  });

})();


const leadersLimit = 100;

io.on('connection', async function (socket) {
  console.log(`${socket.id} User Connect`);
  socket.on('disconnect', () => console.log(`${socket.id} User Disconnect`));

  // socket e bağlantıya giren kullanıcıya leaders gönderilir
  playerService.findLeaders(leadersLimit).then(leaders => {
    socket.emit('leaders', leaders);
  });

  // aktif kullanıcının playerId si alınır
  socket.on('playerRank', function (playerId) {
    // aktif kullanıcının derecesi playerRank:${playerId} ile gönderilir
    if (playerId)
      playerService.findPlayerRankAndRange(playerId).then(players => {
        socket.emit(`playerRank:${playerId}`, players);
      });
  });

  // bir kullanıcı puan kazandığı durumda;
  socket.on('addScoreById', function ({ playerId, score }) {
    if (playerId && score) {
      // puan redise gönderilir (günlük olarak)
      cacheService.setPlayerDailyScore(playerId, score);

      // zaten dinlediği leaders tablosu yeniden gönderilir
      playerService.findLeaders(leadersLimit).then(leaders => {
        // tüm kullanıcıların leaders tablosu yenilenmesi için tümüne gönderilir
        io.sockets.emit('leaders', leaders);
      });
    }
  });

  /**
   * CLIENT TARAFINDA
   * - client tarafında "leaders" dinlenir
   * - leaders client'a düştüğü durumda "playerRank"(playerId) emmit olur
   * - playerRank ile ilgili kullanıcının derecesini alınır
   * - "playerRank:${playerId}" dinlenir ilgili kullanıcının derecesi gelir
   * BU ŞEKİLDE "leaders" her tetiklendiğinde "playerRank"(playerId) da yeniden tetiklenmesi gerekir
   */
});

