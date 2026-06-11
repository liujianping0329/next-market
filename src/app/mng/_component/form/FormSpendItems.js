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
import { Checkbox } from "@/components/ui/checkbox";

import { slugify } from "transliteration";

const FormSpendItems = ({ trigger, openSpendCtrl, setOpenSpendCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [openSpend, setOpenSpend] = useState(false);
    const [isLoadSpend, setIsLoadSpend] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.label || "",
            color: defaultValues?.children?.bgColor || "#94A3B8",
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
        setIsLoadSpend(true);

        try {
            const response = await ky.post('/api/constants/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id }),
                    value: slugify(values.name, {
                        separator: "",
                    }),
                    category: "spendCate",
                    label: values.name,
                    children: {
                        ...defaultValues?.children,
                        bgColor: values.color
                    }
                }
            }).json();
            onSuccess();
            setOpenSpendCtrl ? setOpenSpendCtrl(false) : setOpenSpend(false);
            form.reset();
        } catch (error) {
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadSpend(false);
        }
    }

    return (
        <>
            <Dialog open={openSpendCtrl ?? openSpend} onOpenChange={setOpenSpendCtrl ?? setOpenSpend}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formSpend" className="">
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
                                    <div className="grid grid-cols-4 gap-3">
                                        <FormField name="color" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel>颜色</FormLabel>
                                                    <FormControl>
                                                        <Input type="color" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
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
                                    </div>
                                    {/* <FormField name="dfValue" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>固定费用</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}
                                    {/* <FormField control={form.control} name="isFixOnly"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start items-center space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value === "1"}
                                                        onCheckedChange={(checked) => field.onChange(checked ? "1" : "0")}
                                                        className="h-5 w-5 border-2 border-gray-500 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                                    />
                                                </FormControl>
                                                <FormLabel className="mr-0 text-muted-foreground">是否只是固定费用</FormLabel>
                                            </FormItem>
                                        )} /> */}
                                </FieldGroup>
                            </form>
                        </Form>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="formSpend" disabled={isLoadSpend}>
                            {isLoadSpend && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormSpendItems;