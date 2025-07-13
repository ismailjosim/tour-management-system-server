import { environmentVariables } from '../configs/env'
import { IAuthProvider, Role } from '../modules/user/user.interface'
import { UserModel } from '../modules/user/user.model'
import passwordHashing from './passwordHashing'

const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExist = await UserModel.findOne({
			email: environmentVariables.SUPER_ADMIN_EMAIL,
		})

		if (isSuperAdminExist) {
			console.log('Super Admin already exist')
			return
		}

		console.log('Creating SUPER ADMIN is processing....🔃')
		const hashedPassword = await passwordHashing(
			environmentVariables.SUPER_ADMIN_PASS as string,
		)

		const authProvider: IAuthProvider = {
			provider: 'credentials',
			providerId: environmentVariables.SUPER_ADMIN_EMAIL,
		}

		const payload = {
			name: 'Super Admin',
			role: Role.SUPER_ADMIN,
			email: environmentVariables.SUPER_ADMIN_EMAIL,
			password: hashedPassword,
			auths: [authProvider],
			isVerified: true,
		}

		const superAdmin = await UserModel.create(payload)
		console.log('Super Admin Created Successfully', superAdmin)
	} catch (error) {
		console.log(error)
	}
}

export default seedSuperAdmin
