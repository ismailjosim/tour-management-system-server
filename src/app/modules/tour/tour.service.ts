import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { ITour, ITourType } from './tour.interface'
import { TourModel, TourTypeModel } from './tour.model'

const createTourIntoDB = async (payload: ITour) => {
	const isTourExist = await TourModel.findOne({ title: payload.title })
	if (isTourExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Tour is already exist')
	}
	const tour = await TourModel.create(payload)
	return tour
}

const getAllTourFromDB = async () => {
	const tours = await TourModel.find()
	const totalTours = await TourModel.countDocuments()
	return {
		data: tours,
		meta: {
			total: totalTours,
		},
	}
}

const updateTourIntoDB = async (id: string, payload: ITourType) => {
	const isTourTypeExist = await TourModel.findById(id)
	if (!isTourTypeExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Tour Type is not exist')
	}

	const existingTourTypeWithName = await TourModel.findOne({
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

const deleteTourFromDB = async (id: string) => {
	const isTourTypeExist = await TourTypeModel.findById(id)
	if (!isTourTypeExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Tour Type is not exist')
	}

	const tour = await TourTypeModel.findByIdAndDelete(id)

	return tour
}

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
	createTourIntoDB,
	getAllTourFromDB,
	updateTourIntoDB,
	deleteTourFromDB,
	createTourTypeIntoDB,
	getAllTourTypeFromDB,
	updateTourTypeIntoDB,
	deleteTourTypeFromDB,
}
