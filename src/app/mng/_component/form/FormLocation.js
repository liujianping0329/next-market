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
    useState
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUserStore } from "@/app/money/garden/_store/userStore";





const FormLocationItems = ({ trigger, openLocationCtrl, setOpenLocationCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [openLocation, setOpenLocation] = useState(false);
    const [isLoadLocation, setIsLoadLocation] = useState(false);

    const userInfoStore = useUserStore(state => state.userInfo);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.name || "",
            lat: defaultValues?.lat || 0,
            lng: defaultValues?.lng || 0,
        }
    });

    const onSubmit = async (values) => {
        setIsLoadLocation(true);

        try {
            await ky.post('/api/location/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    planetId: userInfoStore.planet?.id,
                    name: values.name,
                    lat: values.lat,
                    lng: values.lng,
                }
            }).json();
            onSuccess();
            setOpenLocationCtrl ? setOpenLocationCtrl(false) : setOpenLocation(false);
            form.reset();
        } catch (error) {
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadLocation(false);
        }
    }

    return (
        <>
            <Dialog open={openLocationCtrl ?? openLocation} onOpenChange={setOpenLocationCtrl ?? setOpenLocation}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formLocation" className="">
                                <FieldGroup className="gap-4">
                                    <FormField name="name" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>地点名称</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="lat" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>纬度</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="lng" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>经度</FormLabel>
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
                        <Button type="submit" form="formLocation" disabled={isLoadLocation}>
                            {isLoadLocation && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormLocationItems;