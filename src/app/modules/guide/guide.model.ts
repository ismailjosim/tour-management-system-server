import { Schema, model } from 'mongoose'
import { IGuide, IGuideStatus } from './guide.interface'

const guideSchema = new Schema<IGuide>(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
		nidPhoto: { type: String, required: true },
		status: {
			type: String,
			enum: Object.values(IGuideStatus),
			default: IGuideStatus.PENDING,
		},
	},
	{
		timestamps: true,
	},
)

export const GuideModel = model<IGuide>('Guide', guideSchema)
