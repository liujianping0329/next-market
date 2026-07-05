"use client";
import { Button } from "@/components/ui/button";


import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    useEffect,
    useState,
} from "react";
import supabase from "@/app/utils/database";
import {
    CircleUser,
    ShieldCheck,
    Satellite,
    PenTool,
    User,
    MapPin
} from "lucide-react";
import ActionButton from "@/components/ActionButton";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/app/money/garden/_store/userStore";
import ky from "ky";
import VoiceRecordDialog from "@/components/VoiceRecordDialog";
import { Spinner } from "@/components/ui/spinner";

export const revalidate = 0;

const Soybean = dynamic(() => import("./_component/list/Soybean"), {
    ssr: false,
});
const Greengrass = dynamic(() => import("./_component/list/Greengrass"), {
    ssr: false,
});
const Harvest = dynamic(() => import("./_component/list/Harvest"), {
    ssr: false,
});
const Granary = dynamic(() => import("./_component/list/Granary"), {
    ssr: false,
});

const GardenUI = ({ }) => {
    const [tab, setTab] = useState("Granary");
    const [user, setUser] = useState(null)
    const [isUserReady, setIsUserReady] = useState(false)
    const setUserInfoStore = useUserStore(state => state.setUserInfo);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [nearestLocation, setNearestLocation] = useState(null);
    const [canGetLocation, setCanGetLocation] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const getLocation = async () => {
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = Number(position.coords.latitude.toFixed(8));
                const longitude = Number(position.coords.longitude.toFixed(8));

                const response = await ky.post('/api/location/getCur', { json: { lat: latitude, lng: longitude } }).json();
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
        const syncUser = async (session) => {
            const user = session?.user ?? null;
            if (user?.id) {
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                window.OneSignalDeferred.push(async function (OneSignal) {
                    await OneSignal.login(String(user.id));
                });
                const response = await ky.post('/api/f_user/list/match', { json: { id: user.id } }).json();
                let userInfo = { ...user, ...(response.list[0]) }
                setUser(userInfo);
                setUserInfoStore(userInfo);
                console.log("userInfo", userInfo)
                setIsUserReady(true)
            } else {
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                window.OneSignalDeferred.push(async function (OneSignal) {
                    await OneSignal.logout();
                });
                setIsUserReady(true)
            }
        };

        supabase.auth.getSession().then(({ data }) => {
            syncUser(data.session);
        });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUser(session);
        });
        getLocation();

        return () => subscription.unsubscribe();
    }, [])

    // useEffect(() => {
    //     const tabFromUrl = searchParams.get("tab");
    //     if (tabFromUrl) setTab(tabFromUrl);
    // }, [searchParams]);


    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/api/auth/callback?next=/money/garden`
            }
        })
    }

    const handleLogout = async () => {
        if (!confirm("确定退出？")) return;
        await supabase.auth.signOut()

        window.location.reload()
    }

    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-1 items-center">
                    <Button variant="outline" asChild className="hidden">
                        <Link href={`/money/list`}>
                            返回
                        </Link>
                    </Button>
                    <ToggleGroup type="single" defaultValue={tab} variant="outline"
                        onValueChange={(v) => {
                            if (v) setTab(v);
                        }}>
                        <ToggleGroupItem value="Soybean" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">春盛园</ToggleGroupItem>
                        <ToggleGroupItem value="Greengrass" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">夏荣园</ToggleGroupItem>
                        <ToggleGroupItem value="Harvest" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">秋实园</ToggleGroupItem>
                        <ToggleGroupItem value="Granary" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">冬藏园</ToggleGroupItem>
                    </ToggleGroup>

                </div>
                {/* <button
                    onClick={async () => {
                        window.OneSignalDeferred = window.OneSignalDeferred || [];
                        window.OneSignalDeferred.push(async function (OneSignal) {
                            await OneSignal.Notifications.requestPermission();
                        });
                    }}
                >
                    开启提醒
                </button> */}

                {/* <Button variant="outline" size="sm" onClick={() => setIsVoiceOpen(true)}>
                    <Mic className="h-4 w-4" />语音
                </Button> */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex justify-end">
                        <p className="flex items-center gap-1 text-sm whitespace-nowrap">
                            <MapPin className="h-4 w-4 shrink-0" />

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
                    {user ? (<DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full w-6 h-6">
                                <Avatar>
                                    <AvatarImage src={user?.user_metadata.avatar_url} alt="img" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Link href="/news" className="flex items-center gap-2">
                                        <PenTool className="h-4 w-4" />
                                        <span>妙笔生花</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Link href="/mng/admin" className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>执枢司要</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/mng/leader" className="flex items-center gap-2">
                                        <Satellite className="h-4 w-4" />
                                        <span>分星主事</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/mng/user" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>安身立簿</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem variant="destructive" onClick={handleLogout}>注销</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>) : <ActionButton icon={CircleUser} size="icon" onClick={handleLogin} />}
                </div >
            </div>
            {tab === "Soybean" && <Soybean userInfo={user} isUserReady={isUserReady} />}
            {tab === "Greengrass" && <Greengrass userInfo={user} isUserReady={isUserReady} />}
            {tab === "Harvest" && <Harvest userInfo={user} isUserReady={isUserReady} />}
            {tab === "Granary" && <Granary userInfo={user} isUserReady={isUserReady} />}
            {isVoiceOpen && (
                <VoiceRecordDialog
                    onClose={() => setIsVoiceOpen(false)}
                />
            )}
        </>
    );
}
export default GardenUI;
