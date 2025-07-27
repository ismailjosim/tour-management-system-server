"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const mongoose_1 = require("mongoose");
const payment_interface_1 = require("./payment.interface");
const paymentSchema = new mongoose_1.Schema({
    booking: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: Object.values(payment_interface_1.PAYMENT_STATUS),
        default: payment_interface_1.PAYMENT_STATUS.UNPAID,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentGatewayData: {
        type: mongoose_1.Schema.Types.Mixed, // payment gateway might be any type
    },
    invoiceUrl: {
        type: String,
    },
});
exports.PaymentModel = (0, mongoose_1.model)('Payment', paymentSchema);
