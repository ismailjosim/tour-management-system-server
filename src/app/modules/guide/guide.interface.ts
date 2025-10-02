import { Types } from 'mongoose'

export enum IGuideStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
}

export interface IGuide {
	_id: Types.ObjectId
	user: Types.ObjectId
	division: Types.ObjectId
	nidPhoto: string
	status?: IGuideStatus
	createdAt?: Date
	updatedAt?: Date
}
