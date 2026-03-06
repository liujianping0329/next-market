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

const FormHarvest = ({ trigger, onSuccess, defaultValues = null }) => {

    const [openHarvest, setOpenHarvest] = useState(false);
    const [isLoadHarvest, setIsLoadHarvest] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const form = useForm({
        defaultValues: {
            startTime: parseLocalDateTime(defaultValues?.startTime) || new Date(new Date().setHours(8, 0, 0, 0)),
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

    const onSubmit = async (values) => {
        setIsLoadHarvest(true);

        try {
            await ky.post('/api/money/harvest/upsertWithPush', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    ...values,
                    ...(defaultValues?.gardenId && { gardenId: defaultValues.gardenId }),
                    startTime: formatDateLocal(values.startTime, "yyyy-MM-dd HH:mm"),
                    userId: userId
                }
            }).json();
            onSuccess();
            setOpenHarvest(false);
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
            <Dialog open={openHarvest} onOpenChange={setOpenHarvest}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
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

            </Dialog>
        </>
    );
}

export default FormHarvest;