import { v2 as cloudinary } from 'cloudinary'
import { environmentVariables } from './env'

cloudinary.config({
	cloud_name: environmentVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
	api_key: environmentVariables.CLOUDINARY.CLOUDINARY_API_KEY,
	api_secret: environmentVariables.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const cloudinaryUpload = cloudinary
