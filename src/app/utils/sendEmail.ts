/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import { environmentVariables } from '../configs/env';
import AppError from '../errorHelpers/AppError';
import path from 'path';
import ejs from 'ejs';

const transporter = nodemailer.createTransport({
  secure: true,
  auth: {
    user: environmentVariables.EMAIL_SENDER.SMTP_USER,
    pass: environmentVariables.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(environmentVariables.EMAIL_SENDER.SMTP_PORT),
  host: environmentVariables.EMAIL_SENDER.SMTP_HOST,
});

// send mail interface
interface ISendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendMail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: ISendEmailOptions) => {
  try {
    // console.log(to)
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: environmentVariables.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        fileName: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    if (environmentVariables.NODE_ENV === 'development') {
      console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    }
  } catch (error: any) {
    if (environmentVariables.NODE_ENV === 'development') {
      console.error('Found Error while sending email: ', error);
      if (error.responseCode) {
        console.error('Nodemailer Response Code:', error.responseCode);
      }
      if (error.response) {
        console.error('Nodemailer Response:', error.response); // This is the most important one!
      }
      if (error.command) {
        console.error('Nodemailer Command:', error.command);
      }
    }
    throw new AppError(401, 'Email Error: Authentication failed or SMTP configuration issue.');
  }
};
