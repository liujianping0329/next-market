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

const FormGarden = ({ onSuccess, btnStatus }) => {
    const form = useForm({
        defaultValues: {
            date: new Date(),
            title: "",
            content: ""
        }
    });

    const picRef = useRef(null)

    const onSubmit = async (values) => {
        btnStatus(true);
        const urls = await picRef.current?.upload()

        await ky.post('/api/money/garden/upsert', {
            json: {...values, pics: urls, date: formatDateLocal(values.date)}
        }).json();
        onSuccess();
        picRef.current.clear()
        btnStatus(false);
    }
    
    return (
        <>
            <div className="w-full">
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
                            <FormField name="content" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>内容</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[120px] resize-none" />
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