"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormGarden from "./_component/form/FormGarden";
import Greengrass from "./_component/list/Greengrass";
import Soybean from "./_component/list/Soybean";
import Harvest from "./_component/list/Harvest";
import Granary from "./_component/list/Granary";
import supabase from "@/app/utils/database";
import { CircleUser, MessageSquare } from "lucide-react";
import ActionButton from "@/components/ActionButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const revalidate = 0;

const GardenUI = ({ }) => {
    const [tab, setTab] = useState("Harvest");
    const [user, setUser] = useState(null)

    useEffect(() => {
        const syncUser = async (session) => {
            const user = session?.user ?? null;
            setUser(user);

            if (user?.id) {
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                window.OneSignalDeferred.push(async function (OneSignal) {
                    await OneSignal.login(String(user.id));
                });
                const response = await ky.post('/api/f_user/list/match', { json: { id: user.id } }).json();
                let userInfo = { ...user, ...(response.list[0]) }
                setUser(userInfo);
                console.log("userInfo", userInfo)
                alert(userInfo.planet.id)
            } else {
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                window.OneSignalDeferred.push(async function (OneSignal) {
                    await OneSignal.logout();
                });
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
    }

    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
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
                {user ? (<DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar>
                                <AvatarImage src={user?.user_metadata.avatar_url} alt="img" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32">
                        <DropdownMenuGroup>
                            <DropdownMenuItem>1</DropdownMenuItem>
                            <DropdownMenuItem>2</DropdownMenuItem>
                            <DropdownMenuItem>3</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem variant="destructive" onClick={handleLogout}>注销</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>) : <ActionButton icon={CircleUser} size="sm" onClick={handleLogin} />}
            </div>
            {tab === "Soybean" && <Soybean />}
            {tab === "Greengrass" && <Greengrass />}
            {tab === "Harvest" && <Harvest />}
            {tab === "Granary" && <Granary />}
        </>
    );
}
export default GardenUI;