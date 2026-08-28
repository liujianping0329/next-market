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

import { Textarea } from "@/components/ui/textarea";
const FormComponent = ({ trigger, openCtrl, setOpenCtrl, onSuccess, defaultValues = null }) => {

    const [open, setOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            title: defaultValues?.title || "",
            answer: defaultValues?.answer || ""
        }
    });

    const onSubmit = async (values) => {
        setIsLoad(true);

        try {
            const response = await ky.post('/api/ai_question/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    ...values
                }
            }).json();
            onSuccess();
            setOpenCtrl ? setOpenCtrl(false) : setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error :", error);
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoad(false);
        }
    }

    return (
        <>
            <Dialog open={openCtrl ?? open} onOpenChange={setOpenCtrl ?? setOpen}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="form" className="">
                                <FieldGroup className="gap-4">
                                    <FormField name="title" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>问题</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="answer" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>内容</FormLabel> */}
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
                        <Button type="submit" form="form" disabled={isLoad}>
                            {isLoad && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormComponent;