import { Query } from 'mongoose'
import { excludeField } from '../constants'

export class QueryBuilder<T> {
	public modelQuery: Query<T[], T>
	public readonly query: Record<string, string>

	constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
		this.modelQuery = modelQuery
		this.query = query
	}

	//* Filter method
	filter(): this {
		const filter = { ...this.query } // make a copy
		for (const field of excludeField) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete filter[field]
		}
		this.modelQuery = this.modelQuery.find(filter) // TourModel.find().find(filter)
		return this
	}
	search(searchableField: string[]): this {
		const searchTerm = this.query.searchTerm || ''

		const searchQuery = {
			$or: searchableField.map((field) => ({
				[field]: { $regex: searchTerm, $options: 'i' },
			})),
		}
		this.modelQuery = this.modelQuery.find(searchQuery)
		return this
	}
	sort(): this {
		const sort = this.query.sort || '-createdAt'
		this.modelQuery = this.modelQuery.sort(sort)
		return this
	}
	paginate(): this {
		const page = Number(this.query.page) || 1
		const limit = Number(this.query.limit) || 10
		const skip = (page - 1) * limit

		this.modelQuery = this.modelQuery.skip(skip).limit(limit)
		return this
	}
	fields(): this {
		const fields = this.query?.fields?.split(',').join(' ') || '' // title, location => title location
		this.modelQuery = this.modelQuery.select(fields)
		return this
	}
	build() {
		return this.modelQuery
	}
	async getMeta() {
		const totalDocuments = await this.modelQuery.model.countDocuments()
		const page = Number(this.query.page) || 1
		const limit = Number(this.query.limit) || 10
		const totalPage = Math.ceil(totalDocuments / limit)
		const meta = {
			page,
			limit,
			total: totalDocuments,
			totalPage: totalPage,
		}
		return meta
	}
}
