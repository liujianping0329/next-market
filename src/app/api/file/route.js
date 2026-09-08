import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { deleteByPublicUrls } from "@/app/api/file/_lib/delete";
import { upload } from "@/app/api/file/_lib/upload";

export async function POST(request, context) {
    console.log("Request received in file upload route");
    const formData = await request.formData();
    const files = formData.getAll("files");
    return NextResponse.json(await upload(files));
}

export async function DELETE(request) {
    const { urls = [] } = await request.json();

    if (!Array.isArray(urls) || urls.length === 0) {
        return NextResponse.json({ ok: true });
    }

    await deleteByPublicUrls(urls);

    return NextResponse.json({ ok: true });
}
