/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from 'pdfkit';
import AppError from '../errorHelpers/AppError';
import StatusCodes from 'http-status-codes';

// Extend the Invoice Interface
export interface IInvoiceData {
  transactionId: string;
  bookingDate: Date;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userAddress?: string;
  tourTitle: string;
  guestCount: number;
  totalAmount: number;
}

export const generatePDF = async (data: IInvoiceData): Promise<Buffer<ArrayBufferLike>> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffer: Uint8Array[] = [];

      doc.on('data', (chunk) => buffer.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffer)));
      doc.on('error', (err) => reject(err));

      // header section
      doc.fontSize(20).fillColor('#0D6EFD').text('Travel Booking Invoice', { align: 'center' });

      // === INVOICE DETAILS ===
      doc
        .fontSize(12)
        .fillColor('black')
        .text(`Invoice Date: ${new Date(data.bookingDate).toLocaleDateString()}`, {
          align: 'right',
        })
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
      doc.text(`${(data.totalAmount / data.guestCount).toFixed(2)}`, 200, doc.y, {
        continued: true,
      });
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
  } catch (error: any) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Found Error While generation PDF: ${error.message}`
    );
  }
};
