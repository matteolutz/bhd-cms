import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export const getUserById = (id: User["id"]): Promise<User | null> =>
  prisma.user.findUnique({ where: { id } });

export const getUserByEmail = (email: User["email"]): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } });

export const createUser = async (
  email: User["email"],
  password: string,
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
};

export const deleteUserByEmail = (email: User["email"]): Promise<User> =>
  prisma.user.delete({ where: { email } });

export const verifyLogin = async (
  email: User["email"],
  password: Password["hash"],
): Promise<User | null> => {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
};
