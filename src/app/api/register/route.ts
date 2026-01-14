// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            password: !password ? "Password is required" : null,
          },
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please ensure the database is set up correctly.",
          hint: "Run 'npx prisma migrate dev' to set up the database.",
        },
        { status: 503 },
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    } catch (createError) {
      console.error("Error creating user:", createError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Account created successfully! You can now sign in." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
