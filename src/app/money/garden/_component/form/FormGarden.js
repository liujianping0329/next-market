"use client";
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
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FieldGroup } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ky from "ky";
import { Textarea } from "@/components/ui/textarea";
import Datepicker from "@/components/datepicker";

import PicUploaderAdvance from "@/components/PicUploaderAdvance";
import {
    formatDateLocal,
    parseLocalDate,
} from "@/app/utils/date";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import supabase from "@/app/utils/database";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
    SiTiktok,
    SiDazhongdianping,
    SiXiaohongshu,
} from "react-icons/si";
import { analyzePassCode } from "@/app/utils/passCode";
import { toast } from "sonner";

const FormGarden = ({ trigger, onSuccess, cate2s, defaultValues = null }) => {
    const [openGarden, setOpenGarden] = useState(false);
    const [isLoadGarden, setIsLoadGarden] = useState(false);
    const [picUrls, setPicUrls] = useState([]);
    const [passCodeInfo, setPassCodeInfo] = useState(null);
    const [submitAction, setSubmitAction] = useState("save");

    console.log(defaultValues);
    const form = useForm({
        defaultValues: {
            date: defaultValues?.date ? parseLocalDate(defaultValues.date) : new Date(),
            cate2: String(defaultValues?.cate2.id) || "",
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
        const saved = await ky.post('/api/money/garden/upsert', {
            json: {
                ...(defaultValues?.id && { id: defaultValues.id }),
                ...rest, pics: picUrls,
                date: formatDateLocal(values.date),
                location: { name: values.location, path: values.locationPath },
                topic: "Greengrass",
                ...(userData?.session?.user?.id && { userId: userData.session.user.id }),
            }
        }).json();
        if (submitAction === "saveAndGenerate") {
            navigator.clipboard.writeText(saved.passCode);
            toast.info("口令已复制到剪贴板")
        }
        onSuccess();
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
                                    <FormField name="cate2" control={form.control}
                                        rules={{
                                            required: "请选择类型",
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>新类型</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={(value) => {
                                                        field.onChange(value);
                                                    }} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="请选择类型" ></SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {cate2s.map(cate => (
                                                                <SelectItem value={String(cate.id)} key={cate.id} className="font-medium">
                                                                    {cate.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    {/* <FormField name="date" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="hidden">
                                                <FormLabel>日期</FormLabel>
                                                <FormControl>
                                                    <Datepicker dateDf={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}
                                    {/* <FormField name="category" control={form.control}
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
                                                                    <SelectItem value={cate.value} className="font-medium">
                                                                        {cate.label}
                                                                    </SelectItem>


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
                                        )} /> */}
                                    {/* <FormItem>
                                        <FormLabel>图片</FormLabel>
                                        <FormControl>
                                            <PicUploader ref={picRef} defaultPics={defaultValues?.pics} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem> */}
                                    <FormItem>
                                        <FormLabel>图片上传</FormLabel>
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
                        {defaultValues?.id ? (<>
                            <DialogClose asChild>
                                <Button variant="outline">关闭</Button>
                            </DialogClose>
                            <Button type="submit" form="formGarden" disabled={isLoadGarden}>
                                {isLoadGarden && <Spinner />}保存
                            </Button>
                        </>) : (<>
                            <div className="grid grid-cols-[49%_2%_49%] justify-between">
                                <Button type="submit" form="formGarden" disabled={isLoadGarden}>
                                    {isLoadGarden && <Spinner />}仅保存
                                </Button>
                                <div></div>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                            </div>
                            <Button type="submit" form="formGarden" disabled={isLoadGarden}
                                onClick={() => setSubmitAction("saveAndGenerate")}>
                                {isLoadGarden && <Spinner />}保存并生成口令
                            </Button>
                        </>)}

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FormGarden;
