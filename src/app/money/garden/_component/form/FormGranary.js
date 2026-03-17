"use client";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldSeparator
} from "@/components/ui/field"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { formatDateLocal } from "@/app/utils/date";
import ky from "ky";
import Datepicker from "@/components/datepicker";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

function normalizeObjectNumbers(obj) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (value === "") return [key, 0];
            if (value instanceof Date) return [key, value];
            if (typeof value === "string" && !Number.isNaN(Number(value))) {
                return [key, Number(value)];
            }
            return [key, value];
        })
    );
}

const FormGranary = ({ trigger, openGranaryCtrl, setOpenGranaryCtrl, onSuccess, cash, defaultValues = null, userTemplate }) => {

    const [openGranary, setOpenGranary] = useState(false);

    const [isLoadGranary, setIsLoadGranary] = useState(false);

    console.log({ userTemplate });
    const form = useForm({
        defaultValues: {
            date: new Date(),
            ...Object.fromEntries(
                userTemplate.map((n) => [n.value, n.dfValue])
            )
        }
    });
    const onSubmit = async (values) => {
        setIsLoadGranary(true);
        await ky.post('/api/granary/upsert/all', {
            json: {
                ...normalizeObjectNumbers(values),
                date: formatDateLocal(values.date),
                ...normalizeObjectNumbers(cash)
            }
        }).json();
        onSuccess();
        setIsLoadGranary(false);
    }

    return (
        <>
            <Dialog open={openGranaryCtrl ?? openGranary} onOpenChange={openGranaryCtrl ?? setOpenGranary}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGranary" className="h-[70dvh] flex flex-col">

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
                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    {userTemplate.map(item => (
                                        <FormField key={item.id} name={item.value} control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="py-1">
                                                    <FormLabel>
                                                        <div className="truncate text-sm font-medium text-gray-900">
                                                            {item.name}
                                                            <span className="ml-2 text-xs font-normal text-gray-500">
                                                                （单位：{item.cashType}）
                                                            </span>
                                                        </div>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    ))}
                                </div>
                            </form>
                        </Form>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="formGranary" disabled={isLoadGranary}>
                            {isLoadGranary && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FormGranary;