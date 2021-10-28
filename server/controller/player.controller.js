const playerService = require('../services/player.service');

exports.create = (req, res) => {
  if (!req.body.username || !req.body.country) {
    return res.status(400).send({
      message: "Oyuncu username ve country içermelidir"
    });
  }
  const newPlayer = {
    country: req.body.country,
    username: req.body.username,
    money: req.body.money || 0,
  };
  playerService.create(newPlayer).then((data) => {
    res.send(data);
  }).catch(err => res.status(500).send({
    message: err.message || "Beklenmedik bir hata."
  }));
};

exports.findAll = (req, res) => {
  playerService.findAll().then(players => {
    res.send(players);
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Beklenmedik bir hata."
    });
  });
};

exports.findOne = (req, res) => {
  playerService.findOne(req.params.id)
    .then(player => {
      if (!player) {
        return res.status(404).send({
          message: "Oyuncu bulunamadı: " + req.params.id
        });
      }
      res.send(player); // send
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Oyuncu bulunamadı: " + req.params.id
        });
      }
      return res.status(500).send({
        message: "Oyuncu alınamadı: " + req.params.id
      });
    });
};

exports.leaders = (req, res) => {
  let limit = req.params.limit ? parseInt(req.params.limit) : 100;
  playerService.findLeaders(limit).then(players => {
    res.send(players);
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Beklenmedik bir hata."
    });
  });
};


exports.update = (req, res) => {
  if (!req.body || !req.body.username || !req.body.country) {
    return res.status(400).send({
      message: "Oyuncu boş olamaz"
    });
  }
  playerService.update(req.params.id, req.body)
    .then(player => {
      if (!player) {
        return res.status(404).send({
          message: "Oyuncu bulunamadı " + req.params.id
        });
      }
      res.send(player);
    }).catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Oyuncu güncellenirken hata oluştu " + req.params.id
      });
    });
};

exports.delete = (req, res) => {
  playerService.delete(req.params.id)
    .then(player => {
      if (!player) {
        return res.status(404).send({
          message: "Oyuncu bulunamadı: " + req.params.id
        });
      }
      res.send({ message: "Silme işlemi gerçekleşti!" });
    }).catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "Oyuncu bulunamadı " + req.params.id
        });
      }
      return res.status(500).send({
        message: "Oyuncu silme işlemi sırasında hata oluştu: " + req.params.id
      });
    });
};
