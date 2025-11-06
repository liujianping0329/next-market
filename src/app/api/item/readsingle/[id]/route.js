import { NextResponse } from "next/server";
import supabase from "../../../../utils/database";

export async function GET(request,context) {
    const para = await context.params;
    console.log("Parameter", para);
    try {
        const {data} = await supabase.from("items").select().eq("id",para.id).single();
        return NextResponse.json({message:"Item read all route is working!",data:data});
    }catch (error) {
        console.error("Error reading item:", error);
        return NextResponse.json("Item read all route is not working!");
    }
}