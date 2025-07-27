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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
// common functions
const now = new Date();
const sevenDaysAge = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStatsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = user_model_1.UserModel.countDocuments();
    const totalActiveUserPromise = user_model_1.UserModel.countDocuments({
        isActive: user_interface_1.IsActive.ACTIVE,
    });
    const totalInActiveUserPromise = user_model_1.UserModel.countDocuments({
        isActive: user_interface_1.IsActive.INACTIVE,
    });
    const totalBlockedUserPromise = user_model_1.UserModel.countDocuments({
        isActive: user_interface_1.IsActive.BLOCKED,
    });
    const newUserInLastSevenDaysPromise = user_model_1.UserModel.countDocuments({
        createdAt: { $gte: sevenDaysAge },
    });
    const newUserInLastThirtyDaysPromise = user_model_1.UserModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const usersByRolePromise = user_model_1.UserModel.aggregate([
        // state-01: grouping users by role and count total users in each role
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalUsers, totalActiveUser, totalInActiveUser, totalBlockedUser, newUserInLastSevenDays, newUserInLastThirtyDays, usersByRole,] = yield Promise.all([
        totalUsersPromise,
        totalActiveUserPromise,
        totalInActiveUserPromise,
        totalBlockedUserPromise,
        newUserInLastSevenDaysPromise,
        newUserInLastThirtyDaysPromise,
        usersByRolePromise,
    ]);
    return {
        totalUsers,
        totalActiveUser,
        totalInActiveUser,
        totalBlockedUser,
        newUserInLastSevenDays,
        newUserInLastThirtyDays,
        usersByRole,
    };
});
const getTourStatsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalTourPromise = tour_model_1.TourModel.countDocuments();
    const totalTourByTourTypePromise = tour_model_1.TourModel.aggregate([
        // stage-01: connect tour type model with tour [lookup stage]
        {
            $lookup: {
                from: 'tourtypes',
                localField: 'tourType',
                foreignField: '_id',
                as: 'type',
            },
        },
        // stage 02:  Unwind the array to object
        {
            $unwind: '$type',
        },
        // stage 03: grouping tour type
        {
            $group: {
                _id: '$type.name',
                count: { $sum: 1 },
            },
        },
    ]);
    const avgTourCostPromise = tour_model_1.TourModel.aggregate([
        // stage 01: Group the cost from, do sum and avg the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: '$costFrom' },
            },
        },
    ]);
    const totalTourByDivisionPromise = tour_model_1.TourModel.aggregate([
        // stage-01: connect Division model with tour [lookup stage]
        {
            $lookup: {
                from: 'divisions',
                localField: 'division',
                foreignField: '_id',
                as: 'division',
            },
        },
        // stage 02:  Unwind the array to object
        {
            $unwind: '$division',
        },
        // stage 03: grouping tour type
        {
            $group: {
                _id: '$division.name',
                count: { $sum: 1 },
            },
        },
    ]);
    const totalHighestBookedTourPromise = booking_model_1.BookingModel.aggregate([
        // Stage 01: group the Tour
        {
            $group: {
                _id: '$tour',
                bookingCount: { $sum: 1 },
            },
        },
        // stage 02: sort the tour
        {
            $sort: {
                bookingCount: -1,
            },
        },
        // stage 03: limit the entry
        {
            $limit: 5,
        },
        // stage 04: lookup
        {
            $lookup: {
                from: 'tours',
                let: { tourId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$tourId'] },
                        },
                    },
                ],
                as: 'tour',
            },
        },
        // stage 05: unwind
        {
            $unwind: '$tour',
        },
        // stage 06: Project stage
        {
            $project: {
                bookingCount: 1,
                'tour.title': 1,
                'tour.slug': 1,
            },
        },
    ]);
    const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHighestBookedTour,] = yield Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise,
    ]);
    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour,
    };
});
const getBookingStatsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalBookingPromise = booking_model_1.BookingModel.countDocuments();
    const totalBookingByStatusPromise = booking_model_1.BookingModel.aggregate([
        // Stage-1: Group Stage
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const bookingPerTourPromise = booking_model_1.BookingModel.aggregate([
        // Stage 01: Group Stage
        {
            $group: {
                _id: '$tour',
                bookingCount: { $sum: 1 },
            },
        },
        // Stage 02: Sort in Desc order
        {
            $sort: {
                bookingCount: -1,
            },
        },
        // stage 03: limit stage
        {
            $limit: 10,
        },
        // Stage 04: Lookup
        {
            $lookup: {
                from: 'tours',
                localField: '_id',
                foreignField: '_id',
                as: 'tour',
            },
        },
        // stage 05: unwind stage
        {
            $unwind: '$tour',
        },
        // stage 06: project
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                'tour.title': 1,
                'tour.slug': 1,
            },
        },
    ]);
    const avgGuestPerBookingPromise = booking_model_1.BookingModel.aggregate([
        // Stage 01: Group
        { $group: { _id: null, avgGuestCount: { $avg: '$guestCount' } } },
    ]);
    const bookingLastSevenPromise = booking_model_1.BookingModel.countDocuments({
        createdAt: { $gte: sevenDaysAge },
    });
    const bookingLastThirtyPromise = booking_model_1.BookingModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    // distinct method is use to find unique values by a specific fields
    const totalBookingByUniqueUsersPromise = booking_model_1.BookingModel.distinct('user').then((user) => user.length);
    const [totalBooking, totalBookingByStatus, bookingPerTour, avgGuestPerBooking, bookingLastSeven, bookingLastThirty, totalBookingByUniqueUsers,] = yield Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingPerTourPromise,
        avgGuestPerBookingPromise,
        bookingLastSevenPromise,
        bookingLastThirtyPromise,
        totalBookingByUniqueUsersPromise,
    ]);
    return {
        totalBooking,
        totalBookingByStatus,
        bookingPerTour,
        avgGuestPerBooking: avgGuestPerBooking[0].avgGuestCount,
        bookingLastSeven,
        bookingLastThirty,
        totalBookingByUniqueUsers,
    };
});
const getPaymentStatsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPaymentPromise = payment_model_1.PaymentModel.countDocuments();
    const totalRevenuePromise = payment_model_1.PaymentModel.aggregate([
        // stage 01: matching
        {
            $match: { status: payment_interface_1.PAYMENT_STATUS.PAID },
        },
        // stage 02: grouping
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
            },
        },
    ]);
    const totalPaymentByStatusPromise = payment_model_1.PaymentModel.aggregate([
        // stage 01: grouping
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const avgPaymentAmountPromise = payment_model_1.PaymentModel.aggregate([
        // stage 01: grouping
        {
            $group: {
                _id: null,
                avgPaymentAmount: { $avg: '$amount' },
            },
        },
    ]);
    const paymentGatewayDataPromise = payment_model_1.PaymentModel.aggregate([
        // stage 01: grouping
        {
            $group: {
                _id: { $ifNull: ['$paymentGatewayData.status', 'UNKNOWN'] },
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalPayment, totalRevenue, totalPaymentByStatus, avgPaymentAmount, paymentGatewayData,] = yield Promise.all([
        totalPaymentPromise,
        totalRevenuePromise,
        totalPaymentByStatusPromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise,
    ]);
    return {
        totalPayment,
        totalRevenue,
        totalPaymentByStatus,
        avgPaymentAmount,
        paymentGatewayData,
    };
});
exports.StatsService = {
    getUserStatsFromDB,
    getTourStatsFromDB,
    getBookingStatsFromDB,
    getPaymentStatsFromDB,
};
