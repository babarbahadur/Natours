const nodemailer = require('nodemailer');




const sendEmail = async options => {
  // 1) Create a transporter

  var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a31090cdd90e82", //generated by Mailtrap
      pass: "9985f6c1b749ba" //generated by Mailtrap
    }
  });

//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });


transporter.verify(function(error, success) {
    if (error) {
         console.log(error);
    } else {
         console.log('Server is ready to take our messages');
    }
 });



  // 2) Define the email options
  const mailOptions = {
    from: 'Jonas Schmedtmann <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
};

module.exports = sendEmail;


// const nodemailer = require('nodemailer');

// const sendEmail = async options => {
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({ 
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     })

//     // 2) Define the email option
//     const mailOptions = {
//         from: 'Natours <support@natours.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     }
//     // 3) Actually send th email

//     await transporter.sendMail(mailOptions);
// }

// module.exports = sendEmail