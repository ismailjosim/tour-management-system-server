import { v2 as cloudinary } from 'cloudinary'
import { environmentVariables } from './env'

cloudinary.config({
	cloud_name: environmentVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
	api_key: environmentVariables.CLOUDINARY.CLOUDINARY_API_KEY,
	api_secret: environmentVariables.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const cloudinaryUpload = cloudinary

/*
;(async function () {
	// Configuration
	cloudinary.config({
		cloud_name: 'dggdr7ort',
		api_key: '876168861551955',
		api_secret: '<your_api_secret>', // Click 'View API Keys' above to copy your API secret
	})

	// Upload an image
	const uploadResult = await cloudinary.uploader
		.upload(
			'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
			{
				public_id: 'shoes',
			},
		)
		.catch((error) => {
			console.log(error)
		})

	console.log(uploadResult)

	// Optimize delivery by resizing and applying auto-format and auto-quality
	const optimizeUrl = cloudinary.url('shoes', {
		fetch_format: 'auto',
		quality: 'auto',
	})

	console.log(optimizeUrl)

	// Transform the image: auto-crop to square aspect_ratio
	const autoCropUrl = cloudinary.url('shoes', {
		crop: 'auto',
		gravity: 'auto',
		width: 500,
		height: 500,
	})

	console.log(autoCropUrl)
})()
    */
