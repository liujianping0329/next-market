"use client";
import supabase from "@/app/utils/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { ArrowLeft, MessageSquarePlus, Pencil, Trash2, Orbit, Link as LinkIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import FormNews from "./_component/form/FormNews";
import ActionButton from "@/components/ActionButton";
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner";

export const revalidate = 0;

const NewsUI = ({ }) => {
    const [userInfo, setUserInfo] = useState(null)
    const [list, setList] = useState([])
    const [deleting, setDeleting] = useState(false)

    const [openUpdate, setOpenUpdate] = useState(false)
    const [isPlanetView, setIsPlanetView] = useState(false)
    const [updateTarget, setUpdateTarget] = useState(null)
    const [formVersion, setFormVersion] = useState(0);


    const fetchData = useCallback(async () => {
        console.log(userInfo)
        const response = await ky.post('/api/news/list/match', {
            json: {
                ...((userInfo?.planet && isPlanetView) ? { planetId: userInfo.planet.id } : { userId: userInfo?.id })
            }
        }).json();
        setList(response.list);
    }, [userInfo, isPlanetView]);

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
    }, [userInfo?.id, isPlanetView])

    const updateHandle = async (item) => {
        setUpdateTarget(item);
        setFormVersion((v) => v + 1)
        setOpenUpdate(true);
    }

    const deleteHandle = async (item) => {
        if (!confirm("确认删除？")) return
        setDeleting(true)
        await ky.post('/api/news/delete', {
            json: {
                id: item.id
            }
        }).json();
        fetchData();
        setDeleting(false)
    }

    useEffect(() => {
        if (!list.some((item) => item.status === "updating")) return;

        const timer = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(timer);
    }, [list, fetchData]);
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
                    {userInfo?.planet && (
                        <Button variant="outline" className={cn("p-3", isPlanetView && "text-white bg-gradient-to-r from-indigo-600 to-sky-500")}
                            onClick={() => {
                                setIsPlanetView((prev) => !prev);
                            }}>
                            <Orbit className="h-4 w-4" />
                            <span>星海回响</span>
                        </Button>
                    )}
                </div>

                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={userInfo?.user_metadata.avatar_url} alt="img" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
            <div className="space-y-3 p-3">
                {list.map((item) => {
                    const props = item.ansProp;
                    return (
                        <div key={item.id} className="rounded-2xl border bg-white p-4"
                            style={{ backgroundColor: `${props?.bgColor}80` }} >
                            <div className="flex-col">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-base font-semibold text-gray-900">
                                            {props?.emoji && (
                                                <>
                                                    {props.emoji}
                                                </>
                                            )} {item.title}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            更新于 {
                                                new Date(new Date(item.updated_at).getTime() + 9 * 60 * 60 * 1000).toLocaleString("ja-JP", {
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                })
                                            }
                                        </div>
                                    </div>
                                    {!isPlanetView && (<div className="flex gap-2 items-center">
                                        {item.status === "updating" && <Spinner className="" />}
                                        {item.url && (<Link href={`${item.url}`} target="_blank" className="flex items-center gap-1">
                                            <ActionButton icon={LinkIcon} />
                                        </Link>)}
                                        <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                                        <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} disabled={deleting} />
                                    </div>)}
                                </div>

                                <div className={`mt-2 text-sm leading-6 text-gray-600 transition-all duration-200`} >
                                    {item.answer}
                                </div>

                                {item.detailHtml && (
                                    <div
                                        className="mt-3 text-sm text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: item.detailHtml }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <FormNews openNewsCtrl={openUpdate} setOpenNewsCtrl={setOpenUpdate}
                onSuccess={() => fetchData()} defaultValues={updateTarget}
                key={`${updateTarget?.id ?? "-1"}-${formVersion}`} />
        </>
    );
}
export default NewsUI;