/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { GuideService } from './guide.service';
import { IGuide, IGuideStatus } from './guide.interface';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import AppError from '../../errorHelpers/AppError';

/**
 * ========================
 * USER / PUBLIC CONTROLLERS
 * ========================
 */

// Apply as a guide
const applyGuide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const payload: IGuide = {
    ...req.body,
    user: new Types.ObjectId(decodedToken.userId),
    nidPhoto: req.file?.path,
  };
  const result = await GuideService.applyGuideIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Guide applied successfully',
    data: result,
  });
});

// Get current logged-in guide profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyProfileFromDB(decodedToken.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide profile retrieved successfully',
    data: result,
  });
});

// Update my profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.updateMyProfileInDB(decodedToken.userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide profile updated successfully',
    data: result,
  });
});

const updateMyAvailability = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const unavailableDates = (req.body.unavailableDates || []).map((date: string) => new Date(date));
  const result = await GuideService.updateMyAvailabilityInDB(decodedToken.userId, unavailableDates);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide availability updated successfully',
    data: result,
  });
});

const getMyTours = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyToursFromDB(decodedToken.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide tours retrieved successfully',
    data: result,
  });
});

// Get my stats
const getMyStats = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyStatsFromDB(decodedToken.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide stats retrieved successfully',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyBookingsFromDB(
    decodedToken.userId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide bookings retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getMyBookingDetails = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyBookingDetailsFromDB(
    decodedToken.userId,
    req.params.bookingId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide booking retrieved successfully',
    data: result,
  });
});

const getMyUpcomingSchedule = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyUpcomingScheduleFromDB(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide schedule retrieved successfully',
    data: result,
  });
});

const getMyEarnings = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyEarningsFromDB(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide earnings retrieved successfully',
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await GuideService.getMyReviewsFromDB(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide reviews retrieved successfully',
    data: result,
  });
});

const getPublicGuides = catchAsync(async (req: Request, res: Response) => {
  const result = await GuideService.getPublicGuidesFromDB(req.query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guides retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * ========================
 * ADMIN CONTROLLERS
 * ========================
 */
// Approve or reject guide
const approveOrRejectGuide = catchAsync(async (req: Request, res: Response) => {
  const { guideId } = req.params;
  const { status } = req.query;
  const decodedToken = req.user as JwtPayload;

  // validate status
  if (status !== IGuideStatus.APPROVED && status !== IGuideStatus.REJECTED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status value');
  }

  const result = await GuideService.approveOrRejectGuideInDB(
    guideId,
    status as IGuideStatus.APPROVED | IGuideStatus.REJECTED,
    decodedToken
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:
      status === 'APPROVED' ? 'Guide approved successfully' : 'Guide application got rejected',
    data: result,
  });
});

// Get all guides (with optional filters: status, user, division)
const getAllGuides = catchAsync(async (req: Request, res: Response) => {
  const result = await GuideService.getAllGuidesFromDB(req.query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All Guides retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get single guide details
const getSingleGuide = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GuideService.getSingleGuideFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide retrieved successfully',
    data: result,
  });
});

// Update guide (admin)
const updateGuide = catchAsync(async (req: Request, res: Response) => {
  const { guideId } = req.params;
  const result = await GuideService.updateGuideInDB(guideId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide updated successfully',
    data: result,
  });
});

// Delete guide
const deleteGuide = catchAsync(async (req: Request, res: Response) => {
  const { guideId } = req.params;
  const result = await GuideService.deleteGuideFromDB(guideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide deleted successfully',
    data: result,
  });
});

/**
 * ========================
 * EXPORT
 * ========================
 */
export const GuideController = {
  applyGuide,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  getMyTours,
  getMyStats,
  getMyBookings,
  getMyBookingDetails,
  getMyUpcomingSchedule,
  getMyEarnings,
  getMyReviews,
  getPublicGuides,
  getAllGuides,
  getSingleGuide,
  approveOrRejectGuide,
  updateGuide,
  deleteGuide,
};
