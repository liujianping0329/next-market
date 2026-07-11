import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const { prompt, needAll, id } = await request.json();

    let query = supabase.from("garden_cate")
        .select("garden(id,title,content,location,pics,garden_ai(ansJSON),garden_ext(refInfo))").eq("id", id).single();

    if (prompt) {
        await supabase.from("constants").update({ value: prompt }).eq("category", "GardenCateExport");
    }
    const { data: gardenList, error } = await query;
    return NextResponse.json({ gardenList: gardenList.garden });
}