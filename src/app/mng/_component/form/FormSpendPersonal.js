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



import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";





const cashList = [
    {
        label: "日元",
        value: "jpy"
    }, {
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

const FormSpendPersonal = ({ trigger, openSpendPersonalCtrl, setOpenSpendPersonalCtrl, onSuccess, defaultValues = null, userInfo, cash, spendCate }) => {

    const [openSpend, setOpenSpend] = useState(false);
    const [isLoadSpend, setIsLoadSpend] = useState(false);
    const [userId, setUserId] = useState(null);
    const form = useForm({
        defaultValues: {
            spendCate: String(defaultValues?.spendCate) || "30",
            title: defaultValues?.title || "",
            cost: defaultValues?.cost || "",
            cashType: defaultValues?.cashType || "wjpy",
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
            const response = await ky.post('/api/spend/fix/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    userId,
                    spendCate: values.spendCate,
                    cost: values.cost,
                    cashType: values.cashType,
                    ...cash,
                    title: values.title,
                }
            }).json();
            onSuccess();
            setOpenSpendPersonalCtrl ? setOpenSpendPersonalCtrl(false) : setOpenSpend(false);
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
            <Dialog open={openSpendPersonalCtrl ?? openSpend} onOpenChange={setOpenSpendPersonalCtrl ?? setOpenSpend}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formSpendPersonal" className="">
                                <FieldGroup className="gap-4 my-4">
                                    <FormField name="spendCate" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>支出类型</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={(value) => {
                                                        field.onChange(value);
                                                    }} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue></SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {spendCate.map(cate => (
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
                                    <FormField name="title" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>标题</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <div className="grid grid-cols-6 gap-3">
                                        <FormField name="cost" control={form.control}
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
                        <Button type="submit" form="formSpendPersonal" disabled={isLoadSpend}>
                            {isLoadSpend && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormSpendPersonal;