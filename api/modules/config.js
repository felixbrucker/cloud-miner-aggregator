const fs = require('fs');

const configPath='data/settings.json';

if (!fs.existsSync('data')){
  fs.mkdirSync('data');
}
const config = module.exports = {
  config: {
    interval: 5 * 60, // seconds
    devices: [],
  },
  saveConfig: async () => {
    console.log('writing config to file..');
    return new Promise((resolve, reject) => {
      fs.writeFile(configPath, JSON.stringify(config.config,null,2), (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  },
  loadConfig: async () => {
    return new Promise((resolve, reject) => {
      fs.stat(configPath, async (err) => {
        if (err && err.code !== 'ENOENT') {
          return reject(err);
        }
        if (err) {
          //default conf
          if (process.env.CONFIG) {
            config.config = JSON.parse(process.env.CONFIG);
          }
          await config.saveConfig();
          await config.loadConfig();
          return resolve();
        }
        fs.readFile(configPath, 'utf8', (err, data) => {
          if (err) {
            return reject(err);
          }
          config.config = JSON.parse(data);
          return resolve();
        });
      });
    });
  }
};
console.log('initializing, please wait...');
config.loadConfig();