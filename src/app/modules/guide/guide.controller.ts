/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { GuideService } from './guide.service'
import { IGuide, IGuideStatus } from './guide.interface'

/**
 * ========================
 * USER / PUBLIC CONTROLLERS
 * ========================
 */

// Apply as a guide
const applyGuide = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload: IGuide = {
			...req.body,
		}
		const result = await GuideService.applyGuideIntoDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Guide applied successfully',
			data: result,
		})
	},
)

// Get current logged-in guide profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id
	const result = await GuideService.getMyProfileFromDB(userId)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide profile retrieved successfully',
		data: result,
	})
})

// Update my profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id || req.body.user
	const result = await GuideService.updateMyProfileInDB(userId, req.body)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide profile updated successfully',
		data: result,
	})
})

// Get my assigned tours

const getMyTours = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id || req.body.user
	const result = await GuideService.getMyToursFromDB(userId)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide tours retrieved successfully',
		data: result,
	})
})

// Get my stats
const getMyStats = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id || req.body.user
	const result = await GuideService.getMyStatsFromDB(userId)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide stats retrieved successfully',
		data: result,
	})
})

/**
 * ========================
 * ADMIN CONTROLLERS
 * ========================
 */

// Get all guides (with optional filters: status, user, division)
const getAllGuides = catchAsync(async (req: Request, res: Response) => {
	const filters = {
		status: req.query.status as IGuideStatus,
		user: req.query.user as string,
		division: req.query.division as string,
	}
	const result = await GuideService.getAllGuidesFromDB(filters)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guides retrieved successfully',
		data: result,
	})
})

// Get single guide details
const getSingleGuide = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params
	const result = await GuideService.getSingleGuideFromDB(id)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide retrieved successfully',
		data: result,
	})
})

// Approve or reject guide
const approveOrRejectGuide = catchAsync(async (req: Request, res: Response) => {
	const { guideId } = req.params
	const { status } = req.body as { status: IGuideStatus }
	const result = await GuideService.approveOrRejectGuideInDB(guideId, status)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: `Guide ${status.toLowerCase()} successfully`,
		data: result,
	})
})

// Update guide (admin)
const updateGuide = catchAsync(async (req: Request, res: Response) => {
	const { guideId } = req.params
	const result = await GuideService.updateGuideInDB(guideId, req.body)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide updated successfully',
		data: result,
	})
})

// Delete guide
const deleteGuide = catchAsync(async (req: Request, res: Response) => {
	const { guideId } = req.params
	const result = await GuideService.deleteGuideFromDB(guideId)
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: 'Guide deleted successfully',
		data: result,
	})
})

/**
 * ========================
 * EXPORT
 * ========================
 */
export const GuideController = {
	applyGuide,
	getMyProfile,
	updateMyProfile,
	getMyTours,
	getMyStats,
	getAllGuides,
	getSingleGuide,
	approveOrRejectGuide,
	updateGuide,
	deleteGuide,
}
