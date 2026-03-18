"use client";
import Datepicker from "@/components/datepicker";
import DateTimePicker from "@/components/datetimepicker";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatDateLocal, parseLocalDateTime } from "@/app/utils/date";
import supabase from "@/app/utils/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { encode, decode } from "@/app/utils/base64";
import { Textarea } from "@/components/ui/textarea";

import { slugify } from "transliteration";

const cashList = [
    {
        label: "万日元",
        value: "wjpy"
    }, {
        label: "台币",
        value: "twd"
    }, {
        label: "人民币",
        value: "cny"
    }
]

const FormGranaryItems = ({ trigger, openGranaryCtrl, setOpenGranaryCtrl, onSuccess, defaultValues = null }) => {

    const [openGranary, setOpenGranary] = useState(false);
    const [isLoadGranary, setIsLoadGranary] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.name || "",
            cashType: defaultValues?.cashType || "wjpy",
            dfValue: defaultValues?.dfValue || 0
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
        setIsLoadGranary(true);

        try {
            const response = await ky.post('/api/granary/granary_user_template/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    ...values,
                    userId: userId,
                    value: slugify(values.name, {
                        separator: "",
                    })
                }
            }).json();
            onSuccess();
            setOpenGranaryCtrl ? setOpenGranaryCtrl(false) : setOpenGranary(false);
            form.reset();
        } catch (error) {
            console.error("Error :", error);
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadGranary(false);
        }
    }

    return (
        <>
            <Dialog open={openGranaryCtrl ?? openGranary} onOpenChange={setOpenGranaryCtrl ?? setOpenGranary}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGranary" className="">
                                <FieldGroup className="gap-4">
                                    {/* <FormField name="startTime" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>开始时间</FormLabel>
                                                <FormControl>
                                                    <DateTimePicker dtFormat="yyyy-MM-dd hh:mm" dateDf={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}
                                    {/* <FormField name="remindBefore" control={form.control}
                                    render={({ field }) => (
                                        <FormItem className="-mt-5">
                                            <FormControl>
                                                <RadioGroup value={field.value} onValueChange={field.onChange}
                                                    className="flex flex-wrap gap-3">
                                                    {remindOptions.map((item) => (
                                                        <div className="flex gap-2" key={item.value}>
                                                            <RadioGroupItem value={item.value} />
                                                            <Label className="text-muted-foreground">{item.label}</Label>
                                                        </div>
                                                    ))}
                                                    <Label className="text-muted-foreground">前提醒我</Label>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                /> */}
                                    <FormField name="name" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>条目名称</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="cashType" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="-mt-2">
                                                <FormControl>
                                                    <RadioGroup value={field.value} onValueChange={field.onChange}
                                                        className="flex flex-wrap gap-3">
                                                        <Label className="text-muted-foreground">币种</Label>
                                                        {cashList.map((item) => (
                                                            <div className="flex gap-2" key={item.value}>
                                                                <RadioGroupItem value={item.value} />
                                                                <Label className="text-muted-foreground">{item.label}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField name="dfValue" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>默认值</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
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
                        <Button type="submit" form="formGranary" disabled={isLoadGranary}>
                            {isLoadGranary && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormGranaryItems;