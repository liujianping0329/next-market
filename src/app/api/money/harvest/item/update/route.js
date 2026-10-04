import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request) {
    const { id, text, link, status } = await request.json();
    const changes = {};
    if (text !== undefined) changes.text = text;
    if (link !== undefined) changes.link = link;
    if (status !== undefined) changes.status = status;

    const { error } = await supabase.from("harvest_item").update(changes).eq("id", id);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
