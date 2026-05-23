// Booking flow => user login -> booking (pending) -> payment(unpaid) -> SSLCommerz -> booking status update -> confirm -> payment update -> confirm
// Guide flow => user selects guide -> AWAITING_GUIDE_APPROVAL -> guide approves/rejects -> if approved -> IN_PROGRESS -> user & guide complete -> COMPLETE -> ratings

import { Types } from 'mongoose';

export enum BOOKING_STATUS {
  PENDING = 'PENDING',
  AWAITING_GUIDE_APPROVAL = 'AWAITING_GUIDE_APPROVAL',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

export enum GUIDE_APPROVAL_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IBooking {
  user: Types.ObjectId;
  tour: Types.ObjectId;
  guide?: Types.ObjectId;
  payment?: Types.ObjectId;
  guestCount: number;
  status: BOOKING_STATUS;
  guideApprovalStatus?: GUIDE_APPROVAL_STATUS;
  userCompleted?: boolean;
  guideCompleted?: boolean;
  completionDate?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateBookingStatusPayload {
  status: BOOKING_STATUS;
}

export interface IApproveBookingPayload {
  approved: boolean;
  rejectionReason?: string;
}

export interface ICompleteBookingPayload {
  completedBy: 'user' | 'guide';
}
