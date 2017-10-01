const async = require('async');
const configModule = require(__basedir + 'api/modules/config');
const mailModule = require(__basedir + 'api/modules/mail');
const minerManager = require('../lib/minerManager');

let stats = {};
const offlineCounter = {};
const noMinerRunning = {};

async function getAllMinerStats() {
  const devices = configModule.config.devices;
  const deviceStats = await new Promise((resolve, reject) => {
    async.map(devices, async (device) => {
      return await minerManager(device);
    }, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });

  deviceStats
    .map((device) => updateOffline(device))
    .filter((device) => device.entries !== null)
    .map((device) => updateNoMinerRunning(device));

  const tmpStats = {
    running: 0,
    stopped: 0,
    offline: 0,
    hr: 0,
    accepted: 0,
    rejected: 0,
    stoppedHostnames: [],
    offlineHostnames: [],
  };
  deviceStats
    .forEach((device) => {
      if (device.entries === null) {
        tmpStats.offline += 1;
        tmpStats.offlineHostnames.push(device.hostname);
        return;
      }
      if (Object.keys(device.entries).length === 0) {
        tmpStats.stopped += 1;
        tmpStats.stoppedHostnames.push(device.hostname);
        return;
      }
      tmpStats.running += 1;
      Object.keys(device.entries).forEach((key) => {
          tmpStats.hr += device.entries[key].hashrate ? device.entries[key].hashrate : 0; // kh for xmr
          tmpStats.accepted += device.entries[key].accepted ? device.entries[key].accepted : 0;
          tmpStats.rejected += device.entries[key].rejected ? device.entries[key].rejected : 0;
      });
    });
  stats = tmpStats;
}

function updateOffline(device) {
  if (!(offlineCounter[device.id] >= 0)) {
    offlineCounter[device.id] = 0;
  }

  if (device.entries === null) {
    offlineCounter[device.id] += 1;
  } else {
    if (offlineCounter[device.id] >= 3) {
      // notify
      mailModule.sendMail(device, 'online again');
    }
    offlineCounter[device.id] = 0;
  }

  if (offlineCounter[device.id] === 3) {
    // notify
    mailModule.sendMail(device, 'offline');
  }
  if (offlineCounter[device.id] > 10000) {
    offlineCounter[device.id] = 4;
  }
  return device;
}

function updateNoMinerRunning(device) {
  if (!(noMinerRunning[device.id] >= 0)) {
    noMinerRunning[device.id] = 0;
  }

  if (Object.keys(device.entries).length === 0) {
    noMinerRunning[device.id] += 1;
  } else {
    if (noMinerRunning[device.id] >= 2) {
      // notify
      mailModule.sendMail(device, 'running again');
    }
    noMinerRunning[device.id] = 0;
  }

  if (noMinerRunning[device.id] === 2) {
    // notify
    mailModule.sendMail(device, 'stopped');
  }
  if (noMinerRunning[device.id] > 10000) {
    noMinerRunning[device.id] = 3;
  }
  return device;
}

function getStats(req, res) {
  res.send(stats);
}

async function init() {
  setInterval(getAllMinerStats, configModule.config.interval * 1000);
  getAllMinerStats();
}

module.exports = {
  getStats,
};

setTimeout(init, 1000);