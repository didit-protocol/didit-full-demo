// utils/introspectToken.ts
import prismaDb from "@/app/libs/prismaDb";
import { User } from "@prisma/client";

async function introspectToken(token: string): Promise<string | null> {
  try {
    const response = await fetch(
      "https://apx.staging.didit.me/auth/v2/introspect/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Token introspection failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.sub; // Assuming 'sub' is the user ID
  } catch (error) {
    console.error("Error introspecting token:", error);
    return null;
  }
}

async function getUserInfoBySub(sub: string): Promise<User> {
  try {
    let user = await prismaDb.user.findUnique({
      where: { id: sub },
    });

    // If no user found, create one
    if (!user) {
      user = await prismaDb.user.create({
        data: {
          id: sub,
          image: "/images/blank-user.png",
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error fetching or creating user from database:", error);
    throw new Error("Could not fetch or create user.");
  }
}

export { introspectToken, getUserInfoBySub };
