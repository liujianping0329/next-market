"use client";

export const revalidate = 0;
import CommonHeader from "../_component/common_header";

import { Button } from "@/components/ui/button";

import { MessageSquarePlus } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ky from "ky";
import { compressImage } from "@/app/utils/file";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import useLongPress from "@/hooks/useLongPress";
import { useAlbumListRefresh } from "./_component/AlbumListRefreshContext";
import AlbumMoreOpMenu from "./_component/AlbumMoreOpMenu";
import AlbumDailyAction from "./_component/AlbumDailyAction";

const timeGroups = [
    { name: "凌晨", start: 0, end: 7 },
    { name: "早上", start: 7, end: 11 },
    { name: "午餐", start: 11, end: 14 },
    { name: "下午茶", start: 14, end: 17 },
    { name: "晚餐", start: 17, end: 20 },
    { name: "夜宵", start: 20, end: 24 },
];
const tabs = [
    { value: "all", label: "动态" },
    { value: "yesterday", label: "我某一天..." },
];

const getDateRange = (date) => {
    const targetDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const nextDate = new Date(`${targetDate}T00:00:00+09:00`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    return {
        createdAtFrom: new Date(`${targetDate}T00:00:00+09:00`).toISOString(),
        createdAtTo: nextDate.toISOString(),
    };
};

const getRecentDateRange = () => {
    const tokyoToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const startDate = new Date(`${tokyoToday}T00:00:00+09:00`);
    startDate.setUTCDate(startDate.getUTCDate() - 2);
    const endDate = new Date(`${tokyoToday}T00:00:00+09:00`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    return {
        createdAtFrom: startDate.toISOString(),
        createdAtTo: endDate.toISOString(),
    };
};

const getYesterdayLabel = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};

const AlbumUI = ({ }) => {

    const inputRef = useRef(null);
    const suppressDetailOpenRef = useRef(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshKey } = useAlbumListRefresh();
    const [userInfo, setUserInfo] = useState(null)
    const [nearestLocation, setNearestLocation] = useState(null);
    const [list, setList] = useState([]);
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [loadedTab, setLoadedTab] = useState(null);
    const [isPush, setIsPush] = useState(true);
    const [yesterdayCount, setYesterdayCount] = useState(null);
    const [selectedDate, setSelectedDate] = useState(() => getYesterdayLabel());
    const [moreOpMenuOpen, setMoreOpMenuOpen] = useState(false);
    const [moreOpMenuTarget, setMoreOpMenuTarget] = useState(null);
    const tabParam = searchParams.get("tab");
    const activeTab = tabs.some((tab) => tab.value === tabParam) ? tabParam : "all";

    const fetchList = async () => {
        const requestBody = { planetId: userInfo.planetId };

        if (activeTab !== "all") {
            requestBody.userId = userInfo.id;
        }
        if (activeTab === "all") {
            Object.assign(requestBody, getRecentDateRange());
        } else if (activeTab === "yesterday") {
            Object.assign(requestBody, getDateRange(selectedDate));
        }

        const response = await ky.post('/api/album/list/match', {
            json: requestBody,
        }).json();
        setList(response.list);
        setIsListLoaded(true);
        setLoadedTab(activeTab);
    };

    const fetchYesterdayCount = async () => {
        const response = await ky.post('/api/album/list/match', {
            json: {
                planetId: userInfo.planetId,
                userId: userInfo.id,
                ...getDateRange(selectedDate),
            },
        }).json();
        setYesterdayCount(response.list.length);
    };

    const handleMoreOpSuccess = () => {
        fetchList();
        fetchYesterdayCount();
    };

    const handleTabChange = (tab) => {
        const params = new URLSearchParams(searchParams.toString());

        if (tab === "all") params.delete("tab");
        else params.set("tab", tab);

        const query = params.toString();
        router.replace(query ? `/user_func/album?${query}` : "/user_func/album");
    };

    const longPressHandle = useLongPress({
        getPayload: (e) => {
            return list.find(
                item => item.id === Number(e.currentTarget.dataset.no)
            );
        },
        onLongPress: (item) => {
            if (!item) return;

            suppressDetailOpenRef.current = true;
            setMoreOpMenuTarget(item);
            setMoreOpMenuOpen(true);
        },
    });

    const openDetail = (id) => {
        const albumIds = list.map((item) => item.id).join(",");
        router.push(`/user_func/album/detail/${id}?albumIds=${albumIds}`);
    };

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
        if (!userInfo) return;

        fetchList().then(fetchYesterdayCount);

    }, [userInfo, activeTab, selectedDate, refreshKey]);


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
                {isListLoaded && <div className="mb-1 flex gap-2 overflow-x-auto pb-1 pt-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleTabChange(tab.value)}
                            aria-pressed={activeTab === tab.value}
                            className={`relative shrink-0 rounded-sm border px-2.5 py-1 text-xs font-medium transition ${activeTab === tab.value
                                ? "border-sky-600 bg-sky-600 text-white"
                                : "border-sky-100 bg-white text-sky-700 hover:bg-sky-50"
                                }`}
                        >
                            {tab.label}
                            {tab.value === "yesterday" && yesterdayCount != null && (
                                <span className="absolute right--1 top-0 size-4 -translate-y-1/2 rounded-full bg-rose-500 text-center text-[10px] font-semibold leading-4 text-white">
                                    {yesterdayCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>}
                {isListLoaded && loadedTab === activeTab && activeTab === "yesterday" && (
                    <AlbumDailyAction
                        date={selectedDate}
                        userId={userInfo.id}
                        onDateChange={setSelectedDate}
                        list={list}
                    />
                )}
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
                            {group.items.map((item) => {
                                const albumUsers = item.album_user ?? [];

                                return (
                                    <div className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-lg" key={item.id}
                                        data-no={item.id}
                                        onClick={() => {
                                            if (suppressDetailOpenRef.current) {
                                                suppressDetailOpenRef.current = false;
                                                return;
                                            }
                                            openDetail(item.id);
                                        }}
                                        {...longPressHandle}>
                                        <Image
                                            src={item.pic}
                                            alt={item.name || ""}
                                            fill
                                            className="rounded-lg object-cover"
                                        />
                                        {!item.hasAlbumItems && (
                                            <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm">
                                                待分析
                                            </span>
                                        )}
                                        {item.hasAlbumItems && (
                                            <span className={`absolute right-1.5 top-1.5 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm ${item.status === 2 ? "bg-emerald-500/90" : "bg-sky-500/90"
                                                }`}>
                                                {item.status === 2 ? "已校对" : "待校对"}
                                            </span>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-black/45 px-2 py-1.5">
                                            <div className="flex -space-x-1.5">
                                                {albumUsers.map((albumUser) => (
                                                    <img
                                                        key={albumUser.user_id}
                                                        src={albumUser.f_user?.raw_user_meta_data?.avatar_url || "/default-avatar.png"}
                                                        alt=""
                                                        className="h-5 w-5 shrink-0 rounded-full border border-white/50 object-cover"
                                                    />
                                                ))}
                                            </div>

                                            <span className="truncate text-[11px] text-white">
                                                {albumUsers.length === 1
                                                    ? albumUsers[0].f_user?.raw_user_meta_data?.name || "未知用户"
                                                    : albumUsers.length > 1
                                                        ? `等 ${albumUsers.length} 人`
                                                        : "未知用户"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>
            <AlbumMoreOpMenu
                open={moreOpMenuOpen}
                onOpenChange={setMoreOpMenuOpen}
                target={moreOpMenuTarget}
                userInfo={userInfo}
                onSuccess={handleMoreOpSuccess}
            />
        </>
    );
}
export default AlbumUI;
