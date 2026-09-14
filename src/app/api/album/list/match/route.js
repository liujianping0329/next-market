import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request) {
    const { createdAtFrom, createdAtTo, userId, ...filters } = await request.json();
    const select = userId
        ? "*,album_user(*,f_user(*)),album_user_filter:album_user!inner(user_id),location(*),album_item(count)"
        : "*,album_user(*,f_user(*)),location(*),album_item(count)";

    let query = supabase
        .from("album")
        .select(select)
        .match(filters)
        .order("created_at", { ascending: false });

    if (createdAtFrom) query = query.gte("created_at", createdAtFrom);
    if (createdAtTo) query = query.lt("created_at", createdAtTo);
    if (userId) query = query.eq("album_user_filter.user_id", userId);

    const { data: matchList, error } = await query;
    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const list = (matchList ?? []).map(({
        album_item: albumItemCount,
        album_user_filter: _albumUserFilter,
        ...album
    }) => ({
        ...album,
        hasAlbumItems: Number(albumItemCount?.[0]?.count ?? 0) > 0,
    }));

    return NextResponse.json({ list });
}
