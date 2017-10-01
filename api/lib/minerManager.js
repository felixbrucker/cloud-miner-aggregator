const https = require('https');
const axios = require('axios');

module.exports = async (device) => {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  let minerData = null;
  try {
    minerData = await axios.get(`${device.hostname}/api/mining/stats`, {httpsAgent: agent});
  } catch (err) { console.error(err); }

  return {
    name: device.name,
    entries: minerData ? minerData.data.entries : null,
    hostname: device.hostname,
  };
};