import { Schema, model } from 'mongoose';
import { BOOKING_STATUS, IBooking, GUIDE_APPROVAL_STATUS } from './booking.interface';

const bookingSchema = new Schema<IBooking>(
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
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    guestCount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    // NEW: Guide approval tracking
    guideApprovalStatus: {
      type: String,
      enum: Object.values(GUIDE_APPROVAL_STATUS),
      default: GUIDE_APPROVAL_STATUS.PENDING,
    },
    // NEW: Tour completion tracking
    userCompleted: {
      type: Boolean,
      default: false,
    },
    guideCompleted: {
      type: Boolean,
      default: false,
    },
    completionDate: {
      type: Date,
    },
    // NEW: Rejection reason if guide rejects
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for queries
bookingSchema.index({ guide: 1, guideApprovalStatus: 1 });
bookingSchema.index({ tour: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

export const BookingModel = model<IBooking>('Booking', bookingSchema);
