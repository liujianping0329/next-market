import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function POST(request, context) {
    await supabase.from("users").insert(await request.json());
    return NextResponse.json({ message: "User register route is working!" });
}