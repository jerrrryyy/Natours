const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//creating a new email class
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Madhav jain <${process.env.EMAIL_FROM}>`;
  }


  //used to transport email in different environemnts
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendinblue
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: process.env.SENDINBLUE_USERNAME,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //Activate in gmail "less secure app " option
    });
  }

  //send actual email 
  async send(template, subject) {
    //Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),

      //html:
    };

    //create a transport and send email
    this.newTransport();

    await this.newTransport().sendMail(mailOptions);
  }

  //we will basically use these below functions

  //methods that use send email method with actuall template
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the natours family ! ');
  }

  async sendPasswordReset(){
    await this.send('passwordReset','your password reset token (valid for only 10 minutes)')
  }
};

