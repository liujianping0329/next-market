"use client";
import { FieldGroup } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import ky from "ky";
import Datepicker from "@/components/datepicker";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
    useEffect,
    useState,
} from "react";
import supabase from "@/app/utils/database";
import {
    formatDateLocal,
    parseLocalDate,
} from "@/app/utils/date";
import { useUserStore } from "@/app/money/garden/_store/userStore";
import { useLocationStore } from "@/app/money/garden/_store/locationStore";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const FormGranarySpend = ({ trigger, openGranarySpendCtrl, setOpenGranarySpendCtrl, onSuccess, cash, defaultValues = null, spendCate }) => {

    const [openGranarySpend, setOpenGranarySpend] = useState(false);

    const [isLoadGranarySpend, setIsLoadGranarySpend] = useState(false);

    const [userId, setUserId] = useState(null);

    const userInfoStore = useUserStore(state => state.userInfo);
    const locationInfoStore = useLocationStore(state => state.locationInfo);

    const form = useForm({
        defaultValues: {
            date: defaultValues?.date ? parseLocalDate(defaultValues.date) : new Date(),
            category: String(defaultValues?.category ?? "34"),
            title: defaultValues?.title || "",
            amount: defaultValues?.amount || "",
            cashType: defaultValues?.cashType || "jpy",
        }
    });

    useEffect(() => {
        const loadSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            setUserId(data.session?.user?.id ?? null);
        };

        loadSession();
    }, []);

    useEffect(() => {
        if (defaultValues?.title) return;
        if (!locationInfoStore?.spendNames) return;

        form.setValue("title", locationInfoStore?.spendNames.split('\n')[0]);
        if (openGranarySpendCtrl ?? openGranarySpend) {
            setTimeout(() => {
                form.setFocus("amount");
            }, 100);
        }
    }, [locationInfoStore?.spendNames, openGranarySpendCtrl ?? openGranarySpend]);

    const onSubmit = async (values) => {
        setIsLoadGranarySpend(true);
        await ky.post('/api/spend/upsert', {
            json: {
                ...(defaultValues?.id && { id: defaultValues.id }),
                date: formatDateLocal(values.date),
                category: values.category,
                title: values.title,
                amount: Number(values.amount),
                cashType: values.cashType,
                ...cash,
                userId,
                planetId: userInfoStore?.planetId,
                ...(locationInfoStore?.id && { locationId: locationInfoStore?.id }),
            }
        }).json();
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
                                                {locationInfoStore?.spendNames && (<div className="flex flex-wrap gap-1.5 pb-[-10px]">
                                                    {locationInfoStore.spendNames.split('\n').map((text) => (
                                                        <Badge
                                                            key={text}
                                                            variant="secondary"
                                                            className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                            onClick={() => {
                                                                form.setValue("title", text)
                                                                form.setFocus("amount");
                                                            }}
                                                        >
                                                            {text}
                                                        </Badge>
                                                    ))}
                                                </div>)}
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <div className="grid grid-cols-6 gap-3">
                                        <FormField name="amount" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="col-span-4">
                                                    <FormLabel>金额</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
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
                            {locationInfoStore?.id && (
                                <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                                    (
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span>{locationInfoStore.name}</span>
                                    )
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent >
            </Dialog >
        </>
    );
}

export default FormGranarySpend;
