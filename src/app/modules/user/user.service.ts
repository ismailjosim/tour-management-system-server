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

export const UserServices = {
	createUserIntoDB,
}
