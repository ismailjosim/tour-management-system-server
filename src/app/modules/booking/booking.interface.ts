// Booking flow => user login -> booking (pending) -> payment(unpaid) -> SSLCommerz -> booking status update -> confirm -> payment update -> confirm

import { Types } from 'mongoose';

export enum BOOKING_STATUS {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCEL = 'CANCEL',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

export interface IBooking {
  user: Types.ObjectId;
  tour: Types.ObjectId;
  guide?: Types.ObjectId;
  payment?: Types.ObjectId;
  guestCount: number;
  status: BOOKING_STATUS;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateBookingStatusPayload {
  status: BOOKING_STATUS;
}
