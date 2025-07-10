import { Request, Response } from 'express'
import httpStatus from 'http-status-codes'
const notFound = (req: Request, res: Response) => {
	res.status(httpStatus.NOT_FOUND).json({
		success: false,
		message: `${req.originalUrl as string} Does not found`,
	})
}

export default notFound
