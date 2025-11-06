import { NextResponse } from "next/server";
import supabase from "../../../../utils/database";

export async function DELETE(request, context) {
    const para = await context.params;

    await supabase.from("items").delete().eq("id", para.id);
    return NextResponse.json({ message: "Item delete route is working!" });
}