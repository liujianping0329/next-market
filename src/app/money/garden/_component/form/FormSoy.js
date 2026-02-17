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

const FormSoy = ({ onSuccess, btnStatus }) => {
    const form = useForm({
        defaultValues: {
            titles: ""
        }
    });

    const onSubmit = async (values) => {
        btnStatus(true);

        await ky.post('/api/money/garden/upsert', {
            json: values.titles.split("\n").map(t => t.trim()).filter(Boolean).map(title => ({
                title,
                topic: "SoyBean",
                status: "1"
            }))
        }).json();
        onSuccess();
        btnStatus(false);
    }

    return (
        <>
            <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formSoy" className="">
                        <FieldGroup>
                            <FormField name="titles" control={form.control}
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

export default FormSoy;