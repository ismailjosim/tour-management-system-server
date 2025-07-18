import { model, Schema } from 'mongoose'
import { IDivision } from './division.interface'

const divisionSchema = new Schema<IDivision>(
	{
		name: {
			type: String,
			unique: true,
			required: true,
			trim: true,
		},
		slug: { type: String, unique: true },
		thumbnail: { type: String },
		description: { type: String },
	},
	{ timestamps: true, versionKey: false },
)

// Generate slug
divisionSchema.pre('save', async function (next) {
	if (this.isModified('name')) {
		const baseSlug = this.name.toLowerCase().split(' ').join('-')
		let slug = `${baseSlug}-division`

		let counter = 0
		while (await DivisionModel.exists({ slug })) {
			slug = `${slug}-${counter++}` // dhaka-division-2
		}

		this.slug = slug
	}
	next()
})

divisionSchema.pre('findOneAndUpdate', async function (next) {
	const division = this.getUpdate() as Partial<IDivision>
	if (division.name) {
		const baseSlug = division.name.toLowerCase().split(' ').join('-')
		let slug = `${baseSlug}-division`
		let counter = 0
		while (await DivisionModel.exists({ slug })) {
			slug = `${slug}-${counter++}` // dhaka-division-2
		}
	}
	this.setUpdate(division)

	next()
})

export const DivisionModel = model<IDivision>('Division', divisionSchema)
