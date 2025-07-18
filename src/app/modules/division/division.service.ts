import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { IDivision } from './division.interface'
import { DivisionModel } from './division.model'

const createDivisionIntoDB = async (payload: IDivision) => {
	const isDivisionExist = await DivisionModel.findOne({ name: payload.name })
	if (isDivisionExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This Division is already exist')
	}
	const division = await DivisionModel.create(payload)
	return division
}
const getAllDivisionFromDB = async () => {
	const divisions = await DivisionModel.find()
	const totalDivisions = await DivisionModel.countDocuments()
	return {
		data: divisions,
		meta: {
			total: totalDivisions,
		},
	}
}
const getSingleDivisionFromDB = async (slug: string) => {
	const division = await DivisionModel.findOne({ slug })

	return {
		data: division,
	}
}

const updateDivisionIntoDB = async (
	id: string,
	payload: Partial<IDivision>,
) => {
	const isDivisionExist = await DivisionModel.findById(id)
	if (!isDivisionExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Division Is not found')
	}

	const duplicateDivision = await DivisionModel.findOne({
		name: payload.name,
		_id: { $ne: id },
	})

	if (duplicateDivision) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'A division with this name already exists.',
		)
	}

	const division = await DivisionModel.findByIdAndUpdate(id, payload, {
		new: true,
		runValidators: true,
	})
	return division
}
const deleteDivisionFromDB = async (id: string) => {
	await DivisionModel.findByIdAndDelete(id)
	return null
}

export const DivisionServices = {
	createDivisionIntoDB,
	getAllDivisionFromDB,
	getSingleDivisionFromDB,
	updateDivisionIntoDB,
	deleteDivisionFromDB,
}
