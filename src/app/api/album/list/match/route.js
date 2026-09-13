import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request) {
    const { createdAtFrom, createdAtTo, ...filters } = await request.json();

    let query = supabase
        .from("album")
        .select("*,f_user(*),location(*),album_item(count)")
        .match(filters)
        .order("created_at", { ascending: false });

    if (createdAtFrom) query = query.gte("created_at", createdAtFrom);
    if (createdAtTo) query = query.lt("created_at", createdAtTo);

    const { data: matchList, error } = await query;
    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const list = (matchList ?? []).map(({ album_item: albumItemCount, ...album }) => ({
        ...album,
        hasAlbumItems: Number(albumItemCount?.[0]?.count ?? 0) > 0,
    }));

    return NextResponse.json({ list });
}
