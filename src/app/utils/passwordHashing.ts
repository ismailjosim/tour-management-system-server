import bcrypt from 'bcryptjs';
import { environmentVariables } from '../configs/env';

const passwordHashing = async (password: string) => {
  const hashedPassword = await bcrypt.hash(
    password,
    Number(environmentVariables.BCRYPT_SALT_ROUND)
  );

  return hashedPassword;
};

export default passwordHashing;
