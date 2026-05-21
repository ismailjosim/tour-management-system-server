import { environmentVariables } from '../configs/env';
import { IAuthProvider, Role } from '../modules/user/user.interface';
import { UserModel } from '../modules/user/user.model';
import passwordHashing from './passwordHashing';

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await UserModel.findOne({
      email: environmentVariables.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      return;
    }

    const hashedPassword = await passwordHashing(environmentVariables.SUPER_ADMIN_PASS as string);

    const authProvider: IAuthProvider = {
      provider: 'credentials',
      providerId: environmentVariables.SUPER_ADMIN_EMAIL,
    };

    const payload = {
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      email: environmentVariables.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      auths: [authProvider],
      isVerified: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _superAdmin = await UserModel.create(payload);
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _error
  ) {
    // Silently handle seeding error
  }
};

export default seedSuperAdmin;
