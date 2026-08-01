"use client";

import DateTimePicker from "@/components/datetimepicker";
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
import {
    formatDateLocal,
    parseLocalDateTime,
} from "@/app/utils/date";
import supabase from "@/app/utils/database";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { decode } from "@/app/utils/base64";
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/app/money/garden/_store/userStore";
const FormHarvestJourney = ({ trigger, openHarvestCtrl, setOpenHarvestCtrl, onSuccess, defaultValues = null, needPassCode = false }) => {
    const [openHarvest, setOpenHarvest] = useState(false);
    const [isLoadHarvest, setIsLoadHarvest] = useState(false);
    const [passCodeGarden, setPassCodeGarden] = useState(null);
    const form = useForm({
        defaultValues: {
            title: defaultValues?.title || "",
        }
    });

    const userInfoStore = useUserStore(state => state.userInfo);

    useEffect(() => {
        if (needPassCode && (openHarvest || openHarvestCtrl)) {
            const loadPassCode = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        let passCodeObj = decode(text);
                        console.log(passCodeObj)
                        setPassCodeGarden(passCodeObj);

                        form.setValue("title", passCodeObj.title ?? "");
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
            const response = await ky.post('/api/money/harvest/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    startTime: formatDateLocal(defaultValues.startTime, "yyyy-MM-dd HH:mm"),
                    ...values,
                    ...(passCodeGarden && { gardenId: passCodeGarden.id }),
                    ...(defaultValues?.gardenId && { gardenId: defaultValues.gardenId }),
                    userId: userInfoStore?.id,
                    journeyId: defaultValues?.journeyId,
                    journeyType: defaultValues?.journeyType,
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

export default FormHarvestJourney;