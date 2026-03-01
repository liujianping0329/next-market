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
} from "@/components/ui/dropdown-menu"

export const revalidate = 0;

const GardenUI = () => {
    const [tab, setTab] = useState("Greengrass");

    const [user, setUser] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
        })

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => listener.subscription.unsubscribe()
    }, [])


    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.href
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
                    <ToggleGroup type="single" defaultValue="Greengrass" variant="outline"
                        onValueChange={(v) => {
                            if (v) setTab(v);
                        }}>
                        <ToggleGroupItem value="Soybean" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">春盛园</ToggleGroupItem>
                        <ToggleGroupItem value="Greengrass" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">夏荣园</ToggleGroupItem>
                        <ToggleGroupItem value="Harvest" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">秋实园</ToggleGroupItem>
                        <ToggleGroupItem value="Granary" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">冬藏园</ToggleGroupItem>
                    </ToggleGroup>

                </div>
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