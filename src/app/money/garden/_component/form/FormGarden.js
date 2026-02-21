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
import { formatDateLocal, parseLocalDate } from "@/lib/date";
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

const FormGarden = ({ trigger, onSuccess, categories, defaultValues = null }) => {
    const [openGarden, setOpenGarden] = useState(false);
    const [isLoadGarden, setIsLoadGarden] = useState(false);

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
    useEffect(() => {
        form.reset({
            date: defaultValues?.date ? parseLocalDate(defaultValues.date) : new Date(),
            category: defaultValues?.category || "else",
            title: defaultValues?.title || "",
            location: defaultValues?.location?.name || "",
            locationPath: defaultValues?.location?.path || "",
            content: defaultValues?.content || ""
        });
    }, [defaultValues?.id]);

    const picRef = useRef(null)

    const onSubmit = async (values) => {
        setIsLoadGarden(true);
        const urls = await picRef.current?.upload()

        const { locationPath, ...rest } = values;
        await ky.post('/api/money/garden/upsert', {
            json: {
                ...(defaultValues?.id && { id: defaultValues.id }),
                ...rest, pics: urls,
                date: formatDateLocal(values.date),
                location: { name: values.location, path: values.locationPath },
                topic: "Greengrass"
            }
        }).json();
        onSuccess();
        picRef.current.clear()
        setOpenGarden(false);
        setIsLoadGarden(false);
        form.reset();
    }

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
                    <div data-scroll className={`flex-1 min-h-0 overflow-y-auto`}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGarden" className="">
                                <FieldGroup>
                                    <FormField name="date" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
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
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(cate => (
                                                                <SelectItem key={cate.value} value={cate.value}>{cate.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormItem>
                                        <FormLabel>图片</FormLabel>
                                        <FormControl>
                                            <PicUploader ref={picRef} defaultPics={defaultValues?.pics} />
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