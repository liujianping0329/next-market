import { NextResponse } from "next/server";
import supabase from "../../../../utils/database";

export async function PUT(request, context) {
    const para = await context.params;
    const requestBody = await request.json();

    await supabase.from("items").update(requestBody).eq("id", para.id)
    return NextResponse.json({ message: "Item update route is working!" });
}