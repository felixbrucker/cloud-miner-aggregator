const express = require('express');

module.exports = function(app) {
  const router = express.Router();

  const statsController = require(__basedir + 'api/controllers/statsController');

  router.get('/mining/stats', statsController.getStats);

  app.use('/api', router);
};