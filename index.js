const express = require('express');
const bodyParser = require('body-parser');

global.__basedir = __dirname + '/';

const app = express();

app.use(bodyParser.json({
  limit: '50mb'
}));

require(__basedir + 'api/routes')(app);

const listener = app.listen(process.env.PORT || 8086, () => {
  console.log(`server running on port ${listener.address().port}`);
});

process.on('uncaughtException', (err) => {
  console.error(err.stack);
});