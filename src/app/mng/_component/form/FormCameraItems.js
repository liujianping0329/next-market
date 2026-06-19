"use client";


import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import {
    useEffect,
    useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import supabase from "@/app/utils/database";




import { slugify } from "transliteration";

const FormCameraItems = ({ trigger, openCameraCtrl, setOpenCameraCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [openCamera, setOpenCamera] = useState(false);
    const [isLoadCamera, setIsLoadCamera] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.label || "",
            startX: defaultValues?.children?.startX || 0,
            startY: defaultValues?.children?.startY || 0,
            width: defaultValues?.children?.width || 0,
            height: defaultValues?.children?.height || 0,
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
        setIsLoadCamera(true);

        try {
            await ky.post('/api/constants/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    value: slugify(values.name, {
                        separator: "",
                    }),
                    category: "CameraCate",
                    label: values.name,
                    children: {
                        ...defaultValues?.children,
                        startX: values?.startX || 0,
                        startY: values?.startY || 0,
                        width: values?.width || 0,
                        height: values?.height || 0,
                    }
                }
            }).json();
            onSuccess();
            setOpenCameraCtrl ? setOpenCameraCtrl(false) : setOpenCamera(false);
            form.reset();
        } catch (error) {
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadCamera(false);
        }
    }

    return (
        <>
            <Dialog open={openCameraCtrl ?? openCamera} onOpenChange={setOpenCameraCtrl ?? setOpenCamera}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formCamera" className="">
                                <FieldGroup className="gap-4">
                                    <FormField name="name" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="col-span-3">
                                                <FormLabel>条目名称</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField name="startX" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel>起始点X坐标</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        <FormField name="startY" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel>Y坐标</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField name="width" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel>裁剪尺寸 宽</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        <FormField name="height" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel>高</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    </div>
                                </FieldGroup>
                            </form>
                        </Form>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="formCamera" disabled={isLoadCamera}>
                            {isLoadCamera && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormCameraItems;