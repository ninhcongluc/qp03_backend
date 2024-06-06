import nodemailer from 'nodemailer';
require('dotenv').config();

class EmailService {
    transporter: any;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    sendEmail(mailOptions: any) {
        return this.transporter.sendMail(mailOptions);
    }
}

module.exports = EmailService;