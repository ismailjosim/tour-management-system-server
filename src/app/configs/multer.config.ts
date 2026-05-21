/* eslint-disable no-useless-escape */
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinaryUpload } from './cloudinary.config';

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file) => {
      const rawName = file.originalname
        .split('.')
        .slice(0, -1)
        .join('.')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '-');

      // const extension = file.originalname.split('.').pop()

      return `${Math.random().toString(36).substring(2)}-${Date.now()}-${rawName}`; // here we don't need to add extension as cloudinary will handle it.
    },
    // Optional: folder: 'uploads'
  },
});

export const multerUpload = multer({ storage });
