import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { ITourType } from './tour.interface'
import { TourTypeModel } from './tour.model'

const createTourTypeIntoDB = async (payload: Partial<ITourType>) => {
	const { name } = payload
	const isTourTypeExist = await TourTypeModel.findOne({ name })

	if (isTourTypeExist) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'This Tour Type is already exist',
		)
	}
	const tourType = await TourTypeModel.create(payload)

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

export const TourServices = {
	createTourTypeIntoDB,
	getAllTourTypeFromDB,
}
