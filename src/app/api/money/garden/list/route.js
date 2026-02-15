import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function GET() {
    const { data: allList } = await supabase.from("garden").select()
        .order('date', { ascending: false }).order('created_at', { ascending: false });
    return NextResponse.json({ list: allList });
}