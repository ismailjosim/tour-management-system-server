import { model, Schema } from 'mongoose'
import { ITour, ITourType } from './tour.interface'

const tourTypeSchema = new Schema<ITourType>(
	{
		name: { type: String, require: true, unique: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

const tourSchema = new Schema<ITour>(
	{
		title: { type: String, required: true },
		slug: { type: String, unique: true },
		description: { type: String },
		images: { type: [String], default: [] },
		location: { type: String },
		costFrom: { type: Number },
		startDate: { type: Date },
		endDate: { type: Date },

		included: { type: [String], default: [] },
		excluded: { type: [String], default: [] },
		amenities: { type: [String], default: [] },
		tourPlan: { type: [String], default: [] },
		maxGuest: { type: Number },
		minAge: { type: Number },
		tourType: { type: Schema.Types.ObjectId, ref: 'TourType', required: true },
		division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

tourSchema.pre('save', async function (next) {
	if (this.isModified('title')) {
		const baseSlug = this.title.toLowerCase().split(' ').join('-')
		let slug = `${baseSlug}`

		let counter = 0
		while (await TourModel.exists({ slug })) {
			slug = `${slug}-${counter++}` // dhaka-division-2
		}

		this.slug = slug
	}
	next()
})

tourSchema.pre('findOneAndUpdate', async function (next) {
	const tour = this.getUpdate() as Partial<ITour>

	if (tour.title) {
		const baseSlug = tour.title.toLowerCase().split(' ').join('-')
		let slug = `${baseSlug}`

		let counter = 0
		while (await TourModel.exists({ slug })) {
			slug = `${slug}-${counter++}` // dhaka-division-2
		}

		tour.slug = slug
	}

	this.setUpdate(tour)

	next()
})

export const TourTypeModel = model<ITourType>('TourType', tourTypeSchema)
export const TourModel = model<ITour>('Tour', tourSchema)
