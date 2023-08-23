import * as nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import { User } from '@prisma/client';
import { EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_USER } from '@/config';

export default class Email {
  #firstName: string;
  #to: string;
  #from: string;
  constructor(private user: User, private url: string) {
    this.#firstName = user.username;
    this.#to = user.email;
    this.#from = `Keyboards Of Warriors <no-reply@keyboardsofwarriors.com>`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  private async send(template: string, subject: string) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.#firstName,
      subject,
      url: this.url,
    });
    // Create mailOptions
    const mailOptions = {
      from: this.#from,
      to: this.#to,
      subject,
      text: convert(html),
      html,
    };

    // Send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerificationCode() {
    await this.send('verificationCode', 'Your account verification code');
  }

  async sendPasswordResetToken() {
    await this.send('resetPassword', 'Your password reset token (valid for only 10 minutes)');
  }
}
