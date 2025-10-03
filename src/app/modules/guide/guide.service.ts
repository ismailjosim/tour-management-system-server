import httpStatus from 'http-status-codes'

import { deleteImageFromCloudinary } from '../../configs/cloudinary.config'
import AppError from '../../errorHelpers/AppError'
import { UserModel } from '../user/user.model'
import { IGuide, IGuideStatus } from './guide.interface'
import { GuideModel } from './guide.model'
import mongoose, { Types } from 'mongoose'
import { JwtPayload } from 'jsonwebtoken'
import { Role } from '../user/user.interface'
import { QueryBuilder } from '../../utils/QueryBuilder'

// ========== USER / PUBLIC SERVICES ==========

// Apply to become a guide
const applyGuideIntoDB = async (payload: {
	user: Types.ObjectId
	division: Types.ObjectId
	nidPhoto: string
}): Promise<IGuide> => {
	// *1: check user exists
	const user = await UserModel.findById(payload.user)
	if (!user) {
		await deleteImageFromCloudinary(payload.nidPhoto)
		throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
	}

	// *2: check if user role is already GUIDE
	if (user.role === 'GUIDE') {
		await deleteImageFromCloudinary(payload.nidPhoto)
		throw new AppError(httpStatus.BAD_REQUEST, 'You are already a guide')
	}

	// *3: check if user already applied
	const isGuideExist = await GuideModel.findOne({ user: payload.user })
	if (isGuideExist) {
		await deleteImageFromCloudinary(payload.nidPhoto)
		throw new AppError(httpStatus.BAD_REQUEST, 'You already applied as a guide')
	}

	// *4: Create New guide application
	const newGuide = await GuideModel.create({
		...payload,
		status: IGuideStatus.PENDING,
	})
	return newGuide
}

// ========== ADMIN SERVICES ==========
// Approve or reject guide application
const approveOrRejectGuideInDB = async (
	guideId: string,
	status: IGuideStatus.APPROVED | IGuideStatus.REJECTED,
	decodedToken: JwtPayload,
) => {
	const session = await mongoose.startSession()
	session.startTransaction()

	try {
		// *1️⃣ : check user is admin/super_admin
		if (
			decodedToken.role !== Role.ADMIN &&
			decodedToken.role !== Role.SUPER_ADMIN
		) {
			throw new AppError(httpStatus.FORBIDDEN, 'Your are not authorized!')
		}
		// *2️⃣ : Find the  guide application
		const guide = await GuideModel.findById(guideId).session(session)
		if (!guide) {
			throw new AppError(httpStatus.NOT_FOUND, 'Guide application not found')
		}
		// *3️⃣ : find user
		const user = await UserModel.findById(guide.user).session(session)
		if (!user) {
			throw new AppError(httpStatus.NOT_FOUND, 'User not found')
		}
		// *4️⃣ : If approving, check if already a guide
		if (status === IGuideStatus.APPROVED && user.role === Role.GUIDE) {
			throw new AppError(httpStatus.BAD_REQUEST, 'User is already a guide')
		}

		// *5️⃣ : update user role in user collection
		if (status === 'APPROVED') {
			user.role = Role.GUIDE
			await user.save({ session })
		}

		// * 6️⃣ : change status based on status (APPROVED / REJECTED)
		guide.status =
			status === 'APPROVED' ? IGuideStatus.APPROVED : IGuideStatus.REJECTED
		await guide.save({ session })

		// ✅ commit transaction
		await session.commitTransaction()
		session.endSession()

		return guide
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}

// Get all guides
const getAllGuidesFromDB = async (query: Record<string, string>) => {
	const queryBuilder = new QueryBuilder(
		GuideModel.find()
			.populate(
				'user',
				'name email role phone address isVerified isActive -_id',
			)
			.populate('division', 'name thumbnail description -_id'),
		query,
	)

	const guides = queryBuilder.filter().sort().fields().paginate()
	const [data, meta] = await Promise.all([
		guides.build(),
		queryBuilder.getMeta(),
	])
	return {
		data,
		meta,
	}
}

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

// Get logged-in user's guide profile
const getMyProfileFromDB = async (userId: string): Promise<IGuide | null> => {
	return GuideModel.findOne({ user: userId }).populate('division')
}

// Update logged-in user's guide profile
const updateMyProfileInDB = async (
	userId: string,
	updateData: Partial<IGuide>,
): Promise<IGuide | null> => {
	return GuideModel.findOneAndUpdate({ user: userId }, updateData, {
		new: true,
	})
}

// Get tours assigned to current guide
// (Assuming you have a Tour model, here it's just a stub)
const getMyToursFromDB = async (userId: string) => {
	console.log(userId)
	// Example: return TourModel.find({ guide: userId });
	return []
}

// Get statistics for the current guide
const getMyStatsFromDB = async (userId: string) => {
	// Example: count tours & bookings (stub for now)
	console.log(userId)
	return {
		totalTours: 0,
		totalBookings: 0,
	}
}

// Get single guide details
const getSingleGuideFromDB = async (id: string): Promise<IGuide | null> => {
	return GuideModel.findById(id).populate('user division')
}

// Admin update guide
const updateGuideInDB = async (
	guideId: string,
	payload: Partial<IGuide>,
): Promise<IGuide | null> => {
	return GuideModel.findByIdAndUpdate(guideId, payload, {
		new: true,
	}).populate('user division')
}

// Delete guide
const deleteGuideFromDB = async (guideId: string): Promise<IGuide | null> => {
	return GuideModel.findByIdAndDelete(guideId)
}

// ========== EXPORT ==========
export const GuideService = {
	applyGuideIntoDB,
	getMyProfileFromDB,
	updateMyProfileInDB,
	getMyToursFromDB,
	getMyStatsFromDB,
	getAllGuidesFromDB,
	getSingleGuideFromDB,
	approveOrRejectGuideInDB,
	updateGuideInDB,
	deleteGuideFromDB,
}
