import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { isValidObjectId, Query, Types } from 'mongoose';

import AppError from '../../errorHelpers/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { getTransactionId } from '../../utils/getTransactionId';

import { PaymentModel } from '../payment/payment.model';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { SSLService } from '../sslCommerz/sslCommerz.service';
import { ISSlCommerz } from '../sslCommerz/sslCommerz.interface';
import { TourModel } from '../tour/tour.model';
import { Role } from '../user/user.interface';
import { UserModel } from '../user/user.model';
import { DIVISION_ALIASES, getAllCountries, STATES } from '../../constants/location.constant';

import {
  BOOKING_STATUS,
  IBooking,
  IUpdateBookingStatusPayload,
  GUIDE_APPROVAL_STATUS,
  IApproveBookingPayload,
  ICompleteBookingPayload,
} from './booking.interface';
import { BookingModel } from './booking.model';

type BookingUserRef =
  | string
  | Types.ObjectId
  | {
      _id?: string | Types.ObjectId | null;
    }
  | null
  | undefined;

type AuthJwtPayload = JwtPayload & {
  userId: string;
  role: Role;
};

type PopulatedPaymentStatus = {
  status?: PAYMENT_STATUS;
} | null;

type PopulatedTourDates = {
  startDate?: Date | string;
  endDate?: Date | string;
} | null;

interface QueryMeta {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

const isAdminRole = (role?: string): boolean => role === Role.ADMIN || role === Role.SUPER_ADMIN;

const getBookingUserId = (bookingUser: BookingUserRef): string => {
  if (!bookingUser) return '';

  if (typeof bookingUser === 'string') return bookingUser;

  if (bookingUser instanceof Types.ObjectId) {
    return bookingUser.toString();
  }

  if (typeof bookingUser === 'object' && bookingUser._id) {
    if (typeof bookingUser._id === 'string') return bookingUser._id;
    if (bookingUser._id instanceof Types.ObjectId) return bookingUser._id.toString();
  }

  return '';
};

const normalizeLocationValue = (value?: string | null) => value?.trim().toLowerCase() || '';

const inferTourLocation = (tour: {
  location?: string | null;
  departureLocation?: string | null;
  arrivalLocation?: string | null;
}) => {
  const searchableLocation = [
    tour.location,
    tour.departureLocation,
    tour.arrivalLocation,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const country of getAllCountries()) {
    const states = STATES.filter((state) => state.country_id === country.id);
    const matchedDivision = states.find((division) =>
      searchableLocation.includes(normalizeLocationValue(division.name))
    );

    if (matchedDivision) {
      return { country: country.name, locationDivision: matchedDivision.name };
    }

    const matchedAlias = Object.entries(DIVISION_ALIASES).find(([alias]) =>
      searchableLocation.includes(alias)
    );

    if (matchedAlias) {
      return { country: country.name, locationDivision: matchedAlias[1] };
    }
  }

  return { country: '', locationDivision: '' };
};

const assertBookingAccess = (bookingUser: BookingUserRef, decodedUser: AuthJwtPayload): void => {
  const bookingUserId = getBookingUserId(bookingUser);

  if (!isAdminRole(decodedUser.role) && bookingUserId !== decodedUser.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  }
};

const assertAdminBookingStatusAccess = (decodedUser: AuthJwtPayload): void => {
  if (!isAdminRole(decodedUser.role)) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const populateBookingDetails = <T = any>(query: any): Query<T, unknown> => {
  return query
    .populate('user', 'name email phone address picture role')
    .populate(
      'tour',
      'title slug images location costFrom startDate endDate departureLocation arrivalLocation'
    )
    .populate('payment', 'transactionId status amount invoiceUrl')
    .populate('guide', 'name email phone picture role');
};

const getGuideFilterIds = async (guideUserId: string): Promise<string[]> => {
  const { GuideModel } = await import('../guide/guide.model');
  const guideProfile = await GuideModel.findOne({ user: guideUserId }).select('_id').lean();
  return [guideUserId, guideProfile?._id ? String(guideProfile._id) : ''].filter(Boolean);
};

const hasTourStarted = (startDate?: Date | string): boolean =>
  Boolean(startDate && new Date(startDate).getTime() <= Date.now());

const validateCreateBookingPayload = (payload: Partial<IBooking>): void => {
  if (!payload.tour || !isValidObjectId(payload.tour)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid tour id is required');
  }

  const guestCount = payload.guestCount ? Number(payload.guestCount) : NaN;
  if (!Number.isFinite(guestCount) || guestCount < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Guest count must be at least 1');
  }

  if (payload.guide && !isValidObjectId(payload.guide)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid guide id is required');
  }
};

const createBookingIntoDB = async (
  payload: Partial<IBooking>,
  userId: string
): Promise<{ paymentUrl: string; booking: IBooking | null }> => {
  validateCreateBookingPayload(payload);

  const session = await BookingModel.startSession();
  session.startTransaction();

  try {
    const transactionId = getTransactionId();

    const user = await UserModel.findById(userId).session(session);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // FIX: Prevent guides from booking tours
    if (user.role === Role.GUIDE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Guides cannot book tours. Guides can only be selected by users to lead tours.'
      );
    }

    if (!user.phone || !user.address) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please Update Your Profile to Book a Tour');
    }

    const tour = await TourModel.findById(payload.tour)
      .select('costFrom startDate endDate location departureLocation arrivalLocation')
      .session(session);

    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found');
    }

