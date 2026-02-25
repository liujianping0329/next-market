"use client";
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
import { Textarea } from "@/components/ui/textarea";
import { ca, fi } from "date-fns/locale";
import ky from "ky";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

const FormSoy = ({ trigger, onSuccess, defaultValues = null }) => {

    const [openSoy, setOpenSoy] = useState(false);
    const [isLoadSoy, setIsLoadSoy] = useState(false);
    const form = useForm({
        defaultValues: {
            category: defaultValues?.category || "",
            titles: defaultValues?.titles || ""
        }
    });

    const onSubmit = async (values) => {
        setIsLoadSoy(true);
        if (values.category) {
            //新增修改框输入类别
            try {
                await ky.post('/api/money/garden/soy/upsert', {
                    json: {
                        ...(defaultValues?.id && { id: defaultValues.id }),
                        pname: values.category,
                        titles: values.titles
                    }
                }).json();
            } catch (error) {
                console.error("Error upserting SoyBean:", error);
                const { errorMsg } = await error.response.json();
                toast.error(errorMsg);
            } finally {
                setIsLoadSoy(false);
            }
        } else {
            //新增框不输入类别
            await ky.post('/api/money/garden/upsert', {
                json: values.titles.split("\n").map(t => t.trim()).filter(Boolean).map(title => ({
                    title,
                    category: values.category,
                    topic: "SoyBean",
                    status: "1"
                }))
            }).json();
        }
        onSuccess();
        setIsLoadSoy(false);
        setOpenSoy(false);
    }

    return (
        <>
            <Dialog open={openSoy} onOpenChange={setOpenSoy}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>新增</DialogTitle>
                    </DialogHeader>
                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formSoy" className="">
                                <FieldGroup>
                                    <FormField name="category" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>便签名</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="titles" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>每行对应一条记录</FormLabel>
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
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="formSoy" disabled={isLoadSoy}>
                            {isLoadSoy && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog>
        </>
    );
}

export default FormSoy;