/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import { environmentVariables } from '../../configs/env'
import AppError from '../../errorHelpers/AppError'
import { ISSlCommerz } from './sslCommerz.interface'
import axios from 'axios'
import { PaymentModel } from '../payment/payment.model'

const sslPaymentInit = async (payload: ISSlCommerz) => {
	try {
		const data = {
			store_id: environmentVariables.SSL.SSL_STORE_ID,
			store_passwd: environmentVariables.SSL.SSL_STORE_PASS,
			total_amount: payload.amount,
			currency: 'BDT',
			tran_id: payload.transactionId,
			success_url: `${environmentVariables.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
			fail_url: `${environmentVariables.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
			cancel_url: `${environmentVariables.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
			ipn_url: environmentVariables.SSL.SSL_IPN_URL,
			shipping_method: 'N/A',
			product_name: 'Tour',
			product_category: 'Service',
			product_profile: 'general',
			cus_name: payload.name,
			cus_email: payload.email,
			cus_add1: payload.address,
			cus_add2: 'N/A',
			cus_city: 'Dhaka',
			cus_state: 'Dhaka',
			cus_postcode: '1000',
			cus_country: 'Bangladesh',
			cus_phone: payload.phoneNumber,
			cus_fax: '01711111111',
			ship_name: 'N/A',
			ship_add1: 'N/A',
			ship_add2: 'N/A',
			ship_city: 'N/A',
			ship_state: 'N/A',
			ship_postcode: 1000,
			ship_country: 'N/A',
		}
		const res = await axios({
			method: 'POST',
			url: environmentVariables.SSL.SSL_PAYMENT_API,
			data: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
		const returnData = res.data
		return returnData
	} catch (error: any) {
		console.log('payment error occurred', error)
		throw new AppError(httpStatus.BAD_REQUEST, error.message)
	}
}

const validatePayment = async (payload: any) => {
	try {
		const response = await axios({
			method: 'GET',
			url: `${environmentVariables.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${environmentVariables.SSL.SSL_STORE_ID}&store_passwd=${environmentVariables.SSL.SSL_STORE_PASS}`,
		})

		console.log('SSLCommerz Validate API Response ', response.data)

		await PaymentModel.updateOne(
			{ transactionId: payload.tran.id },
			{ paymentGatewayData: response.data },
			{ runValidators: true },
		)
	} catch (error: any) {
		if (environmentVariables.NODE_ENV === 'development') {
			console.log('Found Error While Validate Payment: ', error)
		}
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Found Error While Validate Payment: ${error.message}`,
		)
	}
}

export const SSLService = {
	sslPaymentInit,
	validatePayment,
}
