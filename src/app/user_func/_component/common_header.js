"use client";


import { Button } from "@/components/ui/button";
import {
    useEffect,
    useState,
} from "react";
import { useForm } from "react-hook-form";

import supabase from "@/app/utils/database";
import { useUserStore } from "@/app/money/garden/_store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquarePlus, Orbit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ky from "ky";
import { Local, Helpcenter } from "@icon-park/react";
import { Spinner } from "@/components/ui/spinner";
import { useLocationStore } from "@/app/money/garden/_store/locationStore";

const Header = ({ children }) => {

    const userInfoStore = useUserStore(state => state.userInfo);
    const locationInfoStore = useLocationStore(state => state.locationInfo);

    const [userInfo, setUserInfo] = useState(userInfoStore)
    const [nearestLocation, setNearestLocation] = useState(locationInfoStore);
    const [canGetLocation, setCanGetLocation] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isUserReady, setIsUserReady] = useState(false)

    useEffect(() => {
        const getUser = async (session) => {
            const response = await ky.post('/api/f_user/list/match', { json: { id: session.user.id } }).json();
            let userInfo = { ...session.user, ...(response.list[0]) }
            setUserInfo({ ...userInfo, fromSession: true });
            setIsUserReady(true);
        };

        if (!userInfoStore?.id) {
            supabase.auth.getSession().then(({ data }) => {
                getUser(data.session);
            });
        } else {
            setIsUserReady(true);
        }
    }, [])

    const getLocation = async () => {
        if (nearestLocation) return;
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = Number(position.coords.latitude.toFixed(8));
                const longitude = Number(position.coords.longitude.toFixed(8));

                const response = await ky.post('/api/location/getCur', { json: { lat: latitude, lng: longitude, planetId: userInfo?.planetId } }).json();
                setNearestLocation(response.nearestLocation);
                setIsGettingLocation(false);
            },
            (error) => {
                setCanGetLocation(false);
                setIsGettingLocation(false);
                console.error("获取地理位置失败:", error.message);
            }
        );
    }

    useEffect(() => {
        if (!isUserReady) return;

        getLocation();
    }, [isUserReady]);

    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
                    {!userInfo?.fromSession && <Button variant="outline" className="p-3">
                        <Link href={`/money/garden`} className="flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            <span>返回</span>
                        </Link>
                    </Button>}
                    {children}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <div className="flex justify-end">
                        <p
                            className={`flex items-center gap-1 text-sm whitespace-nowrap ${nearestLocation?.status === 2 ? "text-red-500" : ""
                                }`}
                        >
                            {nearestLocation?.status === 2 ? (
                                <Helpcenter size={20} className="shrink-0 text-red-500" />
                            ) : (
                                <Local size={20} className="shrink-0" />
                            )}

                            {isGettingLocation ? (
                                <span className="inline-flex items-center gap-1">
                                    <Spinner className="h-4 w-4" />
                                </span>
                            ) : (
                                <span className="truncate max-w-[80px]">
                                    {nearestLocation?.name || "未知"}
                                </span>
                            )}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={userInfo?.user_metadata.avatar_url} alt="img" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </Button>
                </div>
            </div>
        </>
    );
}

export default Header;