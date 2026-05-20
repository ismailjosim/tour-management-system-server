/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';

import { deleteImageFromCloudinary } from '../../configs/cloudinary.config';
import AppError from '../../errorHelpers/AppError';
import { UserModel } from '../user/user.model';
import { IGuide, IGuideStatus } from './guide.interface';
import { GuideModel } from './guide.model';
import mongoose, { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from '../user/user.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { BookingModel } from '../booking/booking.model';
import { BOOKING_STATUS } from '../booking/booking.interface';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { ReviewModel } from '../review/review.model';

const GUIDE_COMMISSION_RATE = 0.2;

const bookingDetailsPopulate = (query: any) =>
  query
    .populate('user', 'name email phone address picture role')
    .populate(
      'tour',
      'title slug images location costFrom startDate endDate departureLocation arrivalLocation tourPlan included excluded amenities'
    )
    .populate('payment', 'transactionId status amount invoiceUrl')
    .populate('guide', 'name email phone picture role');

const getPaymentAmount = (booking: any) => Number(booking.payment?.amount ?? 0);

const isPaidCompletedBooking = (booking: any) =>
  booking.status === BOOKING_STATUS.COMPLETE && booking.payment?.status === PAYMENT_STATUS.PAID;

const getCommissionAmount = (booking: any) =>
  isPaidCompletedBooking(booking)
    ? Math.round(getPaymentAmount(booking) * GUIDE_COMMISSION_RATE)
    : 0;

const getTourId = (booking: any) => {
  const tour = booking.tour;
  return tour?._id ? String(tour._id) : String(tour);
};

const getAssignedGuideBookings = (userId: string) =>
  bookingDetailsPopulate(BookingModel.find({ guide: userId })).sort('-createdAt');

// ========== USER / PUBLIC SERVICES ==========

// Apply to become a guide
const applyGuideIntoDB = async (payload: {
  user: Types.ObjectId;
  division: Types.ObjectId;
  nidPhoto: string;
}): Promise<IGuide> => {
  // *1: check user exists
  const user = await UserModel.findById(payload.user);
  if (!user) {
    await deleteImageFromCloudinary(payload.nidPhoto);
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // *2: check if user role is already GUIDE
  if (user.role === 'GUIDE') {
    await deleteImageFromCloudinary(payload.nidPhoto);
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already a guide');
  }

  // *3: check if user already applied
  const isGuideExist = await GuideModel.findOne({ user: payload.user });
  if (isGuideExist) {
    await deleteImageFromCloudinary(payload.nidPhoto);
    throw new AppError(httpStatus.BAD_REQUEST, 'You already applied as a guide');
  }

  // *4: Create New guide application
  const newGuide = await GuideModel.create({
    ...payload,
    status: IGuideStatus.PENDING,
  });
  return newGuide;
};

// ========== ADMIN SERVICES ==========
// Approve or reject guide application
const approveOrRejectGuideInDB = async (
  guideId: string,
  status: IGuideStatus.APPROVED | IGuideStatus.REJECTED,
  decodedToken: JwtPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // *1️⃣ : check user is admin/super_admin
    if (decodedToken.role !== Role.ADMIN && decodedToken.role !== Role.SUPER_ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, 'Your are not authorized!');
    }
    // *2️⃣ : Find the  guide application
    const guide = await GuideModel.findById(guideId).session(session);
    if (!guide) {
      throw new AppError(httpStatus.NOT_FOUND, 'Guide application not found');
    }
    // *3️⃣ : find user
    const user = await UserModel.findById(guide.user).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    // *4️⃣ : If approving, check if already a guide
    if (status === IGuideStatus.APPROVED && user.role === Role.GUIDE) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User is already a guide');
    }

    // *5️⃣ : update user role in user collection
    if (status === 'APPROVED') {
      user.role = Role.GUIDE;
      await user.save({ session });
    }

    // * 6️⃣ : change status based on status (APPROVED / REJECTED)
    guide.status = status === 'APPROVED' ? IGuideStatus.APPROVED : IGuideStatus.REJECTED;
    await guide.save({ session });

    // ✅ commit transaction
    await session.commitTransaction();
    session.endSession();

    return guide;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get all guides
const getAllGuidesFromDB = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    GuideModel.find({ status: { $in: ['PENDING', 'REJECTED'] } })
      .populate('user', 'name email picture role phone address isVerified isActive -_id')
      .populate('division', 'name thumbnail description -_id'),
    query
  );

  const guides = queryBuilder.filter().sort().fields().paginate();
  const [data, meta] = await Promise.all([guides.build(), queryBuilder.getMeta()]);
  return {
    data,
    meta,
  };
};

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