    const tourCost = Number(tour.costFrom);
    if (!Number.isFinite(tourCost) || tourCost <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'No Tour Cost Found');
    }

    if (!tour.startDate || !tour.endDate) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Tour start date and end date are required');
    }

    let assignedGuideUserId: Types.ObjectId | string | undefined;

    if (payload.guide) {
      const { GuideModel } = await import('../guide/guide.model');

      const guide = await GuideModel.findById(payload.guide).session(session);

      if (!guide) {
        throw new AppError(httpStatus.NOT_FOUND, 'Selected guide not found');
      }

      if (guide.status !== 'APPROVED') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Selected guide is not approved');
      }

      const tourLocation = inferTourLocation(tour);

      if (
        tourLocation.locationDivision &&
        (normalizeLocationValue(guide.country) !== normalizeLocationValue(tourLocation.country) ||
          normalizeLocationValue(guide.locationDivision) !==
            normalizeLocationValue(tourLocation.locationDivision))
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Selected guide is not available for this tour location'
        );
      }

      assignedGuideUserId = guide.user;

      /**
       * Booking.tour is usually an ObjectId reference.
       * So we cannot query `tour.startDate` directly inside BookingModel.
       * First find overlapping tours, then check active bookings for those tour ids.
       */
      const overlappingTours = await TourModel.find({
        _id: { $ne: payload.tour },
        startDate: { $lte: tour.endDate },
        endDate: { $gte: tour.startDate },
      })
        .select('_id')
        .session(session)
        .lean();

      const overlappingTourIds = overlappingTours.map((item) => item._id);

      if (overlappingTourIds.length > 0) {
        const hasConflict = await BookingModel.exists({
          guide: assignedGuideUserId,
          tour: { $in: overlappingTourIds },
          status: {
            $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETE],
          },
        }).session(session);

        if (hasConflict) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Selected guide is not available for this tour date'
          );
        }
      }
    }

    const guestCount = Number(payload.guestCount);
    const amount = tourCost * guestCount;

    const [createdBooking] = await BookingModel.create(
      [
        {
          ...payload,
          user: userId,
          guide: assignedGuideUserId,
          status: assignedGuideUserId
            ? BOOKING_STATUS.AWAITING_GUIDE_APPROVAL
            : BOOKING_STATUS.PENDING,
          guideApprovalStatus: assignedGuideUserId
            ? GUIDE_APPROVAL_STATUS.PENDING
            : GUIDE_APPROVAL_STATUS.APPROVED,
        },
      ],
      { session }
    );

    const [createdPayment] = await PaymentModel.create(
      [
        {
          booking: createdBooking._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId,
          amount,
        },
      ],
      { session }
    );

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      createdBooking._id,
      { payment: createdPayment._id },
      { new: true, runValidators: true, session }
    )
      .populate('user', 'name email phone address')
      .populate('tour', 'title costFrom')
      .populate('payment');

    if (!updatedBooking) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update booking payment');
    }

    const sslPayload: ISSlCommerz = {
      address: user.address,
      email: user.email,
      phoneNumber: user.phone,
      name: user.name,
      amount,
      transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();

    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllBookingFromDB = async (
  query: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ data: IBooking[]; meta: QueryMeta }> => {
  const queryBuilder = new QueryBuilder(
    BookingModel.find()
      .populate('user', 'name email -_id')
      .populate('tour', 'costFrom title images location startDate endDate -_id')
      .populate('payment'),
    query
  );

  const bookings = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([bookings.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta: meta as QueryMeta,
  };
};

const getUserBookingFromDB = async (
  userId: string,
  query: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ data: IBooking[]; meta: QueryMeta }> => {
  if (!isValidObjectId(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid user id is required');
  }

  const queryBuilder = new QueryBuilder(
    BookingModel.find({ user: userId })
      .populate('tour', 'title slug images location costFrom startDate endDate')
      .populate('guide', 'name email phone picture role')
      .populate('payment', 'transactionId status amount invoiceUrl'),
    query
  );

  const bookings = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([bookings.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta: meta as QueryMeta,
  };
};

const getSingleBookingFromDB = async (
  bookingId: string,
  decodedUser: AuthJwtPayload
): Promise<IBooking | null> => {
  if (!isValidObjectId(bookingId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid booking id is required');
  }

  const booking = await populateBookingDetails<IBooking>(BookingModel.findById(bookingId));

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  assertBookingAccess(booking.user, decodedUser);

  return booking;
};

const updateBookingStatusIntoDB = async (
  bookingId: string,
  payload: IUpdateBookingStatusPayload,
  decodedUser: AuthJwtPayload
): Promise<IBooking | null> => {
  assertAdminBookingStatusAccess(decodedUser);

  if (!isValidObjectId(bookingId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid booking id is required');
  }

  if (!payload.status) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking status is required');
  }

  const updatedBooking = await populateBookingDetails<IBooking>(
    BookingModel.findByIdAndUpdate(
      bookingId,
      { status: payload.status },
      { new: true, runValidators: true }
    )
  );

  if (!updatedBooking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  return updatedBooking;
};

// NEW: Get pending guide approvals
const getGuideApprovalsFromDB = async (
  guideId: string,
  query: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ data: IBooking[]; meta: QueryMeta }> => {
  if (!isValidObjectId(guideId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid guide id is required');
  }

  const guideIds = await getGuideFilterIds(guideId);

  const queryBuilder = new QueryBuilder(
    BookingModel.find({
      guide: { $in: guideIds },
      guideApprovalStatus: GUIDE_APPROVAL_STATUS.PENDING,
    })
      .populate('user', 'name email phone picture')
      .populate('tour', 'title slug images location startDate endDate costFrom')
      .populate('payment', 'status amount'),
    query
  );

  const bookings = queryBuilder.filter().sort().fields().paginate();
  const [data, meta] = await Promise.all([bookings.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta: meta as QueryMeta,
  };
};

// NEW: Approve or reject booking by guide
const approveOrRejectBookingIntoDB = async (
  bookingId: string,
  payload: IApproveBookingPayload,
  decodedUser: AuthJwtPayload
): Promise<IBooking | null> => {
  if (!isValidObjectId(bookingId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid booking id is required');
  }

  const booking = await BookingModel.findById(bookingId)
    .populate('payment', 'status')
    .populate('tour', 'startDate');

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  // Verify that the guide owns this booking
  const guideIds = await getGuideFilterIds(decodedUser.userId);

  if (!booking.guide || !guideIds.includes(booking.guide.toString())) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not assigned to this booking');
  }

  if (booking.guideApprovalStatus !== GUIDE_APPROVAL_STATUS.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Booking has already been ${booking.guideApprovalStatus?.toLowerCase()}`
    );
  }

  const updateData: Partial<IBooking> = {
    guideApprovalStatus: payload.approved
      ? GUIDE_APPROVAL_STATUS.APPROVED
      : GUIDE_APPROVAL_STATUS.REJECTED,
  };

  if (payload.approved) {
    const paymentStatus = (booking.payment as PopulatedPaymentStatus)?.status;
    const tourStartDate = (booking.tour as PopulatedTourDates)?.startDate;
    updateData.status =
      paymentStatus === PAYMENT_STATUS.PAID && hasTourStarted(tourStartDate)
        ? BOOKING_STATUS.IN_PROGRESS
        : BOOKING_STATUS.AWAITING_GUIDE_APPROVAL;
  } else {
    updateData.status = BOOKING_STATUS.REJECTED;
    updateData.rejectionReason = payload.rejectionReason || 'Guide rejected the booking';
  }

  const updatedBooking = await populateBookingDetails<IBooking>(
    BookingModel.findByIdAndUpdate(bookingId, updateData, { new: true, runValidators: true })
  );

  if (!updatedBooking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  return updatedBooking;
};

// NEW: Mark tour as complete by user or guide
const markTourCompleteIntoDB = async (
  bookingId: string,
  payload: ICompleteBookingPayload,
  decodedUser: AuthJwtPayload
): Promise<IBooking | null> => {
  if (!isValidObjectId(bookingId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid booking id is required');
  }

  const booking = await BookingModel.findById(bookingId)
    .populate('payment', 'status')
    .populate('tour', 'startDate endDate');

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  // Verify access: only user or assigned guide can mark complete
  if (payload.completedBy === 'user') {
    if (booking.user.toString() !== decodedUser.userId) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not the booking user');
    }
  } else if (payload.completedBy === 'guide') {
    const guideIds = await getGuideFilterIds(decodedUser.userId);
    if (!booking.guide || !guideIds.includes(booking.guide.toString())) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not assigned to this booking');
    }
  }

  const paymentStatus = (booking.payment as PopulatedPaymentStatus)?.status;
  if (paymentStatus !== PAYMENT_STATUS.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Tour can only be completed after payment');
  }

  if (booking.guide && booking.guideApprovalStatus !== GUIDE_APPROVAL_STATUS.APPROVED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Guide must approve this booking before completion');
  }

  const tour = booking.tour as PopulatedTourDates;
  if (!hasTourStarted(tour?.startDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Tour can only be completed after the start date');
  }

  if (
    booking.status === BOOKING_STATUS.REJECTED ||
    booking.status === BOOKING_STATUS.CANCEL ||
    booking.status === BOOKING_STATUS.FAILED
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This booking cannot be completed');
  }

  const updateData: Partial<IBooking> = {};

  if (payload.completedBy === 'user') {
    updateData.userCompleted = true;
  } else {
    updateData.guideCompleted = true;
  }

  // If both are complete, change status to COMPLETE
  const isUserCompleting = payload.completedBy === 'user';
  const guideAlreadyCompleted = booking.guideCompleted;
  const userAlreadyCompleted = booking.userCompleted;

  if ((isUserCompleting && guideAlreadyCompleted) || (!isUserCompleting && userAlreadyCompleted)) {
    updateData.status = BOOKING_STATUS.COMPLETE;
    updateData.completionDate = new Date();
  } else {
    updateData.status = BOOKING_STATUS.IN_PROGRESS;
  }

  const updatedBooking = await populateBookingDetails<IBooking>(
    BookingModel.findByIdAndUpdate(bookingId, updateData, { new: true, runValidators: true })
  );

  if (!updatedBooking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  return updatedBooking;
};

export const BookingService = {
  createBookingIntoDB,
  getAllBookingFromDB,
  getUserBookingFromDB,
  getSingleBookingFromDB,
  updateBookingStatusIntoDB,
  getGuideApprovalsFromDB,
  approveOrRejectBookingIntoDB,
  markTourCompleteIntoDB,
};
