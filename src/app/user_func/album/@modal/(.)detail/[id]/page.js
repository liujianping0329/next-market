"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import AlbumDetail from "@/app/user_func/album/_component/detail/AlbumDetail";

export default function AlbumDetailModal() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const albumIds = (searchParams.get("albumIds") || "")
        .split(",")
        .map(Number)
        .filter(Number.isSafeInteger);

    return <AlbumDetail
        id={params.id}
        onBack={() => router.back()}
        enableAlbumActions
        enableSwipe={albumIds.length > 1}
        albumIds={albumIds}
    />;
}
