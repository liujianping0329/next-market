"use client";
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
import { formatDateLocal } from "@/lib/date";

const FormGarden = ({ onSuccess, btnStatus, categories }) => {
    const form = useForm({
        defaultValues: {
            date: new Date(),
            category: "else",
            title: "",
            location: "",
            locationPath: "",
            content: ""
        }
    });

    const picRef = useRef(null)

    const onSubmit = async (values) => {
        btnStatus(true);
        const urls = await picRef.current?.upload()

        const { locationPath, ...rest } = values;
        await ky.post('/api/money/garden/upsert', {
            json: {
                ...rest, pics: urls,
                date: formatDateLocal(values.date),
                location: { name: values.location, path: values.locationPath },
                topic: "Greengrass"
            }
        }).json();
        onSuccess();
        picRef.current.clear()
        btnStatus(false);
    }

    return (
        <>
            <div data-scroll className={`flex-1 min-h-0 overflow-y-auto`}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formGarden" className="">
                        <FieldGroup className="space-y-2">
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
                                    <PicUploader ref={picRef} />
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
        </>
    );
}

export default FormGarden;