// Get logged-in user's guide profile
const getMyProfileFromDB = async (userId: string): Promise<IGuide | null> => {
  const result = await GuideModel.findOne({ user: userId })
    .populate('user', 'name email picture role phone address isVerified isActive -_id')
    .populate('division', 'name thumbnail description -_id');
  return result;
};

// Update logged-in user's guide profile
const updateMyProfileInDB = async (
  userId: string,
  updateData: Partial<IGuide>
): Promise<IGuide | null> => {
  return GuideModel.findOneAndUpdate({ user: userId }, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'name email picture role phone address isVerified isActive -_id')
    .populate('division', 'name thumbnail description -_id');
};

const updateMyAvailabilityInDB = async (
  userId: string,
  unavailableDates: Date[]
): Promise<IGuide | null> => {
  return GuideModel.findOneAndUpdate(
    { user: userId },
    { unavailableDates },
    { new: true, runValidators: true }
  )
    .populate('user', 'name email picture role phone address isVerified isActive -_id')
    .populate('division', 'name thumbnail description -_id');
};

const getMyToursFromDB = async (userId: string) => {
  const bookings = await getAssignedGuideBookings(userId).lean();
  const tours = new Map<string, any>();

  for (const booking of bookings) {
    if (!booking.tour) {
      continue;
    }

    const tourId = getTourId(booking);
    const existing = tours.get(tourId);
    const bookingSummary = {
      _id: booking._id,
      guestCount: booking.guestCount,
      status: booking.status,
      paymentStatus: booking.payment?.status,
      amount: booking.payment?.amount ?? 0,
      createdAt: booking.createdAt,
      user: booking.user,
    };

    if (existing) {
      existing.bookingCount += 1;
      existing.guestCount += Number(booking.guestCount ?? 0);
      existing.completedBookings += booking.status === BOOKING_STATUS.COMPLETE ? 1 : 0;
      existing.earnings += getCommissionAmount(booking);
      existing.bookings.push(bookingSummary);
      continue;
    }

    tours.set(tourId, {
      tour: booking.tour,
      bookingCount: 1,
      guestCount: Number(booking.guestCount ?? 0),
      completedBookings: booking.status === BOOKING_STATUS.COMPLETE ? 1 : 0,
      earnings: getCommissionAmount(booking),
      bookings: [bookingSummary],
    });
  }

  return Array.from(tours.values()).sort((a, b) => {
    const first = new Date(a.tour?.startDate ?? 0).getTime();
    const second = new Date(b.tour?.startDate ?? 0).getTime();
    return first - second;
  });
};

const getMyStatsFromDB = async (userId: string) => {
  const bookings = await getAssignedGuideBookings(userId).lean();
  const now = new Date();
  const assignedTourIds = Array.from(
    new Set(bookings.map(getTourId).filter((tourId: string) => tourId !== 'undefined'))
  );

  const reviews = assignedTourIds.length
    ? await ReviewModel.find({ tour: { $in: assignedTourIds } }).lean()
    : [];

  const upcomingBookings = bookings.filter((booking: any) => {
    const startDate = booking.tour?.startDate;
    return (
      startDate &&
      new Date(startDate) >= now &&
      booking.status !== BOOKING_STATUS.CANCEL &&
      booking.status !== BOOKING_STATUS.FAILED
    );
  });
  const completedBookings = bookings.filter(
    (booking: any) => booking.status === BOOKING_STATUS.COMPLETE
  );
  const totalEarnings = bookings.reduce(
    (total: number, booking: any) => total + getCommissionAmount(booking),
    0
  );
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating ?? 0), 0) / reviews.length
    : 0;

  return {
    assignedTours: assignedTourIds.length,
    assignedBookings: bookings.length,
    upcomingTours: upcomingBookings.length,
    completedTours: completedBookings.length,
    totalEarnings,
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews: reviews.length,
    commissionRate: GUIDE_COMMISSION_RATE,
  };
};

