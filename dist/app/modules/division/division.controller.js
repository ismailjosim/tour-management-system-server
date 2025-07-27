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
exports.DivisionControllers = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const division_service_1 = require("./division.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createDivision = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { thumbnail: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = yield division_service_1.DivisionServices.createDivisionIntoDB(payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'Division Created successfully',
        data: result,
    });
}));
const getAllDivisions = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield division_service_1.DivisionServices.getAllDivisionFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'All Division Retried successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getSingleDivision = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield division_service_1.DivisionServices.getSingleDivisionFromDB(req.params.slug);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: result.data
            ? 'Division Retried successfully'
            : 'No Division Found',
        data: result.data,
    });
}));
const updateDivision = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { thumbnail: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = yield division_service_1.DivisionServices.updateDivisionIntoDB(id, payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: `Tour Type successfully Update to ${req.body.name}`,
        data: result,
    });
}));
const deleteDivision = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield division_service_1.DivisionServices.deleteDivisionFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Division Deleted successfully',
        data: result,
    });
}));
exports.DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};
