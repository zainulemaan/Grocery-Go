const nodemailer = require('nodemailer');
const { create } = require('../models/Usermodels');
const sendEmail = async (options) => {
  //1- Transpoter
  const Transpoter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    // MCXFTT1EB4X3U8BPZ67F38JF
    // 8948NE1HKPR8P6UT2CJSH8TR
    // service: 'gmail',
    auth: {
      user: '62c17850ac6f24',
      pass: '33dbd0b8e91ad9',
    },
  });
  // 2-Email Options
  const emailOptions = {
    from: 'GroceryGo <za441568@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await Transpoter.sendMail(emailOptions);
};
module.exports = sendEmail;
