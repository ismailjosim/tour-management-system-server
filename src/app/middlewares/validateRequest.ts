import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'

const validateSchema = (schema: AnyZodObject) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// console.log(req.body)
			if (req.body.data) {
				req.body = JSON.parse(req.body.data)
			}

			// Validate the request body against the schema
			req.body = await schema.parseAsync(req.body)
			next()
		} catch (error) {
			next(error)
		}
	}
}

export default validateSchema
