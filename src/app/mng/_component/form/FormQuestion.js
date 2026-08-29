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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Textarea } from "@/components/ui/textarea";
const FormComponent = ({ trigger, openCtrl, setOpenCtrl, onSuccess, defaultValues = null }) => {

    const [open, setOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            title: defaultValues?.title || "",
            ...(defaultValues?.id && { remark: defaultValues.remark || "" }),
        }
    });

    const onSubmit = async (values, event) => {
        setIsLoad(true);
        const action = event?.nativeEvent?.submitter?.value;
        try {
            let response = {};
            if (action === "save") {
                response = await ky.post('/api/ai_question/upsert', {
                    json: {
                        ...(defaultValues?.id && { id: defaultValues.id }),
                        ...values
                    }
                }).json();
            } else {
                response = await ky.post('/api/ai_question/upsertWithAI', {
                    json: {
                        ...(defaultValues?.id && { id: defaultValues.id }),
                        ...values
                    }
                }).json();
            }
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
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
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
                                    {defaultValues?.id && (
                                        <FormField name="remark" control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>反馈</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} className="min-h-[60px] resize-none"
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
                                    )}
                                </FieldGroup>
                            </form>
                        </Form>
                        {defaultValues?.answer && (

                            <div className="mt-4 p-4 bg-gray-100 rounded-md min-h-[300px] max-h-[400px] overflow-y-auto">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => (
                                            <p className="mb-2 leading-6">
                                                {children}
                                            </p>
                                        ),
                                        table: ({ children }) => (
                                            <table className="w-full border-collapse my-3">
                                                {children}
                                            </table>
                                        ),
                                        th: ({ children }) => (
                                            <th className="border px-2 py-1 text-left bg-gray-200">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="border px-2 py-1">
                                                {children}
                                            </td>
                                        ),
                                    }}>
                                    {defaultValues.answer}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {defaultValues?.id ? (<>
                            <DialogClose asChild>
                                <Button variant="outline">关闭</Button>
                            </DialogClose>
                            <div className="grid grid-cols-[49%_2%_49%] justify-between">
                                <Button type="submit" form="form" disabled={isLoad} value="regenerate">
                                    {isLoad && <Spinner />}保存并重新生成答案
                                </Button>
                                <div></div>
                                <Button type="submit" form="form" disabled={isLoad} value="save">
                                    {isLoad && <Spinner />}仅保存
                                </Button>
                            </div>
                        </>) : (<>
                            <DialogClose asChild>
                                <Button variant="outline">关闭</Button>
                            </DialogClose>
                            <Button type="submit" form="form" disabled={isLoad}>
                                {isLoad && <Spinner />}保存并生成答案
                            </Button>
                        </>)}
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormComponent;