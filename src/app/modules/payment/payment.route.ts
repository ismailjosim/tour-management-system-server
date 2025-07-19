import express from 'express'
import { PaymentController } from './payment.controller'

const router = express.Router()

router.post('/init-payment/:bookingId', PaymentController.createPayment)

export const PaymentRoutes = router
