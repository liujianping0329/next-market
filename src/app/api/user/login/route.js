import { NextResponse } from "next/server";
import supabase from "../../../utils/database";
import { SignJWT } from "jose";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data , error } = await supabase.from("users").select()
        .eq("email", requestBody.email)
        .eq("password", requestBody.password)
        .single();
    if (error || !data) {
        return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }
    const secretKey = new TextEncoder().encode("your-secret-key");
    const token = await new SignJWT({ data })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(secretKey);

    return NextResponse.json({"token": token});
}