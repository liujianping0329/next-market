import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function POST(request) {
    const requestBody = await request.json();

    return NextResponse.json({ message: "Item create route is not working!" });
}