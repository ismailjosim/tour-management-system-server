import { Schema, model } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

export const ReviewModel = model<IReview>('Review', reviewSchema);
