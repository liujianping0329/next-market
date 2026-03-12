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

const FormHarvest = ({ trigger, openHarvestCtrl, setOpenHarvestCtrl, onSuccess, defaultValues = null, needPassCode = false }) => {

    const remindOptions = [
        { label: "1小时", value: "60" },
        { label: "30分", value: "30" },
        { label: "15分", value: "15" },
        { label: "0分", value: "0" },
    ];
    console.log(defaultValues)

    const [openHarvest, setOpenHarvest] = useState(false);
    const [isLoadHarvest, setIsLoadHarvest] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [passCodeGarden, setPassCodeGarden] = useState(null);
    const form = useForm({
        defaultValues: {
            startTime: parseLocalDateTime(defaultValues?.startTime) || new Date(new Date().setHours(8, 0, 0, 0)),
            remindBefore: defaultValues?.remindBefore != null
                ? String(defaultValues.remindBefore)
                : remindOptions[0].value,
            title: defaultValues?.title || ""
        }
    });

    useEffect(() => {
        const loadSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            setUserId(data.session?.user?.id ?? null);
        };

        loadSession();
        setIsCheckingSession(false);
    }, []);

    useEffect(() => {
        if (needPassCode && (openHarvest || openHarvestCtrl)) {
            const loadPassCode = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        let passCodeObj = decode(text);
                        console.log(passCodeObj)
                        setPassCodeGarden(passCodeObj);
                    }
                } catch (e) {

                }
            }
            loadPassCode();
        }
    }, [needPassCode, openHarvest, openHarvestCtrl]);

    const onSubmit = async (values) => {
        setIsLoadHarvest(true);

        try {
            const response = await ky.post('/api/money/harvest/upsertWithPush', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    ...values,
                    ...(passCodeGarden && { gardenId: passCodeGarden.id }),
                    ...(defaultValues?.gardenId && { gardenId: defaultValues.gardenId }),
                    startTime: formatDateLocal(values.startTime, "yyyy-MM-dd HH:mm"),
                    userId: userId
                }
            }).json();
            onSuccess();
            setOpenHarvestCtrl ? setOpenHarvestCtrl(false) : setOpenHarvest(false);
            form.reset();
        } catch (error) {
            console.error("Error upserting Harvest:", error);
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadHarvest(false);
        }
    }

    return (
        <>
            <Dialog open={openHarvestCtrl ?? openHarvest} onOpenChange={setOpenHarvestCtrl ?? setOpenHarvest}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    {!isCheckingSession && !userId && <Alert variant="destructive" className="">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>注意</AlertTitle>
                        <AlertDescription>
                            当前未登录，无法绑定个人推送提醒
                        </AlertDescription>
                    </Alert>}

                    {passCodeGarden && <Alert className="">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>发现口令</AlertTitle>
                        <AlertDescription>
                            将绑定【{passCodeGarden.title}】
                        </AlertDescription>
                    </Alert>}

                    {needPassCode && !passCodeGarden && <Alert className="border-yellow-300 bg-yellow-50 text-yellow-900">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>未发现口令</AlertTitle>
                        <AlertDescription>
                            可在种草详情页发行口令以用于绑定
                        </AlertDescription>
                    </Alert>}

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formSoy" className="">
                                <FieldGroup>
                                    <FormField name="startTime" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>开始时间</FormLabel>
                                                <FormControl>
                                                    <DateTimePicker dtFormat="yyyy-MM-dd hh:mm" dateDf={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="remindBefore" control={form.control}
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
                                    />
                                    <FormField name="title" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>日程说明</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
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
                        <Button type="submit" form="formSoy" disabled={isLoadHarvest}>
                            {isLoadHarvest && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormHarvest;