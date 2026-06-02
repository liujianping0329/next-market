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
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import supabase from "@/app/utils/database";
import { parseLocalDate } from "@/app/utils/date";

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

const FormGranarySpend = ({ trigger, openGranarySpendCtrl, setOpenGranarySpendCtrl, onSuccess, cash, defaultValues = null, spendCate }) => {

    const [openGranarySpend, setOpenGranarySpend] = useState(false);

    const [isLoadGranarySpend, setIsLoadGranarySpend] = useState(false);

    const [userId, setUserId] = useState(null);

    const form = useForm({
        defaultValues: {
            date: defaultValues?.date ? parseLocalDate(defaultValues.date) : new Date(),
            category: defaultValues?.category || "-1",
            amount: defaultValues?.amount || 0,
            cashType: defaultValues?.cashType || "wjpy",
        }
    });

    useEffect(() => {
        const loadSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            setUserId(data.session?.user?.id ?? null);
        };

        loadSession();
    }, []);
    const onSubmit = async (values) => {
        setIsLoadGranarySpend(true);
        // await ky.post('/api/granary/upsert/all', {
        //     json: {
        //         ...normalizeObjectNumbers(values),
        //         date: formatDateLocal(values.date),
        //         cash: normalizeObjectNumbers(cash),
        //         userId
        //     }
        // }).json();
        setOpenGranarySpendCtrl ? setOpenGranarySpendCtrl(false) : setOpenGranarySpend(false);
        form.reset();
        onSuccess();
        setIsLoadGranarySpend(false);
    }

    return (
        <>
            <Dialog open={openGranarySpendCtrl ?? openGranarySpend} onOpenChange={setOpenGranarySpendCtrl ?? setOpenGranarySpend}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGranarySpend" className="max-h-[70dvh] flex flex-col">
                                <FieldGroup>
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
                                    <FormField name="category" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>支出类型</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={(value) => {
                                                        field.onChange(value);
                                                        const selectedCate = spendCate.find(
                                                            (cate) => String(cate.id) === value
                                                        );

                                                        form.setValue(
                                                            "amount",
                                                            Number(selectedCate?.children?.dfValue ?? 0)
                                                        );
                                                    }} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue></SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {spendCate.filter((cate) => cate.children?.isFixOnly !== "1")
                                                                .map(cate => (
                                                                    <SelectItem value={String(cate.id)} key={cate.id} className="font-medium">
                                                                        {cate.label}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <div className="grid grid-cols-6 gap-3">
                                        <FormField name="amount" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-4">
                                                    <FormLabel>金额</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        <FormField name="cashType" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>　</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue></SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {cashList.map((cash) => (
                                                                    <SelectItem value={cash.value} key={cash.value} className="font-medium">
                                                                        {cash.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                        <Button type="submit" form="formGranarySpend" disabled={isLoadGranarySpend}>
                            {isLoadGranarySpend && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent >
            </Dialog >
        </>
    );
}

export default FormGranarySpend;