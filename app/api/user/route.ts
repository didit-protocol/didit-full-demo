import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prismaDb from "@/app/libs/prismaDb";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: Request) {
  // get access token from authorization header
  const authHeader = request.headers.get("Authorization");
  const token = authHeader ? authHeader.split(" ")[1] : null;

  const url = process.env.NEXT_PUBLIC_RETRIEVE_ENDPOINT;

  if (!token || !url) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prismaDb.user.findUnique({
    where: {
      id: session.user.id as string,
    },
  });

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // call the retrieve endpoint
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    let updateData = {} as any;
    if (data.email) updateData.email = data.email;
    if (data.names?.first_name) updateData.name = data.names.first_name;
    if (data.names?.family_name) updateData.lastName = data.names.family_name;
    if (data.picture) updateData.image = data.picture;

    // update user data
    const updatedUser = await prismaDb.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    // get the lastVerification object from the user
    const lastVerification = await prismaDb.verification.findFirst({
      where: { userId: updatedUser.id },
      orderBy: { createdAt: "desc" },
    });

    const user = {
      ...updatedUser,
      lastVerification,
    };

    return NextResponse.json(user); // Optionally modify what you return as needed
  } catch (error) {
    console.error("Error handling user data:", error);
    return NextResponse.json(
      { message: "Failed to handle user data" },
      { status: 500 }
    );
  }
}
