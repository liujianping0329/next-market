import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { deleteByPublicUrls } from "@/app/api/file/_lib/delete";

export async function POST(request, context) {
    const requestBody = await request.json();

    const { data } = await supabase.from("album").delete().match(requestBody).select("*").single();

    if (data.pic) {
        deleteByPublicUrls(data.pic);
    }
    return NextResponse.json({ ok: true });
}