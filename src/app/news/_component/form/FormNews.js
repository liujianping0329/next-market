"use client";
import Datepicker from "@/components/datepicker";
import DateTimePicker from "@/components/datetimepicker";
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
import {
    FieldGroup
} from "@/components/ui/field";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatDateLocal, parseLocalDateTime } from "@/app/utils/date";
import supabase from "@/app/utils/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { encode, decode } from "@/app/utils/base64";
import { Textarea } from "@/components/ui/textarea"

const FormNews = ({ trigger, openNewsCtrl, setOpenNewsCtrl, onSuccess, defaultValues = null }) => {

    const [openNews, setOpenNews] = useState(false);
    const [isLoadNews, setIsLoadNews] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            title: defaultValues?.title || "",
            question: defaultValues?.question || "",
            questionDetail: defaultValues?.questionDetail || ""
        }
    });

    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUserId(data.session?.user?.id ?? null);
        };

        loadSession();
    }, []);

    const onSubmit = async (values) => {
        setIsLoadNews(true);

        try {
            const response = await ky.post('/api/news/upsertWithAI', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    ...values,
                    status: "init",
                    userId: userId
                }
            }).json();
            onSuccess();
            setOpenNewsCtrl ? setOpenNewsCtrl(false) : setOpenNews(false);
            form.reset();
        } catch (error) {
            console.error("Error :", error);
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadNews(false);
        }
    }

    return (
        <>
            <Dialog open={openNewsCtrl ?? openNews} onOpenChange={setOpenNewsCtrl ?? setOpenNews}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formNews" className="">
                                <FieldGroup className="gap-4">
                                    {/* <FormField name="startTime" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>开始时间</FormLabel>
                                                <FormControl>
                                                    <DateTimePicker dtFormat="yyyy-MM-dd hh:mm" dateDf={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}
                                    {/* <FormField name="remindBefore" control={form.control}
                                    render={({ field }) => (
                                        <FormItem className="-mt-5">
                                            <FormControl>
                                                <RadioGroup value={field.value} onValueChange={field.onChange}
                                                    className="flex flex-wrap gap-3">
                                                    {remindOptions.map((item) => (
                                                        <div className="flex gap-2" key={item.value}>
                                                            <RadioGroupItem value={item.value} />
                                                            <Label className="text-muted-foreground">{item.label}</Label>
                                                        </div>
                                                    ))}
                                                    <Label className="text-muted-foreground">前提醒我</Label>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                /> */}
                                    <FormField name="title" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>页面显示标题</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="question" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>问题</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="questionDetail" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>问题详细</FormLabel>
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
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="formNews" disabled={isLoadNews}>
                            {isLoadNews && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormNews;