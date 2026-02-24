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
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const FormGardenRemark = ({ trigger, onSuccess, defaultValues }) => {
    const [openGardenRemark, setOpenGardenRemark] = useState(false);
    const [isLoadGardenRemark, setIsLoadGardenRemark] = useState(false);

    const form = useForm({
        defaultValues: {
            point: defaultValues?.point || 3,
            remark: defaultValues?.remark || ""
        }
    });

    const onSubmit = async (values) => {
        setIsLoadGardenRemark(true);
        await ky.post('/api/money/garden/upsert', {
            json: { id: defaultValues?.id, ...values }
        }).json();
        onSuccess();
        setOpenGardenRemark(false);
        setIsLoadGardenRemark(false);
        form.reset();
    }

    return (
        <>
            <Drawer open={openGardenRemark} onOpenChange={setOpenGardenRemark}>
                <DrawerTrigger asChild>
                    {trigger}
                </DrawerTrigger>
                <DrawerContent className="h-[50dvh] flex flex-col px-4 pb-4">
                    <DrawerHeader>
                        <DrawerTitle>点评</DrawerTitle>
                    </DrawerHeader>
                    <div data-scroll className={`flex-1 min-h-0 overflow-y-auto px-4`}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGardenRemark" className="">
                                <FieldGroup>
                                    <FormField name="point" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>分数</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="remark" control={form.control}
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
                    <DrawerFooter className="pt-4">
                        <DrawerClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DrawerClose>
                        <Button type="submit" form="formGardenRemark" disabled={isLoadGardenRemark}>
                            {isLoadGardenRemark && <Spinner />}保存
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default FormGardenRemark;