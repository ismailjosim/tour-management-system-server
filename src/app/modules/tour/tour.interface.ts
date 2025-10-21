// ========================================
// tour.interface.ts
// ========================================
import { Types } from 'mongoose'

export interface ILocationInMap {
	title: string
	lat: number
	lng: number
}

export interface ITourType {
	name: string
}

export interface ITour {
	title: string
	slug?: string
	description?: string
	images?: string[]
	location?: string
	costFrom?: number
	startDate?: Date
	endDate?: Date
	tourType?: Types.ObjectId
	division?: Types.ObjectId
	included?: string[]
	excluded?: string[]
	amenities?: string[]
	tourPlan?: string[]
	maxGuest?: number
	minAge?: number
	departureLocation?: string
	arrivalLocation?: string
	departureLocationInMap?: ILocationInMap
	arrivalLocationInMap?: ILocationInMap
	deleteImage?: string[]
}
