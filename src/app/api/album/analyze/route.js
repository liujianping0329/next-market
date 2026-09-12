import ky from "ky";
import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

const MIME_BY_EXTENSION = {
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

const resolveMimeType = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl, { method: "HEAD" });
        const contentType = response.headers.get("content-type")?.split(";")[0];
        if (response.ok && contentType?.startsWith("image/")) return contentType;
    } catch {
        // Fall back to the file extension below.
    }

    const extension = new URL(imageUrl).pathname
        .split(".")
        .pop()
        ?.toLowerCase();

    return MIME_BY_EXTENSION[extension] || "image/jpeg";
};

export async function POST(request) {
    const { id } = await request.json();
    const albumId = Number(id);

    if (!Number.isSafeInteger(albumId) || albumId <= 0) {
        return NextResponse.json({ message: "缺少有效的相册 ID" }, { status: 400 });
    }

    const { data: album, error: albumError } = await supabase
        .from("album")
        .select("id,pic,userId,planetId")
        .eq("id", albumId)
        .single();

    if (albumError || !album?.pic) {
        return NextResponse.json(
            { message: albumError?.message || "相册图片不存在" },
            { status: albumError?.code === "PGRST116" ? 404 : 500 },
        );
    }

    const { count, error: itemError } = await supabase
        .from("album_item")
        .select("id", { count: "exact", head: true })
        .eq("album_id", albumId);

    if (itemError) {
        return NextResponse.json({ message: itemError.message }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
        return NextResponse.json({ message: "这张图片已经完成分析" }, { status: 409 });
    }

    const mimeType = await resolveMimeType(album.pic);

    try {
        await ky.post(`${process.env.SPRING_AI_URL}/api/ai/album/analyze`, {
            json: {
                albumId: album.id,
                imageUrl: album.pic,
                mimeType,
                isPush: false,
                planetId: album.planetId,
                userId: album.userId,
            },
            timeout: 300_000,
            retry: 0,
        });
    } catch (requestError) {
        const message = requestError.response
            ? await requestError.response.clone().text()
            : requestError.message;

        console.error("重新提交相册 AI 分析失败", albumId, message);
        return NextResponse.json(
            { message: message || "AI 分析提交失败" },
            { status: 502 },
        );
    }

    return NextResponse.json({ accepted: true }, { status: 202 });
}
