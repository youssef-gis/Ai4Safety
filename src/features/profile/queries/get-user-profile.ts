// Assuming your prisma client instance is exported as 'db' or 'prisma'

import { prisma } from "@/lib/prisma";

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      //image: true,
      username: true,
    },
  });
  return user;
};


export const updateUserProfile = async (
  userId: string, 
  data: { firstName: string; lastName: string; role?: string }
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    },
  });
  return updatedUser;
};