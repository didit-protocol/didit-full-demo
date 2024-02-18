import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prismaDb from "@/app/libs/prismaDb";

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return null;
    }

    const currentUser = await prismaDb.user.findUnique({
      where: {
        id: session.user.id as string,
      },
    });

    if (!currentUser) {
      return null;
    }

    // add last verification linked to user
    const lastVerification = await prismaDb.verification.findFirst({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const loggedInUser = {
      ...currentUser,
      lastVerification,
    };

    return loggedInUser;
  } catch (error: any) {
    return null;
  }
}
