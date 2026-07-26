import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    const gardenId = requestBody.id;
    await supabase.from("garden_remark").delete().eq("gardenId", gardenId);
    await supabase.from("garden_ai").delete().eq("gardenId", gardenId);
    await supabase.from("garden_ext").delete().eq("gardenId", gardenId);
    const { data, error } = await supabase.from("garden").delete().match(requestBody).select("id");
    console.log(error);

    return NextResponse.json({ ids: data.map(item => item.id) });
}