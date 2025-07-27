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
exports.BookingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const tour_model_1 = require("../tour/tour.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const getTransactionId_1 = require("../../utils/getTransactionId");
const createBookingIntoDB = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.BookingModel.startSession();
    session.startTransaction();
    try {
        // 1️⃣ Generate Unique Transaction ID
        const transactionId = (0, getTransactionId_1.getTransactionId)();
        // 2️⃣ Check User Info
        const checkUserInfo = yield user_model_1.UserModel.findById(userId).session(session);
        if (!(checkUserInfo === null || checkUserInfo === void 0 ? void 0 : checkUserInfo.phone) || !(checkUserInfo === null || checkUserInfo === void 0 ? void 0 : checkUserInfo.address)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Please Update Your Profile to Book a Tour');
        }
        // 3️⃣ Fetch Tour Info
        const tour = yield tour_model_1.TourModel.findById(payload.tour)
            .select('costFrom')
            .session(session);
        if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'No Tour Cost Found');
        }
        // 4️⃣ Calculate Total Amount
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        // 5️⃣ Create Booking
        const booking = yield booking_model_1.BookingModel.create([
            Object.assign({ user: userId, status: booking_interface_1.BOOKING_STATUS.PENDING }, payload),
        ], { session });
        // 6️⃣ Create Payment
        const payment = yield payment_model_1.PaymentModel.create([
            {
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId,
                amount,
            },
        ], { session });
        // 7️⃣ Update Booking with Payment ID
        const updatedBooking = yield booking_model_1.BookingModel.findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, session })
            .populate('user', 'name email phone address')
            .populate('tour', 'title costFrom')
            .populate('payment');
        // 8️⃣ SSL Commerz payment
        const userAddress = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userEmail = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email;
        const userPhoneNumber = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone;
        const userName = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name;
        const sslPayload = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId,
        };
        const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        // console.log(sslPayment)
        // ✅ Commit transaction
        yield session.commitTransaction();
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getAllBookingFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return null;
});
const getUserBookingFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return null;
});
const getSingleBookingFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return null;
});
const updateBookingStatusIntoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return null;
});
exports.BookingService = {
    createBookingIntoDB,
    getAllBookingFromDB,
    getUserBookingFromDB,
    getSingleBookingFromDB,
    updateBookingStatusIntoDB,
    // ...
};
