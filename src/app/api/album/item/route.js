import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

export async function POST(request) {
    const { albumId, name, estimatedAmount } = await request.json();
    const normalizedAlbumId = Number(albumId);
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedAmount = typeof estimatedAmount === "string"
        ? estimatedAmount.trim()
        : "";

    if (
        !Number.isSafeInteger(normalizedAlbumId)
        || normalizedAlbumId <= 0
        || !normalizedName
        || normalizedName.length > 100
        || !normalizedAmount
        || normalizedAmount.length > 100
    ) {
        return NextResponse.json({ message: "请输入正确的成分名称和分量" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("album_item")
        .insert({
            album_id: normalizedAlbumId,
            name: normalizedName,
            alternative_names: [],
            estimated_amount: normalizedAmount,
            center_x_percent: null,
            center_y_percent: null,
        })
        .select("id,name,alternative_names,estimated_amount,center_x_percent,center_y_percent")
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
}

export async function PATCH(request) {
    const { albumId, itemId, name } = await request.json();
    const normalizedAlbumId = Number(albumId);
    const normalizedItemId = Number(itemId);
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (
        !Number.isSafeInteger(normalizedAlbumId)
        || normalizedAlbumId <= 0
        || !Number.isSafeInteger(normalizedItemId)
        || normalizedItemId <= 0
        || !normalizedName
        || normalizedName.length > 100
    ) {
        return NextResponse.json({ message: "成分信息不正确" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("album_item")
        .update({
            name: normalizedName,
            alternative_names: [],
        })
        .eq("id", normalizedItemId)
        .eq("album_id", normalizedAlbumId)
        .select("id,name,alternative_names")
        .single();

    if (error) {
        return NextResponse.json(
            { message: error.message },
            { status: error.code === "PGRST116" ? 404 : 500 },
        );
    }

    return NextResponse.json({ item: data });
}

export async function DELETE(request) {
    const { albumId, itemId } = await request.json();
    const normalizedAlbumId = Number(albumId);
    const normalizedItemId = Number(itemId);

    if (
        !Number.isSafeInteger(normalizedAlbumId)
        || normalizedAlbumId <= 0
        || !Number.isSafeInteger(normalizedItemId)
        || normalizedItemId <= 0
    ) {
        return NextResponse.json({ message: "成分信息不正确" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("album_item")
        .delete()
        .eq("id", normalizedItemId)
        .eq("album_id", normalizedAlbumId)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json(
            { message: error.message },
            { status: error.code === "PGRST116" ? 404 : 500 },
        );
    }

    return NextResponse.json({ id: data.id });
}
