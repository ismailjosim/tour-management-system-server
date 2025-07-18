import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { ITourType } from './tour.interface'
import { TourTypeModel } from './tour.model'

const createTourTypeIntoDB = async (payload: ITourType) => {
	const { name } = payload
	const isTourTypeExist = await TourTypeModel.findOne({ name })

	if (isTourTypeExist) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'This Tour Type is already exist',
		)
	}
	const tourType = await TourTypeModel.create({ name })

	return tourType
}
const getAllTourTypeFromDB = async () => {
	const tours = await TourTypeModel.find()
	const totalTourTypes = await TourTypeModel.countDocuments()
	return {
		data: tours,
		meta: {
			total: totalTourTypes,
		},
	}
}
const updateTourTypeIntoDB = async (id: string, payload: ITourType) => {
	const isTourTypeExist = await TourTypeModel.findById(id)
	if (!isTourTypeExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Tour Type is not exist')
	}
	if (payload.name) {
		if (isTourTypeExist.name === payload.name) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				'Tour Type is similar to the stored Value',
			)
		}
	}
	// OPTIONAL: prevent updating to a name that already exists for *another* tour type
	// This is a more common scenario for unique names
	const existingTourTypeWithName = await TourTypeModel.findOne({
		name: payload.name,
	})
	if (
		existingTourTypeWithName &&
		existingTourTypeWithName._id.toString() !== id
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'Another Tour Type with this name already exists. Please choose a different name.',
		)
	}

	// 3. Perform the update
	const tour = await TourTypeModel.findByIdAndUpdate(id, payload, {
		new: true,
		runValidators: true,
	})

	return tour
}
const deleteTourTypeFromDB = async (id: string) => {
	const isTourTypeExist = await TourTypeModel.findById(id)
	if (!isTourTypeExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Tour Type is not exist')
	}

	const tour = await TourTypeModel.findByIdAndDelete(id)

	return tour
}

export const TourServices = {
	createTourTypeIntoDB,
	getAllTourTypeFromDB,
	updateTourTypeIntoDB,
	deleteTourTypeFromDB,
}
