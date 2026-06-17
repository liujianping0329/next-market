"use client";
import supabase from "@/app/utils/database";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import {
    useEffect,
    useState,
} from "react";

import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { FieldGroup } from "@/components/ui/field";
import ky from "ky";
import { Textarea } from "@/components/ui/textarea"
import StarBar from "@/components/StarBar";
export const revalidate = 0;

const RemarkUI = ({ harvest, defaultValues }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [openGardenRemark, setOpenGardenRemark] = useState(false);
    const [isLoadGardenRemark, setIsLoadGardenRemark] = useState(false);

    const form = useForm({
        defaultValues: {
            point: defaultValues?.point || 3,
            remark: defaultValues?.remark || ""
        }
    });

    const onSubmit = async (values) => {
        // setIsLoadGardenRemark(true);
        // await ky.post('/api/money/garden/upsert', {
        //     json: { id: defaultValues?.id, ...values }
        // }).json();
        // onSuccess();
        // setOpenGardenRemark(false);
        // setIsLoadGardenRemark(false);
        // form.reset();
    }

    useEffect(() => {
        const getUser = async (session) => {
            const response = await ky.post('/api/f_user/list/match', { json: { id: session.user.id } }).json();
            let userInfo = { ...session.user, ...(response.list[0]) }
            setUserInfo(userInfo);
        };

        supabase.auth.getSession().then(({ data }) => {
            getUser(data.session);
        });
    }, [])

    return (
        <>
            <div id="toolBar" className="flex p-2.5 overflow-x-auto items-center">
                <div className="w-9"></div>
                <span className="flex-1 text-center font-bold">快评</span>
                <div className="w-9">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={userInfo?.user_metadata.avatar_url} alt="img" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </Button>
                </div>
            </div>
            <div id="cardContainer" className="flex flex-col p-4 gap-3">
                <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                            src={`${harvest?.garden?.pics[0]}`}
                            alt={harvest.title}
                            className={`h-full w-full object-cover`}
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex-col items-start justify-between gap-2">
                            <div className="flex-col min-w-0 items-center gap-2">
                                <div className="text-xl min-w-0 truncate text-base font-semibold text-gray-900">
                                    {harvest.title}
                                </div>
                            </div>
                            <div className="mt-5 flex-col min-w-0 items-center gap-4">
                                {harvest?.garden.location?.name &&
                                    <Link href={harvest.garden.location.path} className="flex items-center gap-1 truncate">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{harvest.garden.location.name}</span>
                                    </Link>
                                }
                                <div className="min-w-0 truncate text-base text-muted-foreground">
                                    {harvest.startTime}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div data-scroll className={`flex-1 min-h-0 overflow-y-auto px-4 py-4`}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formRemark" className="">
                        <FieldGroup>
                            <FormField name="point" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>分数</FormLabel> */}
                                        <FormControl>
                                            <StarBar {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField name="remark" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>内容</FormLabel> */}
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[120px] resize-none"
                                                onFocus={(e) => {
                                                    setTimeout(() => {
                                                        const scroller = e.target.closest("[data-scroll]")
                                                        scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" })
                                                    }, 350)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                        </FieldGroup>
                    </form>
                </Form>
            </div>
        </>
    );
}

export default RemarkUI;