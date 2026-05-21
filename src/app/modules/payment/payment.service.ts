/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus, { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { BOOKING_STATUS } from '../booking/booking.interface';
import { BookingModel } from '../booking/booking.model';
import { PAYMENT_STATUS } from './payment.interface';
import { PaymentModel } from './payment.model';
import { ISSlCommerz } from '../sslCommerz/sslCommerz.interface';
import { SSLService } from '../sslCommerz/sslCommerz.service';
import { generatePDF, IInvoiceData } from '../../utils/invoice';
import { IUser } from '../user/user.interface';
import { Role } from '../user/user.interface';
import { ITour } from '../tour/tour.interface';
import { sendMail } from '../../utils/sendEmail';
import { uploadBufferToCloudinary } from '../../configs/cloudinary.config';

const isAdminRole = (role: Role) => role === Role.ADMIN || role === Role.SUPER_ADMIN;

const assertBookingOwnerOrAdmin = (bookingUserId: string, userId: string, role: Role) => {
  if (!isAdminRole(role) && bookingUserId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  }
};

const getTransactionIdFromPayload = (payload: Record<string, string>) =>
  payload.tran_id || payload.transactionId || payload.transaction_id;

const isValidSslPayment = (status?: string) => status === 'VALID' || status === 'VALIDATED';

const assertPaymentMatchesGateway = (
  paymentAmount: number,
  transactionId: string,
  gatewayData: Record<string, any>
) => {
  if (!isValidSslPayment(gatewayData.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment validation failed with SSLCommerz');
  }

  if (!gatewayData.tran_id || gatewayData.tran_id !== transactionId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment transaction id mismatch');
  }

  const gatewayAmount = Number(gatewayData.amount);
  if (!Number.isFinite(gatewayAmount) || gatewayAmount !== paymentAmount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment amount mismatch');
  }
};

const initPaymentIntoDB = async (bookingId: string, userId: string, role: Role) => {
  const payment = await PaymentModel.findOne({ booking: bookingId });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not Found. You didn't booked this tour yet!");
  }
  const booking = await BookingModel.findById(payment.booking)
    .populate('user', 'name email phone address')
    .populate('tour', 'title')
    .populate('payment');

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  const bookingUser = booking.user as unknown as IUser;
  assertBookingOwnerOrAdmin(String(bookingUser._id), userId, role);

  if (payment.status === PAYMENT_STATUS.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment already completed.');
  }

  if (booking.status === BOOKING_STATUS.COMPLETE) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already confirmed.');
  }

  // SSL Commerz payment
  const userAddress = bookingUser.address;
  const userEmail = bookingUser.email;
  const userPhoneNumber = bookingUser.phone;
  const userName = bookingUser.name;

  if (!userAddress || !userPhoneNumber) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please Update Your Profile to Pay for this Booking'
    );
  }

  const sslPayload: ISSlCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };
  const sslPayment = await SSLService.sslPaymentInit(sslPayload);
  return {
    paymentUrl: sslPayment.GatewayPageURL,
    booking: booking,
  };
};

