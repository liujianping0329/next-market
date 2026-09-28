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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import {
    useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    formatDateLocal,
} from "@/app/utils/date";
import { useUserStore } from "@/app/money/garden/_store/userStore";

const journeyTypeNames = { memo: "备忘", flight: "飞机", hotel: "酒店" };

const FormHarvestJourney = ({ trigger, openHarvestCtrl, setOpenHarvestCtrl, onSuccess, defaultValues = null }) => {
    const [openHarvest, setOpenHarvest] = useState(false);
    const [isLoadHarvest, setIsLoadHarvest] = useState(false);
    const form = useForm({
        defaultValues: {
            title: defaultValues?.title || "",
            body: "",
        }
    });

    const userInfoStore = useUserStore(state => state.userInfo);

    const onSubmit = async (values) => {
        setIsLoadHarvest(true);

        try {
            const items = values.body.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line) => {
                const match = line.match(/https?:\/\/[^\s，。！？、]+/i);
                const link = match?.[0].replace(/[.,;!?)\]）】]+$/, "") || null;
                return {
                    text: link ? line.replace(link, "").trim() : line,
                    link,
                };
            });

            await ky.post('/api/money/harvest/createWithItems', {
                json: {
                    startTime: formatDateLocal(defaultValues.startTime, "yyyy-MM-dd HH:mm"),
                    title: values.title,
                    userId: userInfoStore?.id,
                    journeyId: defaultValues?.journeyId,
                    journeyType: defaultValues?.journeyType,
                    items,
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
                        <DialogTitle>新增{journeyTypeNames[defaultValues?.journeyType] || "旅程记录"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formSoy" className="">
                                <FieldGroup>
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
                                    <FormField name="body" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>正文</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={8} placeholder="每行一条，可包含一个链接" />
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

export default FormHarvestJourney;
