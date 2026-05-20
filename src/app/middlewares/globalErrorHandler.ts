/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { environmentVariables } from '../configs/env';
import AppError from '../errorHelpers/AppError';
import { ZodError } from 'zod';
import { TErrorSources } from '../interfaces/error.types';
import { handleDuplicateError } from '../helpers/handleDuplicateError';
import { handleCastError } from '../helpers/handleCastError';
import { handleMongooseValidationError } from '../helpers/handleZodValidationError';
import { handleZodValidationError } from '../helpers/handleMongooseValidationError';
import { deleteImageFromCloudinary } from '../configs/cloudinary.config';

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (environmentVariables.NODE_ENV === 'development') {
    console.log(err);
  }

  // ✅ Delete Single File if present
  if (req.file?.path) {
    try {
      await deleteImageFromCloudinary(req.file.path);
    } catch (error) {
      console.error('❌ Failed to delete single image:', error);
    }
  }

  // ✅ Delete Multiple Files if present
  if (req.files && Array.isArray(req.files)) {
    const imgUrls = (req.files as Express.Multer.File[]).map((file) => file.path);

    await Promise.all(
      imgUrls.map((url) =>
        deleteImageFromCloudinary(url).catch((error) => {
          console.error(`❌ Failed to delete image: ${url}`, error);
        })
      )
    );
  }

  let errorSources: TErrorSources[] = [
    // {
    // 	path: 'isDeleted',
    // 	message: 'Cast Failed',
    // },
  ];
  let statusCode = 500;
  let message = 'Something Went Wrong!!';

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  else if (err instanceof mongoose.Error.CastError) {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }

  // Mongoose ValidationError
  else if (err instanceof mongoose.Error.ValidationError) {
    const simplifiedError = handleMongooseValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources || [];
  }

  // Zod Validation Error
  else if (err instanceof ZodError) {
    const simplifiedError = handleZodValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources || [];
  }

  // Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // General JS Error
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: environmentVariables.NODE_ENV === 'development' ? err : undefined,
    stack: environmentVariables.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
