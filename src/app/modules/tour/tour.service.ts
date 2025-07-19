import { QueryBuilder } from './../../utils/QueryBuilder'
import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { ITour, ITourType } from './tour.interface'
import { TourModel, TourTypeModel } from './tour.model'
import { tourSearchableFields } from './tour.constant'
import { excludeField } from '../../constants'

const createTourIntoDB = async (payload: ITour) => {
	const isTourExist = await TourModel.findOne({ title: payload.title })
	if (isTourExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Tour is already exist')
	}
	const tour = await TourModel.create(payload)
	return tour
}
/*
const getAllTourFromDB = async (query: Record<string, string>) => {
	//* Filter functionalities
	const filter = query
	const searchTerm = query.searchTerm || ''
	const sort = query.sort || '-createdAt'
	const fields = query?.fields?.split(',').join(' ') || '' // title, location => title location
	const page = Number(query.page) || 1
	const limit = Number(query.limit) || 10
	const skip = (page - 1) * limit

	//* dynamically exclude filed from filter object
	for (const field of excludeField) {
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete filter[field]
	}

	//* search functionalities
	const searchQuery = {
		$or: tourSearchableFields.map((field) => ({
			[field]: { $regex: searchTerm, $options: 'i' },
		})),
	}

	//* sort functionalities
	//* field limit functionalities:
	//* skip and pagination: page=3&limit=10

	const tours = await TourModel.find(searchQuery)
		.find(filter)
		.sort(sort)
		.select(fields)
		.skip(skip)
		.limit(limit)

	const totalTours = await TourModel.find(searchQuery)
		.find(filter)
		.countDocuments()

	const totalPage = Math.ceil(totalTours / limit)

	const meta = {
		page,
		limit,
		total: totalTours,
		totalPage: totalPage,
	}

	return {
		data: tours,
		meta,
	}
}*/

const getAllTourFromDB = async (query: Record<string, string>) => {
	//* Filter functionalities
	const filter = query
	const sort = query.sort || '-createdAt'
	const fields = query?.fields?.split(',').join(' ') || '' // title, location => title location
	const page = Number(query.page) || 1
	const limit = Number(query.limit) || 10
	const skip = (page - 1) * limit

	//* dynamically exclude filed from filter object
	for (const field of excludeField) {
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete filter[field]
	}

	//* sort functionalities
	//* field limit functionalities:
	//* skip and pagination: page=3&limit=10

	// const tours = await TourModel.find(searchQuery)
	// 	.find(filter)
	// 	.sort(sort)
	// 	.select(fields)
	// 	.skip(skip)
	// 	.limit(limit)

	// const totalTours = await TourModel.find(searchQuery)
	// 	.find(filter)
	// 	.countDocuments()

	const queryBuilder = new QueryBuilder(TourModel.find(), query)
	const tours = await queryBuilder.search(tourSearchableFields).filter()
		.modelQuery

	// const meta = {
	// 	page,
	// 	limit,
	// 	total: totalTours,
	// 	totalPage: totalPage,
	// }

	return {
		data: tours,
	}
}

const updateTourIntoDB = async (id: string, payload: ITour) => {
	const isTourTypeExist = await TourModel.findById(id)
	if (!isTourTypeExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Tour not exist')
	}

	// 3. Perform the update
	const tour = await TourModel.findByIdAndUpdate(id, payload, {
		new: true,
		runValidators: true,
	})

	return tour
}

const deleteTourFromDB = async (id: string) => {
	const isTourTypeExist = await TourModel.findById(id)
	if (!isTourTypeExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Tour is not exist')
	}

	const tour = await TourModel.findByIdAndDelete(id)
	return tour
}

// All tour Type services
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
