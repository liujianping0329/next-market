import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjoiNDkxMjVlMTItZTBkMy00MzY3LTgwNGMtZTIyYmY2MmJkODU4IiwiY3JlYXRlZF9hdCI6IjIwMjUtMTAtMjZUMTM6MTM6MzcuODc5OTQ3KzAwOjAwIiwibmFtZSI6InVzZXIxIiwiZW1haWwiOiIxMjJAZ21haWwuY29tIiwicGFzc3dvcmQiOiJ1c2VyMXAifSwiZXhwIjoxNzYyNTIyNzAyfQ.FtTUWc9q9f72r6Liu8qYlc7EOlTQp9B_0xlKwWTJQVk";
    //const token = await request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const secretKey = new TextEncoder().encode("your-secret-key");
        const decodeJwt = await jwtVerify(token,secretKey);
        return NextResponse.next();
    }catch (error) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}

export const config = {
    matcher: ["/api/item/create","/api/item/update/:path*",
    "/api/item/delete/:path*"
    ],
};