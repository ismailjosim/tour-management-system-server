import { Schema, model } from 'mongoose';
import { IGuide, IGuideStatus } from './guide.interface';

const guideSchema = new Schema<IGuide>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    nidPhoto: { type: String, required: true },
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
