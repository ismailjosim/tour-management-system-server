import { Router } from 'express'
import { TourControllers } from './tour.controller'

const router = Router()

router.post('/create-tour-type', TourControllers.crateTourType)
router.get('/tour-types', TourControllers.getAllTourType)

export const TourRoutes = router
