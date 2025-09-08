import { Types } from 'mongoose'

export interface IReview {
	user: Types.ObjectId
	tour: Types.ObjectId
	rating: number
	comments: string
	createdAt?: Date
}
