"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../configs/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const transporter = nodemailer_1.default.createTransport({
    secure: true,
    auth: {
        user: env_1.environmentVariables.EMAIL_SENDER.SMTP_USER,
        pass: env_1.environmentVariables.EMAIL_SENDER.SMTP_PASS,
    },
    port: Number(env_1.environmentVariables.EMAIL_SENDER.SMTP_PORT),
    host: env_1.environmentVariables.EMAIL_SENDER.SMTP_HOST,
});
const sendMail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, templateName, templateData, attachments, }) {
    try {
        console.log(to);
        const templatePath = path_1.default.join(__dirname, `templates/${templateName}.ejs`);
        const html = yield ejs_1.default.renderFile(templatePath, templateData);
        const info = yield transporter.sendMail({
            from: env_1.environmentVariables.EMAIL_SENDER.SMTP_FROM,
            to,
            subject,
            html: html,
            attachments: attachments === null || attachments === void 0 ? void 0 : attachments.map((attachment) => ({
                fileName: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            })),
        });
        if (env_1.environmentVariables.NODE_ENV === 'development') {
            console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
        }
    }
    catch (error) {
        if (env_1.environmentVariables.NODE_ENV === 'development') {
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
        throw new AppError_1.default(401, 'Email Error: Authentication failed or SMTP configuration issue.');
    }
});
exports.sendMail = sendMail;
