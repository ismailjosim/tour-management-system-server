import { Types } from 'mongoose'

export enum Role {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	USER = 'USER',
	GUIDE = 'GUIDE',
}

// AUTH PROVIDER
/*
 * email pass
 * google auth
 */

export interface IAuthProvider {
	provider: 'google' | 'credentials'
	providerId: string
}

export enum IsActive {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	BLOCKED = 'BLOCKED',
}

export interface IUser {
	_id: Types.ObjectId
	name: string
	email: string
	password?: string
	phone?: string
	picture?: string
	address?: string
	role: Role
	isDeleted?: boolean
	isActive?: IsActive
	isVerified?: boolean
	auths: IAuthProvider[]
	booking?: Types.ObjectId[]
	guides?: Types.ObjectId[]
	createdAt?: Date
}
