"use client";

export const revalidate = 0;
import CommonHeader from "../_component/common_header";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { MessageSquarePlus, Orbit } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import ky from "ky";
import { compressImage } from "@/app/utils/file";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import useLongPress from "@/hooks/useLongPress";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

const timeGroups = [
    { name: "凌晨", start: 0, end: 7 },
    { name: "早上", start: 7, end: 11 },
    { name: "午餐", start: 11, end: 14 },
    { name: "下午茶", start: 14, end: 17 },
    { name: "晚餐", start: 17, end: 20 },
    { name: "夜宵", start: 20, end: 24 },
];
const AlbumUI = ({ }) => {

    const inputRef = useRef(null);
    const [userInfo, setUserInfo] = useState(null)
    const [nearestLocation, setNearestLocation] = useState(null);
    const [list, setList] = useState([]);
    const [isPush, setIsPush] = useState(true);

    const [previewItem, setPreviewItem] = useState(null);


    const fetchList = async () => {
        const response = await ky.post('/api/album/list/match', {
            json: {
                planetId: userInfo.planetId
            }
        }).json();
        setList(response.list);
    }

    const longPressHandle = useLongPress({
        getPayload: (e) => {
            return list.find(
                item => item.id === Number(e.currentTarget.dataset.no)
            );
        },
        onLongPress: async (item) => {
            if (!item) return;

            if (!confirm("确定删除这张图片吗？")) return;

            await ky.post("/api/album/delete", {
                json: {
                    id: item.id
                }
            });

            fetchList();
        },
    });

    const groupAlbumByTime = (list = []) => {
        const groups = {};

        for (const item of list) {
            const date = new Date(
                new Date(item.created_at).getTime() + 9 * 60 * 60 * 1000
            );

            const dateKey = date.toISOString().slice(0, 10);
            const hour = date.getUTCHours();

            const timeGroup = timeGroups.find(
                (group) => hour >= group.start && hour < group.end
            );

            if (!timeGroup) continue;

            const key = `${dateKey}-${timeGroup.name}`;

            if (!groups[key]) {
                groups[key] = {
                    date: dateKey,
                    name: timeGroup.name,
                    start: timeGroup.start,
                    end: timeGroup.end,
                    items: [],
                };
            }

            groups[key].items.push(item);
        }

        console.log("groups", groups);
        return Object.values(groups);
    };
    const groups = useMemo(() => groupAlbumByTime(list), [list]);

    const handleChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();

        const compressedFile = await compressImage(file);
        Object.entries({
            file: compressedFile,
            userId: userInfo.id,
            planetId: userInfo.planetId,
            locationId: nearestLocation.id,
            isPush,
        }).forEach(([key, value]) => {
            formData.append(key, value);
        });
        await ky.post('/api/album/upsert/main', {
            body: formData
        }).json();
        fetchList();
    };

    useEffect(() => {
        if (userInfo)
            fetchList();
    }, [userInfo]);


    return (
        <>
            <CommonHeader onComplete={(userInfo, nearestLocation) => {
                setUserInfo(userInfo);
                setNearestLocation(nearestLocation);
                console.log("userInfo", userInfo, "nearestLocation", nearestLocation)
            }}>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleChange}
                />
                <Button variant="outline" className="p-3" onClick={() => inputRef.current?.click()}>
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>新建图片</span>
                </Button>
                <div className="flex items-center gap-1">
                    <Switch
                        checked={isPush}
                        onCheckedChange={setIsPush}
                    />
                    <span className="text-sm">推送</span>
                </div>
            </CommonHeader >
            <main className="container mx-auto px-4">
                {groups.map((group) => (
                    <div
                        key={`${group.date}-${group.name}`}
                        className="mb-3"
                    >
                        <div className="mb-3 text-sm font-medium">
                            <span>{group.date}</span>
                            <span>·</span>
                            <span>{group.name}</span>

                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-normal text-muted-foreground">
                                {group.start}点-{group.end}点
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {group.items.map((item) => (
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg" key={item.id}
                                    data-no={item.id} {...longPressHandle}>
                                    <Image
                                        src={item.pic}
                                        alt={item.name || ""}
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-black/45 px-2 py-1.5">
                                        <img
                                            src={item.f_user?.raw_user_meta_data?.avatar_url || "/default-avatar.png"}
                                            alt=""
                                            className="h-5 w-5 shrink-0 rounded-full object-cover border border-white/50"
                                        />

                                        <span className="truncate text-[11px] text-white">
                                            {item.f_user?.raw_user_meta_data?.name || "未知用户"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </>
    );
}
export default AlbumUI;