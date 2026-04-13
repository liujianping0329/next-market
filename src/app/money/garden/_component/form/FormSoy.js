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
import ky from "ky";
import { useForm } from "react-hook-form";
import { useState } from "react";
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
import supabase from "@/app/utils/database";
import { Checkbox } from "@/components/ui/checkbox";

const FormSoy = ({ trigger, onSuccess, defaultValues = null }) => {

    const [openSoy, setOpenSoy] = useState(false);
    const [isLoadSoy, setIsLoadSoy] = useState(false);
    const form = useForm({
        defaultValues: {
            category: defaultValues?.category || "",
            status: defaultValues?.status || "1",
            titles: defaultValues?.titles || ""
        }
    });

    const onSubmit = async (values) => {
        setIsLoadSoy(true);
        const { data: userData, error } = await supabase.auth.getSession();
        if (values.category) {
            //新增修改框输入类别
            try {
                await ky.post('/api/money/garden/soy/upsert', {
                    json: {
                        ...(defaultValues?.id && { id: defaultValues.id }),
                        pname: values.category,
                        titles: values.titles,
                        status: values.status,
                        ...(userData?.session?.user?.id && { userId: userData.session.user.id }),
                    }
                }).json();
                onSuccess();
                setOpenSoy(false);
                form.reset();
            } catch (error) {
                console.error("Error upserting SoyBean:", error);
                const { errorMsg } = await error.response.json();
                toast.error(errorMsg);
            } finally {
                setIsLoadSoy(false);
            }
        } else {
            if (defaultValues?.id) {
                //修改框不输入类别
                toast.error("修改时，便签名不能为空！");
                setIsLoadSoy(false);
                return;
            }
            //新增框不输入类别
            await ky.post('/api/money/garden/upsert', {
                json: values.titles.split("\n").map(t => t.trim()).filter(Boolean).map(title => ({
                    title,
                    category: values.category,
                    topic: "SoyBean",
                    status: values.status,
                    ...(userData?.session?.user?.id && { userId: userData.session.user.id }),
                }))
            }).json();
            onSuccess();
            setIsLoadSoy(false);
            setOpenSoy(false);
            form.reset();
        }
    }

    return (
        <>
            <Dialog open={openSoy} onOpenChange={setOpenSoy}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues ? "修改" : "新增"}</DialogTitle>
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
                                    <div className="flex space-x-3">
                                        <FormField control={form.control} name="status"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start items-center space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value === "2"}
                                                            onCheckedChange={(checked) => field.onChange(checked ? "2" : "1")}
                                                            className="h-5 w-5 border-2 border-gray-500 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="mr-0">私人</FormLabel>
                                                </FormItem>
                                            )} />
                                    </div>
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
