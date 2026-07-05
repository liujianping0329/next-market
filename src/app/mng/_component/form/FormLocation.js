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
    useState
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUserStore } from "@/app/money/garden/_store/userStore";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

import { AlertTriangle } from "lucide-react";





const FormLocationItems = ({ trigger, openLocationCtrl, setOpenLocationCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [openLocation, setOpenLocation] = useState(false);
    const [isLoadLocation, setIsLoadLocation] = useState(false);
    const [canGetLocation, setCanGetLocation] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const userInfoStore = useUserStore(state => state.userInfo);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.name || "",
            lat: defaultValues?.lat || 0,
            lng: defaultValues?.lng || 0,
            radius: defaultValues?.radius || 50,
        }
    });

    useEffect(() => {
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = Number(position.coords.latitude.toFixed(8));
                const longitude = Number(position.coords.longitude.toFixed(8));

                form.setValue("lat", latitude);
                form.setValue("lng", longitude);
                setIsGettingLocation(false);
            },
            (error) => {
                setCanGetLocation(false);
                console.error("获取地理位置失败:", error.message);
            }
        );
    }, []);

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
                    radius: values.radius,
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
                    {isGettingLocation && (
                        <Alert>
                            <Spinner />
                            <AlertTitle>正在获取当前位置</AlertTitle>
                            <AlertDescription>
                                浏览器可能会请求定位权限，请允许后继续。
                            </AlertDescription>
                        </Alert>
                    )}
                    {!canGetLocation && <Alert variant="destructive" className="">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>注意</AlertTitle>
                        <AlertDescription>
                            无法获取地理位置，请检查浏览器权限设置。
                        </AlertDescription>
                    </Alert>}

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
                                    <FormField name="radius" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>半径</FormLabel>
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