/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGuide, IGuideStatus } from './guide.interface'
import { GuideModel } from './guide.model'
import { Types } from 'mongoose'

// ========== USER / PUBLIC SERVICES ==========

// Apply to become a guide
const applyGuideIntoDB = async (payload: {
	user: Types.ObjectId
	division: Types.ObjectId
	nidPhoto: string
}): Promise<IGuide> => {
	const newGuide = await GuideModel.create({
		...payload,
		status: IGuideStatus.PENDING,
	})
	return newGuide
}

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
	// Example: return TourModel.find({ guide: userId });
	return []
}

// Get statistics for the current guide
const getMyStatsFromDB = async (userId: string) => {
	// Example: count tours & bookings (stub for now)
	return {
		totalTours: 0,
		totalBookings: 0,
	}
}

// ========== ADMIN SERVICES ==========

// Get all guides (with query filters like status, user, division)
const getAllGuidesFromDB = async (filters: {
	status?: IGuideStatus
	user?: string
	division?: string
}): Promise<IGuide[]> => {
	const query: Record<string, any> = {}
	if (filters.status) query.status = filters.status
	if (filters.user) query.user = filters.user
	if (filters.division) query.division = filters.division

	return GuideModel.find(query).populate('user division')
}

// Get single guide details
const getSingleGuideFromDB = async (id: string): Promise<IGuide | null> => {
	return GuideModel.findById(id).populate('user division')
}

// Approve or reject guide application
const approveOrRejectGuideInDB = async (
	guideId: string,
	status: IGuideStatus,
): Promise<IGuide | null> => {
	return GuideModel.findByIdAndUpdate(
		guideId,
		{ status },
		{ new: true },
	).populate('user division')
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
