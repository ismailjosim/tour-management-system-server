/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from '../interfaces/error.types'

export const handleMongooseValidationError = (
	err: any,
): TGenericErrorResponse => {
	const errorSources: TErrorSources[] = []
	const errors = Object.values(err.errors)
	errors.forEach((item: any) =>
		errorSources.push({
			path: item.path,
			message: item.message,
		}),
	)
	return {
		statusCode: 400,
		message: 'Validation Error Occurred ❌',
		errorSources,
	}
}
