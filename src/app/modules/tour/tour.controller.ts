/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TourServices } from './tour.service';
import { ITour } from './tour.interface';

// * All Tour controller
const crateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload: ITour = {
    ...req.body,
    images: (req.files as Express.Multer.File[])?.map((file) => file.path),
  };
  const result = await TourServices.createTourIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Tour Created successfully',
    data: result,
  });
});

const getAllTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const result = await TourServices.getAllTourFromDB(query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All Tour Retried successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.getSingleTourFromDB(req.params.slug as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tour Retried successfully',
    data: result,
  });
});

// controller code

const updateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Get paths of NEWLY uploaded files
  const newImagePaths = (req.files as Express.Multer.File[])?.map((file) => file.path) || [];

  // 2. Get EXISTING image URLs from the parsed body
  // (req.body.images comes from the 'images' array you just added to tourData)
  const existingImages = req.body.images || [];

  const payload: ITour = {
    ...req.body,
    // 3. Combine both arrays to form the complete images list
    images: [...existingImages, ...newImagePaths],
  };

  const result = await TourServices.updateTourIntoDB(req.params.id as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Tour successfully Updated`,
    data: result,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.deleteTourFromDB(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Tour Type ${result?.title} Deleted successfully`,
    data: null,
  });
});

// * Tour Type controller
const crateTourType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.createTourTypeIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Tour Type Created successfully',
    data: result,
  });
});

const getAllTourType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.getAllTourTypeFromDB(req.query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All Tour Type Retried successfully',
    data: result.data,
    meta: result.meta,
  });
});
const getSingleTourType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.getSingleTourTypeFromDB(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tour Type Retried successfully',
    data: result,
  });
});

const updateTourType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.updateTourTypeIntoDB(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Tour Type successfully Update to ${req.body.name}`,
    data: result,
  });
});

const deleteTourType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await TourServices.deleteTourTypeFromDB(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Tour Type ${result?.name} Deleted successfully`,
    data: result,
  });
});

export const TourControllers = {
  crateTour,
  getAllTour,
  getSingleTour,
  updateTour,
  deleteTour,
  crateTourType,
  getAllTourType,
  getSingleTourType,
  updateTourType,
  deleteTourType,
};
