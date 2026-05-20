"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldSeparator
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import ky from "ky";
import { Textarea } from "@/components/ui/textarea"

import Datepicker from "@/components/datepicker";
import PicUploader from "@/components/PicUploader";
import PicUploaderAdvance from "@/components/PicUploaderAdvance";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
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
import { Button } from "@/components/ui/button";
import supabase from "@/app/utils/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SiTiktok, SiDazhongdianping, SiXiaohongshu, SiYoutube, SiGooglemaps, } from "react-icons/si";
import { analyzePassCode } from "@/app/utils/passCode";

const FormGarden = ({ trigger, onSuccess, categories, defaultValues = null }) => {
    const [openGarden, setOpenGarden] = useState(false);
    const [isLoadGarden, setIsLoadGarden] = useState(false);
    const [picUrls, setPicUrls] = useState([]);
    const [passCodeInfo, setPassCodeInfo] = useState(null);

    const form = useForm({
        defaultValues: {
            date: defaultValues?.date ? parseLocalDate(defaultValues.date) : new Date(),
            category: defaultValues?.category || "else",
            title: defaultValues?.title || "",
            location: defaultValues?.location?.name || "",
            locationPath: defaultValues?.location?.path || "",
            content: defaultValues?.content || ""
        }
    });

    // const picRef = useRef(null)

    const onSubmit = async (values) => {
        setIsLoadGarden(true);
        // const urls = await picRef.current?.upload()
        const { data: userData, error } = await supabase.auth.getSession();

        const { locationPath, ...rest } = values;
        await ky.post('/api/money/garden/upsert', {
            json: {
                ...(defaultValues?.id && { id: defaultValues.id }),
                ...rest, pics: picUrls,
                date: formatDateLocal(values.date),
                location: { name: values.location, path: values.locationPath },
                topic: "Greengrass",
                ...(userData?.session?.user?.id && { userId: userData.session.user.id }),
            }
        }).json();
        onSuccess();
        // picRef.current.clear()
        setOpenGarden(false);
        setIsLoadGarden(false);
        form.reset();
    }

    useEffect(() => {
        if (openGarden) {
            const loadPassCode = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text && !defaultValues) {
                        const passCodeData = analyzePassCode(text);
                        setPassCodeInfo(passCodeData ?? null);
                        if (passCodeData) {
                            form.setValue("location", passCodeData.typeName ?? "");
                            form.setValue("locationPath", passCodeData.url ?? "");
                            form.setValue("title", passCodeData.title ?? "");
                            form.setValue("content", passCodeData.detail ?? "");
                        } else {
                            form.setValue("location", "");
                            form.setValue("locationPath", "");
                            form.setValue("title", "");
                            form.setValue("content", "");
                        }
                    }
                } catch (e) {

                }
            }
            loadPassCode();
        }
    }, [openGarden]);

    return (
        <>
            <Dialog open={openGarden} onOpenChange={setOpenGarden}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="h-[90dvh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>种草</DialogTitle>
                    </DialogHeader>

                    {passCodeInfo && <Alert className="">
                        <AlertTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {passCodeInfo.type === "douyin" && <SiTiktok className="h-4 w-4 text-black"
                                style={{
                                    filter: `
                                      drop-shadow(1px 0 #25F4EE)
                                      drop-shadow(-1px 0 #FE2C55)
                                    `,
                                }} />}
                            {passCodeInfo.type === "dianping" && <SiDazhongdianping
                                className="size-[13px] text-[#ffb300]"
                                style={{
                                    filter: `
                                    drop-shadow(0 0 1px #ffe082)
                                  `,
                                }}
                            />}
                            {passCodeInfo.type === "xhslink" && <SiXiaohongshu
                                className="size-[14px] text-[#ff2442]"
                                style={{
                                    filter: `
                                    drop-shadow(0 0 1px #ff9db0)
                                  `,
                                }}
                            />}
                            <span>{passCodeInfo.typeName}
                                {passCodeInfo.type === "else"
                                    ? "链接已发现"
                                    : "口令已发现"}
                            </span>
                        </AlertTitle>
                        <AlertDescription>
                            {passCodeInfo.type !== "else" && <span>将导入【{passCodeInfo.detail}】</span>}
                        </AlertDescription>
                    </Alert>}

                    <div data-scroll className={`flex-1 min-h-0 overflow-y-auto`}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGarden" className="">
                                <FieldGroup>
                                    <FormField name="date" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="hidden">
                                                <FormLabel>日期</FormLabel>
                                                <FormControl>
                                                    <Datepicker dateDf={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="category" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>种类</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue></SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(cate => (
                                                                <div key={cate.value}>
                                                                    {/* 父项（可选） */}
                                                                    <SelectItem value={cate.value} className="font-medium">
                                                                        {cate.label}
                                                                    </SelectItem>

                                                                    {/* 子项（缩进） */}
                                                                    {cate.children?.map((child) => (
                                                                        <SelectItem
                                                                            key={child.value}
                                                                            value={child.value}
                                                                            className="pl-8 text-muted-foreground"
                                                                        >
                                                                            {child.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    {/* <FormItem>
                                        <FormLabel>图片</FormLabel>
                                        <FormControl>
                                            <PicUploader ref={picRef} defaultPics={defaultValues?.pics} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem> */}
                                    <FormItem>
                                        <FormLabel>图片测试上传</FormLabel>
                                        <FormControl>
                                            <PicUploaderAdvance defaultPics={defaultValues?.pics} onChange={setPicUrls} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormField name="title" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>标题</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <div className="grid grid-cols-4 gap-3">
                                        <FormField name="location" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel>地点</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        <FormField name="locationPath" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <FormLabel>地图url</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    </div>
                                    <FormField name="content" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>内容</FormLabel>
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
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="formGarden" disabled={isLoadGarden}>
                            {isLoadGarden && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FormGarden;
