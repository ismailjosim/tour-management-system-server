"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importStar(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const cloudinary_config_1 = require("../../configs/cloudinary.config");
const initPaymentIntoDB = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.PaymentModel.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment not Found. You didn't booked this tour yet!");
    }
    const booking = yield booking_model_1.BookingModel.findById(payment.booking);
    if (payment.status === payment_interface_1.PAYMENT_STATUS.PAID) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Payment already completed.');
    }
    if ((booking === null || booking === void 0 ? void 0 : booking.status) === booking_interface_1.BOOKING_STATUS.COMPLETE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Booking is already confirmed.');
    }
    // SSL Commerz payment
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhoneNumber = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId,
    };
    const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL,
        booking: booking,
    };
});
const successPaymentIntoDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.BookingModel.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.PaymentModel.findOneAndUpdate({
            transactionId: query.transactionId,
        }, { status: payment_interface_1.PAYMENT_STATUS.PAID }, { new: true, runValidators: true, session });
        if (!updatedPayment) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Payment Not Found');
        }
        // 🧠 Tell TypeScript: "This is a PopulatedBooking"
        const updatedBooking = yield booking_model_1.BookingModel.findByIdAndUpdate(updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.COMPLETE }, { new: true, runValidators: true, session })
            .populate('user', 'name email phone address')
            .populate('tour', 'title')
            .populate('payment', 'transactionId amount');
        if (!updatedBooking) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Tour Not Found');
        }
        const user = updatedBooking.user;
        const invoiceData = {
            bookingDate: updatedBooking.createdAt,
            guestCount: updatedBooking.guestCount,
            totalAmount: updatedPayment.amount,
            tourTitle: updatedBooking.tour.title,
            transactionId: updatedPayment.transactionId,
            userName: user.name,
            userEmail: user.email,
        };
        const pdfBuffer = yield (0, invoice_1.generatePDF)(invoiceData);
        // manually upload PDF into our cloudinary store
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, 'invoice');
        yield payment_model_1.PaymentModel.findByIdAndUpdate(updatedPayment._id, {
            invoiceUrl: cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url,
        }, { runValidators: true, session });
        // send user email
        yield (0, sendEmail_1.sendMail)({
            to: user.email,
            subject: 'Your Booking Invoice',
            templateName: 'invoice',
            templateData: {
                userName: invoiceData.userName,
                tourTitle: invoiceData.tourTitle,
                transactionId: invoiceData.transactionId,
                totalAmount: invoiceData.totalAmount,
                bookingDate: invoiceData.bookingDate,
                userEmail: invoiceData.userEmail,
            },
            attachments: [
                {
                    filename: 'invoice.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });
        yield session.commitTransaction();
        session.endSession();
        return { success: true, message: 'Payment Completed Successfully' };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const failPaymentIntoDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.BookingModel.startSession();
    session.startTransaction();
    try {
        // 1️⃣ Update payment status to PAID
        const updatedPayment = yield payment_model_1.PaymentModel.findOneAndUpdate({
            transactionId: query.transactionId,
        }, { status: payment_interface_1.PAYMENT_STATUS.FAILED }, { runValidators: true, session });
        // 2️⃣ update booking status to Confirm
        yield booking_model_1.BookingModel.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.FAILED }, { runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return { success: true, message: 'Payment Failed' };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const cancelPaymentIntoDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.BookingModel.startSession();
    session.startTransaction();
    try {
        // 1️⃣ Update payment status to PAID
        const updatedPayment = yield payment_model_1.PaymentModel.findOneAndUpdate({
            transactionId: query.transactionId,
        }, { status: payment_interface_1.PAYMENT_STATUS.CANCELLED }, { runValidators: true, session });
        // 2️⃣ update booking status to Confirm
        yield booking_model_1.BookingModel.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.CANCEL }, { runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return { success: true, message: 'Payment Canceled' };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getInvoiceDownloadURLFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.PaymentModel.findById(id).select('invoiceUrl');
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Payment Not Found');
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'InvoiceUrl Not Found');
    }
    return payment;
});
exports.PaymentService = {
    initPaymentIntoDB,
    successPaymentIntoDB,
    failPaymentIntoDB,
    cancelPaymentIntoDB,
    getInvoiceDownloadURLFromDB,
};
