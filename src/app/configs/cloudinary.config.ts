/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import { v2 as cloudinary } from 'cloudinary'
import { environmentVariables } from './env'
import AppError from '../errorHelpers/AppError'

cloudinary.config({
	cloud_name: environmentVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
	api_key: environmentVariables.CLOUDINARY.CLOUDINARY_API_KEY,
	api_secret: environmentVariables.CLOUDINARY.CLOUDINARY_API_SECRET,
})

// Delete Image from Cloudinary
// Utility Function
export const deleteImageFromCloudinary = async (url: string) => {
	try {
		const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i
		const match = url.match(regex)
		if (match && match[1]) {
			const publicId = match[1]
			await cloudinary.uploader.destroy(publicId)
			console.log(`✅ File deleted: ${publicId}`)
		}
	} catch (error: any) {
		console.error('❌ Cloudinary Deletion Error:', error)
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'Cloudinary Image Deletion Failed',
			error.message,
		)
	}
}

export const cloudinaryUpload = cloudinary
