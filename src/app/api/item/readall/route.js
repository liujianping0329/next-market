import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function GET() {
    try {
        const{ data } = await supabase.from("items").select();
        return NextResponse.json({message : "Item read all route is working!",
            allItems : data});
    } catch (error) {
        console.error("Error reading items:", error);
        return NextResponse.json("Item read all route is not working!");
    }
}

export const revalidate = 0;