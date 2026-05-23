import { Types } from 'mongoose';

export interface IReview {
  user: Types.ObjectId;
  booking?: Types.ObjectId;
  tour: Types.ObjectId;
  guide?: Types.ObjectId;
  rating: number;
  comments: string;
  guideRating?: number;
  guideComments?: string;
  createdAt?: Date;
}
