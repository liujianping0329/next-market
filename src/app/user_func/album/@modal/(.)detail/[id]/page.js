"use client";

import { useParams, useRouter } from "next/navigation";

import AlbumDetail from "@/app/user_func/album/_component/detail/AlbumDetail";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AlbumDetailModal() {
    const params = useParams();
    const router = useRouter();

    return (
        <Dialog open onOpenChange={(open) => !open && router.back()}>
            <DialogContent
                showCloseButton={false}
                className="h-[100dvh] w-screen max-w-none gap-0 overflow-y-auto rounded-none border-0 p-0 sm:max-w-none"
            >
                <DialogTitle className="sr-only">相册详情</DialogTitle>
                <AlbumDetail id={params.id} onBack={() => router.back()} />
            </DialogContent>
        </Dialog>
    );
}
