/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { DivisionServices } from './division.service'
import sendResponse from '../../utils/sendResponse'

const createDivision = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await DivisionServices.createDivisionIntoDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Division Created successfully',
			data: result,
		})
	},
)
const getAllDivisions = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await DivisionServices.getAllDivisionFromDB(
			req.query as Record<string, string>,
		)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'All Division Retried successfully',
			data: result.data,
			meta: result.meta,
		})
	},
)
const getSingleDivision = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await DivisionServices.getSingleDivisionFromDB(
			req.params.slug,
		)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: result.data
				? 'Division Retried successfully'
				: 'No Division Found',
			data: result.data,
		})
	},
)

const updateDivision = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await DivisionServices.updateDivisionIntoDB(
			req.params.id,
			req.body,
		)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: `Tour Type successfully Update to ${req.body.name}`,
			data: result,
		})
	},
)

const deleteDivision = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await DivisionServices.deleteDivisionFromDB(req.params.id)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'Division Deleted successfully',
			data: result,
		})
	},
)

export const DivisionControllers = {
	createDivision,
	getAllDivisions,
	getSingleDivision,
	updateDivision,
	deleteDivision,
}
