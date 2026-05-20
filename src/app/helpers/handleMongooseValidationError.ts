/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from 'zod';
import { TErrorSources, TGenericErrorResponse } from '../interfaces/error.types';

export const handleZodValidationError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];
  const errors = Object.values(err.errors);
  errors.forEach((item: any) =>
    errorSources.push({
      path: `${item.path.slice().reverse().join(' inside ')} is required ❌`,
      message: item.message,
    })
  );
  return {
    statusCode: 400,
    message: 'Zod Error Occurred ❌',
    errorSources,
  };
};
