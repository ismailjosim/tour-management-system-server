import { Schema, model } from 'mongoose';
import { IGuide, IGuideStatus } from './guide.interface';

const guideSchema = new Schema<IGuide>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: String, trim: true },
    locationDivision: { type: String, trim: true },
    division: { type: Schema.Types.ObjectId, ref: 'Division' },
    nidPhoto: { type: String, required: true },
    nidFrontPhoto: { type: String },
    nidBackPhoto: { type: String },
    photo: { type: String },
    bio: { type: String },
    languages: { type: [String], default: [] },
    experience: { type: Number, default: 0 },
    phone: { type: String },
    address: { type: String },
    specialties: { type: [String], default: [] },
    unavailableDates: { type: [Date], default: [] },
    status: {
      type: String,
      enum: Object.values(IGuideStatus),
      default: IGuideStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export const GuideModel = model<IGuide>('Guide', guideSchema);
