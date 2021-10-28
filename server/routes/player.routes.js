module.exports = (app) => {
  const playerCtrl = require('../controller/player.controller');

  app.get('/players', playerCtrl.findAll);
  app.get('/players/:id', playerCtrl.findOne);
  app.get('/players/leaders/:limit', playerCtrl.leaders);
  app.post('/players', playerCtrl.create);
  app.put('/players/:id', playerCtrl.update);
  app.delete('/players/:id', playerCtrl.delete);
}