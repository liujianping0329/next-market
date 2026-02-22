import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function GET() {
    const { data: allList } = await supabase.from("constants").select()
        .order('sort', { ascending: true });
    return NextResponse.json({ list: allList });
}