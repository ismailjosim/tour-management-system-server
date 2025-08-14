/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { environmentVariables } from './env'
import AppError from '../errorHelpers/AppError'
import stream from 'stream'

cloudinary.config({
	cloud_name: environmentVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
	api_key: environmentVariables.CLOUDINARY.CLOUDINARY_API_KEY,
	api_secret: environmentVariables.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const uploadBufferToCloudinary = async (
	buffer: Buffer,
	fileName: string,
): Promise<UploadApiResponse | undefined> => {
	try {
		return new Promise((resolve, reject) => {
			const public_id = `pdf/${fileName}-${Date.now()}`

			const bufferStream = new stream.PassThrough()
			bufferStream.end(buffer)

			cloudinary.uploader
				.upload_stream(
					{
						resource_type: 'auto',
						public_id: public_id,
						folder: 'pdf',
					},
					(error, result) => {
						if (error) {
							return reject(error)
						}
						resolve(result)
					},
				)
				.end(buffer)
		})
	} catch (error: any) {
		if (environmentVariables.NODE_ENV === 'development') {
			console.error('❌ Cloudinary Deletion Error:', error)
		}
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Error while Uploading File: ${error.message}`,
		)
	}
}

// Delete Image from Cloudinary
export const deleteImageFromCloudinary = async (url: string) => {
	try {
		const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i
		const match = url.match(regex)
		if (match && match[1]) {
			const publicId = match[1]
			await cloudinary.uploader.destroy(publicId)
			if (environmentVariables.NODE_ENV === 'development') {
				console.log(`✅ File deleted: ${publicId}`)
			}
		}
	} catch (error: any) {
		if (environmentVariables.NODE_ENV === 'development') {
			console.error('❌ Cloudinary Deletion Error:', error)
		}
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Cloudinary Image Deletion Failed: ${error.message}`,
		)
	}
}

export const cloudinaryUpload = cloudinary
