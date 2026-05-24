/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookingModel } from '../booking/booking.model';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { PaymentModel } from '../payment/payment.model';
import { TourModel } from '../tour/tour.model';
import { IsActive, Role } from '../user/user.interface';
import { UserModel } from '../user/user.model';
import { GuideService } from '../guide/guide.service';
import { GuideModel } from '../guide/guide.model';
import { IGuideStatus } from '../guide/guide.interface';
import { DivisionModel } from '../division/division.model';

// common functions
const now = new Date();

const sevenDaysAge = new Date(now).setDate(now.getDate() - 7);

const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStatsFromDB = async () => {
  const totalUsersPromise = UserModel.countDocuments();
  const totalActiveUserPromise = UserModel.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUserPromise = UserModel.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUserPromise = UserModel.countDocuments({
    isActive: IsActive.BLOCKED,
  });
  const newUserInLastSevenDaysPromise = UserModel.countDocuments({
    createdAt: { $gte: sevenDaysAge },
  });
  const newUserInLastThirtyDaysPromise = UserModel.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const usersByRolePromise = UserModel.aggregate([
    // state-01: grouping users by role and count total users in each role
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalUsers,
    totalActiveUser,
    totalInActiveUser,
    totalBlockedUser,
    newUserInLastSevenDays,
    newUserInLastThirtyDays,
    usersByRole,
  ] = await Promise.all([
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
};

const getTourStatsFromDB = async () => {
  const totalTourPromise = TourModel.countDocuments();
  const totalTourByTourTypePromise = TourModel.aggregate([
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

  const avgTourCostPromise = TourModel.aggregate([
    // stage 01: Group the cost from, do sum and avg the sum
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: '$costFrom' },
      },
    },
  ]);

  const totalTourByDivisionPromise = TourModel.aggregate([
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

  const totalHighestBookedTourPromise = BookingModel.aggregate([
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

  const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHighestBookedTour] =
    await Promise.all([
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
};

const getBookingStatsFromDB = async () => {
  const totalBookingPromise = BookingModel.countDocuments();
  const totalBookingByStatusPromise = BookingModel.aggregate([
    // Stage-1: Group Stage
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingPerTourPromise = BookingModel.aggregate([
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

  const avgGuestPerBookingPromise = BookingModel.aggregate([
    // Stage 01: Group
    { $group: { _id: null, avgGuestCount: { $avg: '$guestCount' } } },
  ]);
  const bookingLastSevenPromise = BookingModel.countDocuments({
    createdAt: { $gte: sevenDaysAge },
  });
  const bookingLastThirtyPromise = BookingModel.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // distinct method is use to find unique values by a specific fields
  const totalBookingByUniqueUsersPromise = BookingModel.distinct('user').then(
    (user: any) => user.length
  );

  const [
    totalBooking,
    totalBookingByStatus,
    bookingPerTour,
    avgGuestPerBooking,
    bookingLastSeven,
    bookingLastThirty,
    totalBookingByUniqueUsers,
  ] = await Promise.all([
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
};
const getPaymentStatsFromDB = async () => {
  const totalPaymentPromise = PaymentModel.countDocuments();
  const totalRevenuePromise = PaymentModel.aggregate([
    // stage 01: matching
    {
      $match: { status: PAYMENT_STATUS.PAID },
    },
    // stage 02: grouping
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
      },
    },
  ]);
  const totalPaymentByStatusPromise = PaymentModel.aggregate([
    // stage 01: grouping
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const avgPaymentAmountPromise = PaymentModel.aggregate([
    // stage 01: grouping
    {
      $group: {
        _id: null,
        avgPaymentAmount: { $avg: '$amount' },
      },
    },
  ]);
  const paymentGatewayDataPromise = PaymentModel.aggregate([
    // stage 01: grouping
    {
      $group: {
        _id: { $ifNull: ['$paymentGatewayData.status', 'UNKNOWN'] },
        count: { $sum: 1 },
      },
    },
  ]);

  const [totalPayment, totalRevenue, totalPaymentByStatus, avgPaymentAmount, paymentGatewayData] =
    await Promise.all([
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
};

const getGuideStatsFromDB = async (userId: string) => GuideService.getMyStatsFromDB(userId);

const getHomepageStatsFromDB = async () => {
  const totalToursPromise = TourModel.countDocuments();
  const totalGuidesPromise = GuideModel.countDocuments({ status: IGuideStatus.APPROVED });
  const totalDestinationsPromise = DivisionModel.countDocuments();
  const uniqueTravelersPromise = BookingModel.distinct('user').then((users) => users.length);
  const totalTravelerUsersPromise = UserModel.countDocuments({
    role: Role.USER,
    isDeleted: { $ne: true },
  });

  const [totalTours, totalGuides, totalDestinations, uniqueTravelers, totalTravelerUsers] =
    await Promise.all([
      totalToursPromise,
      totalGuidesPromise,
      totalDestinationsPromise,
      uniqueTravelersPromise,
      totalTravelerUsersPromise,
    ]);

  return {
    totalTours,
    totalGuides,
    totalDestinations,
    happyTravelers: Math.max(uniqueTravelers, totalTravelerUsers),
  };
};

export const StatsService = {
  getUserStatsFromDB,
  getTourStatsFromDB,
  getBookingStatsFromDB,
  getPaymentStatsFromDB,
  getGuideStatsFromDB,
  getHomepageStatsFromDB,
};
