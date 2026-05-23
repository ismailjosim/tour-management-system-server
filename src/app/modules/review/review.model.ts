import { Schema, model } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
    },
    guideRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    guideComments: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ booking: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, tour: 1 });

export const ReviewModel = model<IReview>('Review', reviewSchema);
