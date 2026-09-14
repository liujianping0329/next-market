import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

export async function POST(request) {
    const { albumId, userId } = await request.json();

    if (!albumId || !userId) {
        return NextResponse.json({ message: "相册或用户信息不正确" }, { status: 400 });
    }

    const { error } = await supabase
        .from("album_user")
        .insert({ album_id: albumId, user_id: userId, role: "participant" });

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request) {
    const { albumId, userId } = await request.json();

    if (!albumId || !userId) {
        return NextResponse.json({ message: "相册或用户信息不正确" }, { status: 400 });
    }

    const { error } = await supabase
        .from("album_user")
        .delete()
        .eq("album_id", albumId)
        .eq("user_id", userId);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
