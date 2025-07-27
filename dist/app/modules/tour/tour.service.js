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
exports.TourServices = void 0;
const QueryBuilder_1 = require("./../../utils/QueryBuilder");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const tour_model_1 = require("./tour.model");
const tour_constant_1 = require("./tour.constant");
const cloudinary_config_1 = require("../../configs/cloudinary.config");
const createTourIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourExist = yield tour_model_1.TourModel.findOne({ title: payload.title });
    if (isTourExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This Tour is already exist');
    }
    const tour = yield tour_model_1.TourModel.create(payload);
    return tour;
});
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
}
*/
const getAllTourFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.TourModel.find(), query);
    const tours = queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getSingleTourFromDB = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield tour_model_1.TourModel.findOne({ slug });
    return tour;
});
const updateTourIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourExist = yield tour_model_1.TourModel.findById(id);
    if (!isTourExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Tour not exist');
    }
    //* process one: add new image with existing image
    if (payload.images &&
        payload.images.length > 0 &&
        isTourExist.images &&
        isTourExist.images.length > 0) {
        payload.images = [...payload.images, ...isTourExist.images];
    }
    //* process two: add image also remove images from our DB
    if (payload.deleteImage &&
        payload.deleteImage.length > 0 &&
        isTourExist.images &&
        isTourExist.images.length > 0) {
        const restDBImages = isTourExist.images.filter((imgUrl) => { var _a; return !((_a = payload.deleteImage) === null || _a === void 0 ? void 0 : _a.includes(imgUrl)); });
        // remove exist old image from payload
        const updatedPayloadImages = ((payload === null || payload === void 0 ? void 0 : payload.images) || [])
            .filter((imgUrl) => { var _a; return !((_a = payload.deleteImage) === null || _a === void 0 ? void 0 : _a.includes(imgUrl)); })
            .filter((imgUrl) => !(restDBImages === null || restDBImages === void 0 ? void 0 : restDBImages.includes(imgUrl)));
        payload.images = [...restDBImages, ...updatedPayloadImages];
    }
    //* 3. Perform the update
    const tour = yield tour_model_1.TourModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (payload.deleteImage &&
        payload.deleteImage.length > 0 &&
        isTourExist.images &&
        isTourExist.images.length > 0) {
        yield Promise.all(payload.deleteImage.map((url) => (0, cloudinary_config_1.deleteImageFromCloudinary)(url).catch((error) => {
            console.error(`❌ Failed to delete image: ${url}`, error);
        })));
    }
    return tour;
});
const deleteTourFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourTypeExist = yield tour_model_1.TourModel.findById(id);
    if (!isTourTypeExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Tour is not exist');
    }
    const tour = yield tour_model_1.TourModel.findByIdAndDelete(id);
    return tour;
});
// All tour Type services
const createTourTypeIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = payload;
    const isTourTypeExist = yield tour_model_1.TourTypeModel.findOne({ name });
    if (isTourTypeExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This Tour Type is already exist');
    }
    const tourType = yield tour_model_1.TourTypeModel.create({ name });
    return tourType;
});
const getAllTourTypeFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.TourTypeModel.find(), query);
    const tourType = queryBuilder
        .search(tour_constant_1.tourTypeSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        tourType.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getSingleTourTypeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield tour_model_1.TourTypeModel.findById(id);
    return data;
});
const updateTourTypeIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourTypeExist = yield tour_model_1.TourTypeModel.findById(id);
    if (!isTourTypeExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This Tour Type is not exist');
    }
    if (payload.name) {
        if (isTourTypeExist.name === payload.name) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Tour Type is similar to the stored Value');
        }
    }
    // OPTIONAL: prevent updating to a name that already exists for *another* tour type
    // This is a more common scenario for unique names
    const existingTourTypeWithName = yield tour_model_1.TourTypeModel.findOne({
        name: payload.name,
    });
    if (existingTourTypeWithName &&
        existingTourTypeWithName._id.toString() !== id) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Another Tour Type with this name already exists. Please choose a different name.');
    }
    // 3. Perform the update
    const tour = yield tour_model_1.TourTypeModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return tour;
});
const deleteTourTypeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isTourTypeExist = yield tour_model_1.TourTypeModel.findById(id);
    if (!isTourTypeExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This Tour Type is not exist');
    }
    const tour = yield tour_model_1.TourTypeModel.findByIdAndDelete(id);
    return tour;
});
exports.TourServices = {
    createTourIntoDB,
    getAllTourFromDB,
    getSingleTourFromDB,
    updateTourIntoDB,
    deleteTourFromDB,
    createTourTypeIntoDB,
    getAllTourTypeFromDB,
    getSingleTourTypeFromDB,
    updateTourTypeIntoDB,
    deleteTourTypeFromDB,
};
/**

 *
 */