const successPaymentIntoDB = async (query: Record<string, string>) => {
  const transactionId = getTransactionIdFromPayload(query);
  if (!transactionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction id is required');
  }

  const gatewayData = await SSLService.validatePayment(query);

  const session = await BookingModel.startSession();
  session.startTransaction();

  try {
    const payment = await PaymentModel.findOne({
      transactionId,
    }).session(session);
    if (!payment) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Not Found');
    }

    assertPaymentMatchesGateway(payment.amount, transactionId, gatewayData);

    if (payment.status === PAYMENT_STATUS.PAID) {
      await PaymentModel.findByIdAndUpdate(
        payment._id,
        { paymentGatewayData: gatewayData },
        { runValidators: true, session }
      );
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already completed' };
    }

    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      payment._id,
      {
        status: PAYMENT_STATUS.PAID,
        paymentGatewayData: gatewayData,
      },
      { new: true, runValidators: true, session }
    );
    if (!updatedPayment) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Not Found');
    }

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      updatedPayment.booking,
      { status: BOOKING_STATUS.COMPLETE },
      { new: true, runValidators: true, session }
    )
      .populate('user', 'name email phone address')
      .populate('tour', 'title')
      .populate('payment', 'transactionId amount');

    if (!updatedBooking) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Tour Not Found');
    }
    const user = updatedBooking.user as unknown as IUser;

    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      transactionId: updatedPayment.transactionId,
      userName: user.name,
      userEmail: user.email,
    };

    const pdfBuffer = await generatePDF(invoiceData);

    // manually upload PDF into our cloudinary store
    const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, 'invoice');
    await PaymentModel.findByIdAndUpdate(
      updatedPayment._id,
      {
        invoiceUrl: cloudinaryResult?.secure_url,
      },
      { runValidators: true, session }
    );

    // send user email
    await sendMail({
      to: user.email,
      subject: 'Your Booking Invoice',
      templateName: 'invoice',
      templateData: {
        userName: invoiceData.userName,
        tourTitle: invoiceData.tourTitle,
        transactionId: invoiceData.transactionId,
        totalAmount: invoiceData.totalAmount,
        bookingDate: invoiceData.bookingDate,
        userEmail: invoiceData.userEmail,
      },
      attachments: [
        {
          filename: 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'Payment Completed Successfully' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const failPaymentIntoDB = async (query: Record<string, string>) => {
  const transactionId = getTransactionIdFromPayload(query);
  if (!transactionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction id is required');
  }

  const session = await BookingModel.startSession();
  session.startTransaction();

  try {
    const payment = await PaymentModel.findOne({ transactionId }).session(session);
    if (!payment) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Not Found');
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already completed' };
    }

    if (payment.status === PAYMENT_STATUS.FAILED) {
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already marked as failed' };
    }

    if (payment.status === PAYMENT_STATUS.CANCELLED) {
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already cancelled' };
    }

    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      payment._id,
      { status: PAYMENT_STATUS.FAILED, paymentGatewayData: query },
      { new: true, runValidators: true, session }
    );

    await BookingModel.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.FAILED },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'Payment Failed' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const cancelPaymentIntoDB = async (query: Record<string, string>) => {
  const transactionId = getTransactionIdFromPayload(query);
  if (!transactionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction id is required');
  }

  const session = await BookingModel.startSession();
  session.startTransaction();

  try {
    const payment = await PaymentModel.findOne({ transactionId }).session(session);
    if (!payment) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Not Found');
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already completed' };
    }

    if (payment.status === PAYMENT_STATUS.CANCELLED) {
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already cancelled' };
    }

    if (payment.status === PAYMENT_STATUS.FAILED) {
      await session.commitTransaction();
      session.endSession();

      return { success: true, message: 'Payment already marked as failed' };
    }

    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      payment._id,
      { status: PAYMENT_STATUS.CANCELLED, paymentGatewayData: query },
      { new: true, runValidators: true, session }
    );

    await BookingModel.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.CANCEL },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'Payment Canceled' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getInvoiceDownloadURLFromDB = async (id: string, userId: string, role: Role) => {
  const payment = await PaymentModel.findById(id).select('invoiceUrl booking');

  if (!payment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Found');
  }

  const booking = await BookingModel.findById(payment.booking).select('user');
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  assertBookingOwnerOrAdmin(String(booking.user), userId, role);

  if (!payment.invoiceUrl) {
    throw new AppError(httpStatus.BAD_REQUEST, 'InvoiceUrl Not Found');
  }

  return payment;
};

const validatePaymentIntoDB = async (payload: Record<string, string>) => {
  const transactionId = getTransactionIdFromPayload(payload);
  if (!transactionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction id is required');
  }

  const gatewayData = await SSLService.validatePayment(payload);
  const payment = await PaymentModel.findOne({ transactionId });
  if (!payment) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Not Found');
  }

  assertPaymentMatchesGateway(payment.amount, transactionId, gatewayData);

  await PaymentModel.findByIdAndUpdate(
    payment._id,
    { paymentGatewayData: gatewayData },
    { runValidators: true }
  );

  return gatewayData;
};

export const PaymentService = {
  initPaymentIntoDB,
  successPaymentIntoDB,
  failPaymentIntoDB,
  cancelPaymentIntoDB,
  getInvoiceDownloadURLFromDB,
  validatePaymentIntoDB,
};
