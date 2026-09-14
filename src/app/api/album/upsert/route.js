import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const albumData = await request.json();
    const { data, error } = await supabase.from('album').upsert(albumData).select();
    return NextResponse.json({ id: data[0].id });
}
