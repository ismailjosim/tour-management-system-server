/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from '../interfaces/error.types'

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
	const duplicateVal = err.message.match(/"([^"]*)"/)
	return {
		statusCode: 400,
		message: `${duplicateVal ? duplicateVal[1] : 'Value'} already exists`,
	}
}
