// import { Query } from 'mongoose'
// import { excludeField } from '../constants'

// export class QueryBuilder<T> {
// 	public modelQuery: Query<T[], T>
// 	public readonly query: Record<string, string>

// 	constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
// 		this.modelQuery = modelQuery
// 		this.query = query
// 	}

// 	// Filter
// 	filter(): this {
// 		const filter = { ...this.filter }
// 		for (const field of excludeField) {
// 			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
// 			delete filter[field]
// 		}
// 		this.modelQuery = this.modelQuery.find(filter)
// 	}
// }
