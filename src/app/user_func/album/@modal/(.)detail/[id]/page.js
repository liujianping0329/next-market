"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import AlbumDetail from "@/app/user_func/album/_component/detail/AlbumDetail";
import { useAlbumListRefresh } from "@/app/user_func/album/_component/AlbumListRefreshContext";

export default function AlbumDetailModal() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshList } = useAlbumListRefresh();
    const albumIds = (searchParams.get("albumIds") || "")
        .split(",")
        .map(Number)
        .filter(Number.isSafeInteger);

    return <AlbumDetail
        id={params.id}
        onBack={() => router.back()}
        onStatusChange={refreshList}
        enableAlbumActions
        enableSwipe={albumIds.length > 1}
        albumIds={albumIds}
    />;
}
