import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { deleteByPublicUrls } from "@/app/api/file/_lib/delete";

export async function POST(request, context) {
    console.log("Request received in file upload route");
    const formData = await request.formData();
    const files = formData.getAll("files");
    const urls = [];

    for (const file of files) {
      const fileName = crypto.randomUUID() + "-" + file.name;
      await supabase.storage.from("garden").upload("uploads/" + fileName, file);
      const { data } = supabase.storage.from("garden").getPublicUrl(`uploads/${fileName}`);

      urls.push(data.publicUrl);
    }
    return NextResponse.json(urls);
}

export async function DELETE(request) {
    const { urls = [] } = await request.json();

    if (!Array.isArray(urls) || urls.length === 0) {
        return NextResponse.json({ ok: true });
    }

    await deleteByPublicUrls(urls);

    return NextResponse.json({ ok: true });
}
