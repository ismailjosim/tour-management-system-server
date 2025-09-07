import express from 'express'
import { ReviewController } from './review.controller'
import validateSchema from '../../middlewares/validateRequest'
import { ReviewValidation } from './review.validation'
import multer from 'multer'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const upload = multer()

const router = express.Router()

router.post(
	'/create-review',
	upload.none(), //  Add this middleware to handle form-data
	validateSchema(ReviewValidation.createReviewZodSchema),
	checkAuth(...Object.values(Role)),
	ReviewController.createReview,
)

router.get('/:tourId', ReviewController.getSpecificTourReviews)

export const ReviewRoutes = router
