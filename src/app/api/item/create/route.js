import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function POST(request) {
    const requestBody = await request.json();
    console.log("Request Body:", requestBody);
    try {
        const {error} = await supabase.from("items").insert(requestBody);
        if (error) {
            throw new Error(error);
        }
        return NextResponse.json({ message: "Item create route is working!" });
    } catch (error) {
        console.error("Error creating item:", error);
        return NextResponse.json({ message: "Item create route is not working!" });
    }
    
}