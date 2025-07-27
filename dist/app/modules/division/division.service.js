"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const division_model_1 = require("./division.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const division_constant_1 = require("./division.constant");
const cloudinary_config_1 = require("../../configs/cloudinary.config");
const createDivisionIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isDivisionExist = yield division_model_1.DivisionModel.findOne({ name: payload.name });
    if (isDivisionExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This Division is already exist');
    }
    const division = yield division_model_1.DivisionModel.create(payload);
    return division;
});
const getAllDivisionFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(division_model_1.DivisionModel.find(), query);
    const divisions = queryBuilder
        .search(division_constant_1.divisionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        divisions.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getSingleDivisionFromDB = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const division = yield division_model_1.DivisionModel.findOne({ slug });
    return {
        data: division,
    };
});
const updateDivisionIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isDivisionExist = yield division_model_1.DivisionModel.findById(id);
    if (!isDivisionExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Division Is not found');
    }
    const duplicateDivision = yield division_model_1.DivisionModel.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateDivision) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'A division with this name already exists.');
    }
    const division = yield division_model_1.DivisionModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    // Delete old image from cloudinary
    if (payload.thumbnail && isDivisionExist.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(isDivisionExist.thumbnail);
    }
    return division;
});
const deleteDivisionFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield division_model_1.DivisionModel.findByIdAndDelete(id);
    return null;
});
exports.DivisionServices = {
    createDivisionIntoDB,
    getAllDivisionFromDB,
    getSingleDivisionFromDB,
    updateDivisionIntoDB,
    deleteDivisionFromDB,
};
