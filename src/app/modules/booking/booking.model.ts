import { Schema, model } from 'mongoose';
import { IBooking } from './booking.interface';

const bookingSchema = new Schema<IBooking>({});

export const Booking = model<IBooking>('Booking', bookingSchema);
