/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from '../user/user.interface';

type BookingAuthPayload = JwtPayload & { userId: string; role: Role };

const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as BookingAuthPayload;
  const result = await BookingService.createBookingIntoDB(req.body, decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Booking Created successfully',
    data: result,
  });
});
const getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await BookingService.getAllBookingFromDB(req.query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Bookings Retrieved successfully',
    data: { ...result },
  });
});
const getUserBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as BookingAuthPayload;
  const query = req.query as Record<string, string>;
  const result = await BookingService.getUserBookingFromDB(decodedToken.userId, query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Bookings Retrieved successfully',
    data: result,
  });
});
const getSingleBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as BookingAuthPayload;
  const bookingId = req.params.bookingId as string;
  const result = await BookingService.getSingleBookingFromDB(bookingId, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking Retrieved successfully',
    data: result,
  });
});
const updateBookingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as BookingAuthPayload;
  const bookingId = req.params.bookingId as string;
  const result = await BookingService.updateBookingStatusIntoDB(bookingId, req.body, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking Status Updated successfully',
    data: result,
  });
});

// NEW: Get pending guide approvals
const getGuideApprovals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as BookingAuthPayload;
  const result = await BookingService.getGuideApprovalsFromDB(
    decodedToken.userId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Pending approvals retrieved',
    data: result,
  });
});

// NEW: Approve or reject booking
const approveOrRejectBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as BookingAuthPayload;
    const bookingId = req.params.bookingId as string;
    const result = await BookingService.approveOrRejectBookingIntoDB(
      bookingId,
      req.body,
      decodedToken
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: req.body.approved ? 'Booking approved successfully' : 'Booking rejected',
      data: result,
    });
  }
);

// NEW: Mark tour as complete
const markTourComplete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as BookingAuthPayload;
  const bookingId = req.params.bookingId as string;
  const result = await BookingService.markTourCompleteIntoDB(bookingId, req.body, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Tour marked as complete by ${req.body.completedBy}`,
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getSingleBooking,
  updateBookingStatus,
  getGuideApprovals,
  approveOrRejectBooking,
  markTourComplete,
};
