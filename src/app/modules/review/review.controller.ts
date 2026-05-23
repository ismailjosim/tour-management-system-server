/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const result = await ReviewService.createReviewIntoDB(req.body, decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Review Post successfully',
    data: result,
  });
});

const getSpecificTourReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ReviewService.getSpecificTourReviewsFromDB(
      req.params.tourId as string,
      req.query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Review Retrieved successfully',
      data: result,
    });
  }
);

const getAllReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await ReviewService.getAllReviewsFromDB(req.query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reviews Retrieved successfully',
    data: result,
  });
});

const addGuideRating = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const result = await ReviewService.addGuideRatingIntoDB(
    req.params.reviewId as string,
    req.body,
    decodedToken.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Guide rating added successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  addGuideRating,
  getAllReviews,
  getSpecificTourReviews,
};
