const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  secure: (process.env.MAIL_SECURE === 'true'),
  port: parseInt(process.env.MAIL_PORT, 10),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function sendMail(device, msg) {
  const mailOptions = {
    from: process.env.MAIL_USER, // sender address
    to:  process.env.MAIL_TO, // list of receivers
    subject: `${device.name} is ${msg}!`, // Subject line
    text: `EventTime: ${new Date().toISOString()}\nURL: ${device.hostname}` // plaintext body
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err){
        return reject(err);
      }
      return resolve(info);
    });
  });
}

module.exports = {
  sendMail,
};