import { IUser } from './user.interface'
import { UserModel } from './user.model'

const createUserIntoDB = async (payload: Partial<IUser>) => {
	const { name, email } = payload
	const user = await UserModel.create({
		name,
		email,
	})
	return user
}

const getAllUsersFromDB = async () => {
	const query = {}
	const users = await UserModel.find(query)
	const totalUsers = await UserModel.countDocuments()

	return {
		data: users,
		meta: {
			total: totalUsers,
		},
	}
}

const createSingleUserFromDB = async () => {
	return null
}

export const UserServices = {
	createUserIntoDB,
	getAllUsersFromDB,
	createSingleUserFromDB,
}
