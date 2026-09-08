import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { upload } from "@/app/api/file/_lib/upload";

export async function POST(request, context) {
    const formData = await request.formData();

    const file = formData.get("file");
    const fileUrl = await upload(file, "album");
    const userId = formData.get("userId");
    const planetId = formData.get("planetId");
    const locationId = formData.get("locationId");

    const { data, error } = await supabase.from('album').upsert({ pic: fileUrl, userId, planetId, locationId }).select();
    console.log("upsert album", data, error);
    return NextResponse.json({ id: data[0].id });
}