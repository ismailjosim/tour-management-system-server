"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidation = void 0;
const zod_1 = require("zod");
const booking_interface_1 = require("./booking.interface");
const createBookingSchema = zod_1.z.object({
    tour: zod_1.z.string(),
    guestCount: zod_1.z.number().int().positive(),
});
const updateBookingStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(booking_interface_1.BOOKING_STATUS),
});
exports.BookingValidation = {
    createBookingSchema,
    updateBookingStatusSchema,
};
