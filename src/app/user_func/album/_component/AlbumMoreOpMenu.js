"use client";

import ky from "ky";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";

const AlbumMoreOpMenu = ({ open, onOpenChange, target, userInfo, onSuccess }) => {
    const [isJoining, setIsJoining] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isJoined = target?.album_user?.some((albumUser) => albumUser.user_id === userInfo?.id);
    const isLastUser = isJoined && target?.album_user?.length === 1;

    const handleJoin = async () => {
        if (!target || !userInfo || isJoining) return;

        setIsJoining(true);

        try {
            if (isJoined) {
                await ky.delete("/api/album/user", {
                    json: { albumId: target.id, userId: userInfo.id },
                }).json();
            } else {
                await ky.post("/api/album/user", {
                    json: { albumId: target.id, userId: userInfo.id },
                }).json();
            }
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error(isJoined ? "退出照片失败" : "加入照片失败");
        } finally {
            setIsJoining(false);
        }
    };

    const handleDelete = async () => {
        if (!target || isDeleting) return;
        if (!window.confirm("确定删除这张图片吗？")) return;

        setIsDeleting(true);

        try {
            await ky.post("/api/album/delete", {
                json: { id: target.id },
            });
            onSuccess();
            onOpenChange(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="px-4 pb-4">
                <DrawerHeader>
                    <DrawerTitle className="text-xl">更多操作</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col divide-y">
                    {!isLastUser && (
                        <Button
                            variant="ghost"
                            className="h-14 justify-center text-lg"
                            onClick={handleJoin}
                            disabled={isJoining}
                        >
                            {isJoining && <Spinner />}
                            {isJoined ? "我没吃" : "我也吃"}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        className="h-14 justify-center text-lg text-destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Spinner />}
                        删除
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default AlbumMoreOpMenu;
