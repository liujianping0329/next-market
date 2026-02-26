import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function GET() {
    const { data: allList } = await supabase.from("harvest").select().order('date', { ascending: false });
    return NextResponse.json({ list: allList });
}