const getMyBookingsFromDB = async (userId: string, query: Record<string, string>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { guide: userId };

  if (query.status) {
    filter.status = query.status;
  }

  const [data, total] = await Promise.all([
    bookingDetailsPopulate(BookingModel.find(filter))
      .sort(query.sort || '-createdAt')
      .skip(skip)
      .limit(limit),
    BookingModel.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getMyBookingDetailsFromDB = async (userId: string, bookingId: string) => {
  const booking = await bookingDetailsPopulate(
    BookingModel.findOne({ _id: bookingId, guide: userId })
  );

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assigned booking not found');
  }

  return booking;
};

const getMyUpcomingScheduleFromDB = async (userId: string) => {
  const bookings = await getAssignedGuideBookings(userId).lean();
  const now = new Date();

  return bookings
    .filter((booking: any) => {
      const startDate = booking.tour?.startDate;
      return (
        startDate &&
        new Date(startDate) >= now &&
        booking.status !== BOOKING_STATUS.CANCEL &&
        booking.status !== BOOKING_STATUS.FAILED
      );
    })
    .sort(
      (first: any, second: any) =>
        new Date(first.tour?.startDate).getTime() - new Date(second.tour?.startDate).getTime()
    );
};

const getMyEarningsFromDB = async (userId: string) => {
  const bookings = await getAssignedGuideBookings(userId).lean();
  const earningBookings = bookings.filter(isPaidCompletedBooking);
  const monthlyEarnings = new Map<string, number>();

  for (const booking of earningBookings) {
    const date = new Date(booking.updatedAt ?? booking.createdAt ?? new Date());
    const month = date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    monthlyEarnings.set(month, (monthlyEarnings.get(month) ?? 0) + getCommissionAmount(booking));
  }

  return {
    totalEarnings: earningBookings.reduce(
      (total: number, booking: any) => total + getCommissionAmount(booking),
      0
    ),
    commissionRate: GUIDE_COMMISSION_RATE,
    paidBookings: earningBookings.map((booking: any) => ({
      _id: booking._id,
      tour: booking.tour,
      user: booking.user,
      guestCount: booking.guestCount,
      bookingStatus: booking.status,
      paymentStatus: booking.payment?.status,
      paymentAmount: getPaymentAmount(booking),
      commissionAmount: getCommissionAmount(booking),
      payoutStatus: 'READY',
      paidAt: booking.updatedAt ?? booking.createdAt,
    })),
    monthlyEarnings: Array.from(monthlyEarnings.entries()).map(([month, amount]) => ({
      month,
      amount,
    })),
  };
};

const getMyReviewsFromDB = async (userId: string) => {
  const bookings = await BookingModel.find({ guide: userId }).select('tour').lean();
  const assignedTourIds = Array.from(new Set(bookings.map((booking) => String(booking.tour))));

  if (!assignedTourIds.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [],
      reviews: [],
    };
  }

  const reviews = await ReviewModel.find({ tour: { $in: assignedTourIds } })
    .populate('user', 'name email picture')
    .populate('tour', 'title slug')
    .sort('-createdAt')
    .limit(20)
    .lean();

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating ?? 0), 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Number(review.rating) === rating).length,
  }));

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews: reviews.length,
    ratingDistribution,
    reviews,
  };
};

const getPublicGuidesFromDB = async (query: Record<string, string>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  const skip = (page - 1) * limit;
  const sort = query.sort || '-createdAt';
  const filter = { status: IGuideStatus.APPROVED };

  const [data, total] = await Promise.all([
    GuideModel.find(filter)
      .populate('user', 'name email picture phone address role -_id')
      .populate('division', 'name thumbnail description -_id')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    GuideModel.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// Get single guide details
const getSingleGuideFromDB = async (id: string): Promise<IGuide | null> => {
  return GuideModel.findById(id).populate('user division');
};

// Admin update guide
const updateGuideInDB = async (
  guideId: string,
  payload: Partial<IGuide>
): Promise<IGuide | null> => {
  return GuideModel.findByIdAndUpdate(guideId, payload, {
    new: true,
  }).populate('user division');
};

// Delete guide
const deleteGuideFromDB = async (guideId: string): Promise<IGuide | null> => {
  return GuideModel.findByIdAndDelete(guideId);
};

// ========== EXPORT ==========
export const GuideService = {
  applyGuideIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
  updateMyAvailabilityInDB,
  getMyToursFromDB,
  getMyStatsFromDB,
  getMyBookingsFromDB,
  getMyBookingDetailsFromDB,
  getMyUpcomingScheduleFromDB,
  getMyEarningsFromDB,
  getMyReviewsFromDB,
  getPublicGuidesFromDB,
  getAllGuidesFromDB,
  getSingleGuideFromDB,
  approveOrRejectGuideInDB,
  updateGuideInDB,
  deleteGuideFromDB,
};
