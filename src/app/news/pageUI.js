"use client";
import supabase from "@/app/utils/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ky from "ky";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import FormNews from "./_component/form/FormNews";

export const revalidate = 0;

const NewsUI = ({ }) => {
    const [userInfo, setUserInfo] = useState(null)
    const [list, setList] = useState([])

    const fetchData = async () => {
        console.log(userInfo)
        const response = await ky.post('/api/news/list/match', {
            json: {
                ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id })
            }
        }).json();
        setList(response.list);
    }

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
        if (!userInfo) return
        fetchData();
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
                    <FormNews trigger={
                        <Button variant="outline" className="p-3">
                            <MessageSquarePlus className="h-4 w-4" />
                            <span>新建议题</span>
                        </Button>
                    } onSuccess={() => fetchData()} />
                </div>

                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={userInfo?.user_metadata.avatar_url} alt="img" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
            {list.map((n, i) => {

                return (
                    <div key={n.id}>
                        {n.title}<br />
                        {n.answer}
                        <hr />
                    </div>
                );
            })}
        </>
    );
}
export default NewsUI;