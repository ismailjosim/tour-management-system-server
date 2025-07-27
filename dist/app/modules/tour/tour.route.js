"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourRoutes = void 0;
const express_1 = require("express");
const tour_controller_1 = require("./tour.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const tour_validation_1 = require("./tour.validation");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const user_interface_1 = require("../user/user.interface");
const multer_config_1 = require("../../configs/multer.config");
const router = (0, express_1.Router)();
// Tour type routes
router.post('/create-tour-types', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.default)(tour_validation_1.TourSchemaValidation.tourTypeValidationSchema), tour_controller_1.TourControllers.crateTourType);
router.get('/tour-types', tour_controller_1.TourControllers.getAllTourType);
router.get('/tour-types/:id', tour_controller_1.TourControllers.getSingleTourType);
router.patch('/tour-types/:id', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.default)(tour_validation_1.TourSchemaValidation.tourTypeValidationSchema), tour_controller_1.TourControllers.updateTourType);
router.delete('/tour-types/:id', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), tour_controller_1.TourControllers.deleteTourType);
// Tour route
router.post('/create', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.array('files'), (0, validateRequest_1.default)(tour_validation_1.TourSchemaValidation.createTourValidationSchema), tour_controller_1.TourControllers.crateTour);
router.get('/', tour_controller_1.TourControllers.getAllTour);
router.get('/:slug', tour_controller_1.TourControllers.getSingleTour);
router.patch('/:id', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.array('files'), (0, validateRequest_1.default)(tour_validation_1.TourSchemaValidation.updateTourValidationSchema), tour_controller_1.TourControllers.updateTour);
router.delete('/:id', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), tour_controller_1.TourControllers.deleteTour);
exports.TourRoutes = router;
