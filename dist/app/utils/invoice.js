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
exports.generatePDF = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const pdfkit_1 = __importDefault(require("pdfkit"));
const env_1 = require("../configs/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const generatePDF = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const buffer = [];
            doc.on('data', (chunk) => buffer.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffer)));
            doc.on('error', (err) => reject(err));
            // header section
            doc
                .fontSize(20)
                .fillColor('#0D6EFD')
                .text('Travel Booking Invoice', { align: 'center' });
            // === INVOICE DETAILS ===
            doc
                .fontSize(12)
                .fillColor('black')
                .text(`Invoice Date: ${new Date(data.bookingDate).toLocaleDateString()}`, { align: 'right' })
                .text(`Transaction ID: ${data.transactionId}`, { align: 'right' });
            doc.moveDown(2);
            // === CUSTOMER DETAILS ===
            doc.fontSize(12).text('Customer Details:', { underline: true });
            doc.text(`Name: ${data.userName}`);
            doc.text(`Email: ${data.userEmail}`);
            doc.text(`Phone: ${data.userPhone || '+0880170000000'}`);
            doc.text(`Address: ${data.userAddress || 'Dhaka, Bangladesh'}`);
            doc.moveDown(2);
            // === TOUR DETAILS TABLE ===
            doc.text('Booking Summary:', { underline: true });
            doc.moveDown(0.5);
            // Table header
            doc.font('Helvetica-Bold');
            doc.text('Particular', 50, doc.y, { continued: true });
            doc.text('Price / person', 200, doc.y, { continued: true });
            doc.text('Guests', 330, doc.y, { continued: true });
            doc.text('Total', 430, doc.y);
            doc.moveDown(0.5);
            // Table content
            doc.font('Helvetica');
            doc.text(data.tourTitle, 50, doc.y, { continued: true });
            doc.text(`${(data.totalAmount / data.guestCount).toFixed(2)}`, 200, doc.y, { continued: true });
            doc.text(`${data.guestCount}`, 330, doc.y, { continued: true });
            doc.text(`${data.totalAmount.toFixed(2)}`, 430, doc.y);
            doc.moveDown(1.5);
            // === TOTALS ===
            const tax = data.totalAmount * 0.1;
            const netTotal = data.totalAmount + tax;
            doc.text(`Tax (10%): $${tax.toFixed(2)}`, { align: 'right' });
            doc.text(`Net Total: $${netTotal.toFixed(2)}`, { align: 'right' });
            doc.moveDown(2);
            // === FOOTER ===
            doc
                .fontSize(12)
                .fillColor('#555')
                .text('Thank you for booking with us!', { align: 'center' });
            doc.end();
        });
    }
    catch (error) {
        if (env_1.environmentVariables.NODE_ENV === 'development') {
            console.log(error);
        }
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Found Error While generation PDF: ${error.message}`);
    }
});
exports.generatePDF = generatePDF;
