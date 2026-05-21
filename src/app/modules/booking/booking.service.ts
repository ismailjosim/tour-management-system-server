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

import { BOOKING_STATUS, IBooking, IUpdateBookingStatusPayload } from './booking.interface';
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

    if (!user.phone || !user.address) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please Update Your Profile to Book a Tour');
    }

    const tour = await TourModel.findById(payload.tour)
      .select('costFrom startDate endDate division')
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

      if (tour.division && guide.division.toString() !== tour.division.toString()) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Selected guide is not available for this tour division'
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
          status: BOOKING_STATUS.PENDING,
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

export const BookingService = {
  createBookingIntoDB,
  getAllBookingFromDB,
  getUserBookingFromDB,
  getSingleBookingFromDB,
  updateBookingStatusIntoDB,
};
