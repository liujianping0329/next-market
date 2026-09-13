"use client";

import { useParams, useSearchParams } from "next/navigation";

import AlbumDetail from "@/app/user_func/album/_component/detail/AlbumDetail";

export default function AlbumDetailModal() {
    const params = useParams();
    const searchParams = useSearchParams();
    const albumIds = (searchParams.get("albumIds") || "")
        .split(",")
        .map(Number)
        .filter(Number.isSafeInteger);

    return <AlbumDetail
        id={params.id}
        enableAlbumActions
        enableSwipe={albumIds.length > 1}
        albumIds={albumIds}
    />;
}
