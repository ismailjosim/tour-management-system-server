import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IDivision } from './division.interface';
import { DivisionModel } from './division.model';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { divisionSearchableFields } from './division.constant';
import { deleteImageFromCloudinary } from '../../configs/cloudinary.config';

const createDivisionIntoDB = async (payload: IDivision) => {
  const isDivisionExist = await DivisionModel.findOne({ name: payload.name });
  if (isDivisionExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This Division is already exist');
  }
  const division = await DivisionModel.create(payload);
  return division;
};

const getAllDivisionFromDB = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(DivisionModel.find(), query);
  const divisions = queryBuilder
    .search(divisionSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();
  const [data, meta] = await Promise.all([divisions.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta,
  };
};

const getSingleDivisionFromDB = async (slug: string) => {
  const division = await DivisionModel.findOne({ slug });

  return {
    data: division,
  };
};

const updateDivisionIntoDB = async (id: string, payload: Partial<IDivision>) => {
  const isDivisionExist = await DivisionModel.findById(id);
  if (!isDivisionExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Division Is not found');
  }

  const duplicateDivision = await DivisionModel.findOne({
    name: payload.name,
    _id: { $ne: id },
  });

  if (duplicateDivision) {
    throw new AppError(httpStatus.BAD_REQUEST, 'A division with this name already exists.');
  }

  const division = await DivisionModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  // Delete old image from cloudinary
  if (payload.thumbnail && isDivisionExist.thumbnail) {
    await deleteImageFromCloudinary(isDivisionExist.thumbnail);
  }

  return division;
};

const deleteDivisionFromDB = async (id: string) => {
  await DivisionModel.findByIdAndDelete(id);
  return null;
};

export const DivisionServices = {
  createDivisionIntoDB,
  getAllDivisionFromDB,
  getSingleDivisionFromDB,
  updateDivisionIntoDB,
  deleteDivisionFromDB,
};
