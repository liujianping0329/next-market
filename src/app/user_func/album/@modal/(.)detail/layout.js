"use client";

import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AlbumDetailModalLayout({ children }) {
    const router = useRouter();

    return (
        <Dialog open onOpenChange={(open) => !open && router.back()}>
            <DialogContent
                showCloseButton={false}
                className="h-[100dvh] w-screen max-w-none gap-0 overflow-y-auto rounded-none border-0 p-0 sm:max-w-none"
            >
                <DialogTitle className="sr-only">相册详情</DialogTitle>
                {children}
            </DialogContent>
        </Dialog>
    );
}
