/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import { environmentVariables } from '../../configs/env'
import AppError from '../../errorHelpers/AppError'
import { ISSlCommerz } from './sslCommerz.interface'
import axios from 'axios'
import { PaymentModel } from '../payment/payment.model'
import qs from 'qs'

const sslPaymentInit = async (payload: ISSlCommerz) => {
	try {
		const data = {
			store_id: environmentVariables.SSL.SSL_STORE_ID,
			store_passwd: environmentVariables.SSL.SSL_STORE_PASS,
			total_amount: payload.amount,
			currency: 'BDT',
			tran_id: payload.transactionId,

			success_url: `${environmentVariables.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&status=success`,
			fail_url: `${environmentVariables.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&status=fail`,
			cancel_url: `${environmentVariables.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&status=cancel`,
			ipn_url: environmentVariables.SSL.SSL_IPN_URL,

			shipping_method: 'NO',
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

			ship_name: payload.name,
			ship_add1: payload.address,
			ship_city: 'Dhaka',
			ship_postcode: 1000,
			ship_country: 'Bangladesh',
		}

		// ✅ IMPORTANT: use v4 endpoint directly (avoid wrong env)
		const SSL_URL = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

		const res = await axios.post(SSL_URL, qs.stringify(data), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})

		// ✅ Debug check
		if (typeof res.data === 'string') {
			throw new Error('Invalid response from SSLCommerz (HTML received)')
		}

		return res.data
	} catch (error: any) {
		console.log(
			'payment error occurred',
			error?.response?.data || error.message,
		)
		throw new AppError(httpStatus.BAD_REQUEST, error.message)
	}
}

const validatePayment = async (payload: any) => {
	try {
		const VALIDATION_URL =
			'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'

		const response = await axios.get(
			`${VALIDATION_URL}?val_id=${payload.val_id}&store_id=${environmentVariables.SSL.SSL_STORE_ID}&store_passwd=${environmentVariables.SSL.SSL_STORE_PASS}&v=1&format=json`,
		)

		console.log('SSLCommerz Validate API Response:', response.data)

		await PaymentModel.updateOne(
			{ transactionId: payload.tran_id }, // ✅ FIXED (was wrong before)
			{ paymentGatewayData: response.data },
			{ runValidators: true },
		)

		return response.data
	} catch (error: any) {
		console.log('Validation Error:', error?.response?.data || error.message)

		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Payment validation failed: ${error.message}`,
		)
	}
}

export const SSLService = {
	sslPaymentInit,
	validatePayment,
}
