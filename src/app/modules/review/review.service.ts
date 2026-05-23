/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { UserModel } from '../user/user.model';
import { IReview } from './review.interface';
import { BookingModel } from '../booking/booking.model';
import { BOOKING_STATUS } from '../booking/booking.interface';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { ReviewModel } from './review.model';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { GuideModel } from '../guide/guide.model';
import { Types, isValidObjectId } from 'mongoose';

const createReviewIntoDB = async (payload: IReview, userId: string) => {
  // 1️⃣ check user is exist

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Not Found!');
  }

  payload.user = user._id;

  const requestedBookingId = (payload as any).bookingId || payload.booking;
  const bookingQuery: Record<string, unknown> = {
    user: userId,
    status: BOOKING_STATUS.COMPLETE,
  };

  if (requestedBookingId) {
    if (!isValidObjectId(requestedBookingId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Valid booking id is required');
    }
    bookingQuery._id = requestedBookingId;
  } else {
    bookingQuery.tour = payload.tour;
  }

  //2️⃣ check booking and payment status
  const booking = await BookingModel.findOne(bookingQuery).populate('payment', 'status').exec();

  if (!booking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Review is allowed only after completing this booking'
    );
  }

  if (!booking.userCompleted || !booking.guideCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Both user and guide must complete the tour first');
  }

  payload.booking = booking._id as Types.ObjectId;
  payload.tour = booking.tour;
  //3️⃣ check payment status is successful
  const paymentStatus = (booking.payment as any)?.status;
  if (paymentStatus !== PAYMENT_STATUS.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review allowed only after successful payment');
  }

  const bookedGuideProfile = booking.guide
    ? await GuideModel.findOne({
        $or: [{ user: booking.guide }, { _id: booking.guide }],
      })
        .select('user')
        .lean()
    : null;
  const assignedGuideIds = [
    booking.guide ? String(booking.guide) : '',
    bookedGuideProfile?._id ? String(bookedGuideProfile._id) : '',
    bookedGuideProfile?.user ? String(bookedGuideProfile.user) : '',
  ].filter(Boolean);
  const requestedGuideId = payload.guide ? String(payload.guide) : '';

  if (requestedGuideId && !assignedGuideIds.includes(requestedGuideId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You can only review your assigned guide');
  }

  if (booking.guide) {
    payload.guide = bookedGuideProfile?.user ?? booking.guide;
  } else {
    delete payload.guide;
  }

  delete payload.guideRating;
  delete payload.guideComments;

  // 4️⃣ Check if review already exists for this booking
  const existingReview = await ReviewModel.findOne({ booking: booking._id });
  if (existingReview) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already submitted a review for this booking');
  }

  // 5️⃣ Create Review
  const review = await ReviewModel.create(payload);
  return review;
};

const addGuideRatingIntoDB = async (
  reviewId: string,
  payload: { guideRating: number; guideComments: string },
  guideUserId: string
) => {
  if (!isValidObjectId(reviewId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid review id is required');
  }

  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (!review.booking) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This review is not linked to a booking');
  }

  const guideProfile = await GuideModel.findOne({ user: guideUserId }).select('_id user').lean();
  const guideIds = [guideUserId, guideProfile?._id ? String(guideProfile._id) : ''].filter(Boolean);

  const booking = await BookingModel.findOne({
    _id: review.booking,
    guide: { $in: guideIds },
    status: BOOKING_STATUS.COMPLETE,
  });

  if (!booking) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not the guide for this completed booking');
  }

  if (review.guideRating || review.guideComments) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already rated this traveler');
  }

  return ReviewModel.findByIdAndUpdate(
    reviewId,
    {
      guideRating: payload.guideRating,
      guideComments: payload.guideComments,
    },
    { new: true, runValidators: true }
  )
    .populate('user', 'name picture')
    .populate('guide', 'name picture')
    .populate('tour', 'title slug location');
};

const getSpecificTourReviewsFromDB = async (tourId: string, query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    ReviewModel.find({ tour: tourId })
      .populate('user', 'name picture -_id')
      .populate('guide', 'name picture -_id'),
    query
  );

  const reviews = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([reviews.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta,
  };
};

const getAllReviewsFromDB = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    ReviewModel.find()
      .populate('user', 'name picture -_id')
      .populate('guide', 'name picture -_id')
      .populate('tour', 'title slug location -_id'),
    query
  );

  const reviews = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([reviews.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta,
  };
};

export const ReviewService = {
  createReviewIntoDB,
  addGuideRatingIntoDB,
  getAllReviewsFromDB,
  getSpecificTourReviewsFromDB,
};
