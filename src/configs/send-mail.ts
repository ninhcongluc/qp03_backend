import nodemailer from 'nodemailer';

class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-password'
      }
    });
  }

  sendEmail(mailOptions: any): any {
    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;
