import { Schema, model } from 'mongoose';
import { BOOKING_STATUS, IBooking } from './booking.interface';

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
  },
  { timestamps: true, versionKey: false }
);

export const BookingModel = model<IBooking>('Booking', bookingSchema);
