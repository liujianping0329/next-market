import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function GET(request) {
    const requestBody = await request.json();
    console.log(requestBody)
    return NextResponse.json({ message: "Item create route is not working!" });
}