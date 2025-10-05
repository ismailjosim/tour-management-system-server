import { model, Schema } from 'mongoose'
import { IAuthProvider, IsActive, IUser, Role } from './user.interface'

const authProviderSchema = new Schema<IAuthProvider>(
	{
		provider: { type: String, required: true }, // "google", "credentials"
		providerId: { type: String, required: true },
	},
	{ _id: false, versionKey: false },
)

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String },
		phone: { type: String },
		picture: { type: String, default: null },
		address: { type: String },
		role: {
			type: String,
			enum: Object.values(Role),
			default: Role.USER,
		},
		isDeleted: { type: Boolean, default: false },
		isActive: {
			type: String,
			enum: Object.values(IsActive),
			default: 'ACTIVE',
		},
		isVerified: { type: Boolean, default: false },
		auths: { type: [authProviderSchema], default: [] },
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

export const UserModel = model<IUser>('User', userSchema)
