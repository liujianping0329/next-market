import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

export async function POST(request) {
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ message: "缺少相册 ID" }, { status: 400 });
    }

    const [albumResult, itemsResult] = await Promise.all([
        supabase
            .from("album")
            .select("id,pic,title,detail,created_at")
            .eq("id", id)
            .single(),
        supabase
            .from("album_item")
            .select("id,name,alternative_names,estimated_amount,center_x_percent,center_y_percent")
            .eq("album_id", id)
            .order("id", { ascending: true }),
    ]);

    if (albumResult.error) {
        return NextResponse.json(
            { message: albumResult.error.message },
            { status: albumResult.error.code === "PGRST116" ? 404 : 500 },
        );
    }

    if (itemsResult.error) {
        return NextResponse.json(
            { message: itemsResult.error.message },
            { status: 500 },
        );
    }

    return NextResponse.json({
        detail: {
            ...albumResult.data,
            albumItems: itemsResult.data ?? [],
        },
    });
}
