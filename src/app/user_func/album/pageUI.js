"use client";

export const revalidate = 0;
import CommonHeader from "../_component/common_header";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { MessageSquarePlus, Orbit } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import ky from "ky";
import { compressImage } from "@/app/utils/file";

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


    const fetchList = async () => {
        const response = await ky.post('/api/album/list/match', {
            json: {
                planetId: userInfo.planetId
            }
        }).json();
        setList(response.list);
    }

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
            locationId: nearestLocation.id
        }).forEach(([key, value]) => {
            formData.append(key, value);
        });
        await ky.post('/api/album/upsert/main', {
            body: formData
        }).json();
        console.log("照片:", file);
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
            </CommonHeader >
            <main className="container mx-auto px-4">
                {groups.map((group) => (
                    <div
                        key={`${group.date}-${group.name}`}
                        className="mb-6"
                    >
                        <div className="mb-2 text-sm font-medium">
                            {group.date} · {group.name}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {group.items.map((item) => (
                                <img
                                    key={item.id}
                                    src={item.pic}
                                    className="aspect-[3/4] w-full rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </>
    );
}
export default AlbumUI;