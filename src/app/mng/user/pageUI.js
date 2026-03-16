"use client";
import supabase from "@/app/utils/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import GranaryItems from "../_component/list/GranaryItems";

const configs = [{
    name: "冬藏园", value: "granary", isDefault: true, children:
        [
            {
                name: "入账项目", value: "granaryItems"
            }
        ]
}];
const MngUserUI = ({ }) => {
    const [userInfo, setUserInfo] = useState(null)
    const [configsSel, setConfigsSel] = useState(configs?.find((item) => item.isDefault)?.value)
    const [configsChildSel, setConfigsChildSel] = useState("")

    useEffect(() => {
        const getUser = async (session) => {
            const response = await ky.post('/api/f_user/list/match', { json: { id: session.user.id } }).json();
            let userInfo = { ...session.user, ...(response.list[0]) }
            setUserInfo(userInfo);
            console.log("userInfo", userInfo)
        };

        supabase.auth.getSession().then(({ data }) => {
            getUser(data.session);
        });
    }, [])

    useEffect(() => {
        const currentConfig = configs.find((item) => item.value === configsSel);
        setConfigsChildSel(currentConfig?.children?.[0]?.value || "");
    }, [configsSel]);

    useEffect(() => {
        if (!userInfo) return
        // fetchData();
    }, [userInfo?.id])

    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
                    <Button variant="outline" className="p-3">
                        <Link href={`/money/garden`} className="flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            <span>返回</span>
                        </Link>
                    </Button>
                </div>
                安身立簿
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={userInfo?.user_metadata.avatar_url} alt="img" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 p-2">
                {configs.map((item) => (
                    <Button key={item.value} size="sm" variant="outline"
                        className={
                            configsSel === item.value
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                                : "bg-white text-black border-gray-200 hover:bg-gray-50"
                        }
                        onClick={() => {
                            setConfigsSel(item.value);
                            setConfigsChildSel(item.children?.[0]?.value || "");
                        }}
                    >
                        {item.name}
                    </Button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 p-2 bg-sky-100">
                {configs.find((item) => item.value === configsSel)?.children?.map((child) => (
                    <Button key={child.value}
                        size="xs"
                        variant="outline"
                        className={
                            configsChildSel === child.value
                                ? "bg-sky-400 text-white border-sky-300 hover:bg-blue-700 hover:text-white"
                                : "bg-white text-black border-gray-200 hover:bg-gray-50"
                        }
                        onClick={() => setConfigsChildSel(child.value)}
                    >
                        {child.name}
                    </Button>
                ))}
            </div>
            {configsChildSel === "granaryItems" && userInfo && <GranaryItems userInfo={userInfo} />}
        </>
    );
}
export default MngUserUI;