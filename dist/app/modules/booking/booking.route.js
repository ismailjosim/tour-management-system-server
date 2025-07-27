"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const user_interface_1 = require("../user/user.interface");
const booking_validation_1 = require("./booking.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.post('/', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.default)(booking_validation_1.BookingValidation.createBookingSchema), booking_controller_1.BookingController.createBooking);
router.get('/', 
// checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
booking_controller_1.BookingController.getAllBookings);
router.get('/my-bookings', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), booking_controller_1.BookingController.getUserBookings);
router.get('/:bookingId', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), booking_controller_1.BookingController.getSingleBooking);
router.patch('/:bookingId/status', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.default)(booking_validation_1.BookingValidation.updateBookingStatusSchema), booking_controller_1.BookingController.updateBookingStatus);
exports.BookingRoutes = router;
