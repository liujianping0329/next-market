"use client";
import { useState } from "react";

import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel
} from "@/components/ui/form";
import { FieldGroup } from "@/components/ui/field";
import ky from "ky";
import { Textarea } from "@/components/ui/textarea"
import StarBar from "@/components/StarBar";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/app/money/garden/_store/userStore";
import PicUploaderAdvance from "@/components/PicUploaderAdvance";

const FormGardenRemark = ({ trigger, onSuccess, defaultValues, detail }) => {
    const [openGardenRemark, setOpenGardenRemark] = useState(false);
    const [isLoadGardenRemark, setIsLoadGardenRemark] = useState(false);
    const userInfoStore = useUserStore(state => state.userInfo);
    const [picUrls, setPicUrls] = useState([]);

    const form = useForm({
        defaultValues: {
            point: defaultValues?.point || 3,
            remark: defaultValues?.remark || ""
        }
    });

    const onSubmit = async (values) => {
        setIsLoadGardenRemark(true);
        await ky.post('/api/garden_remark/upsert', {
            json: {
                id: defaultValues?.id, ...values,
                pics: picUrls,
                userId: userInfoStore?.id,
                gardenId: detail.id,
            }
        }).json();
        onSuccess();
        setOpenGardenRemark(false);
        setIsLoadGardenRemark(false);
        form.reset();
    }

    return (
        <>
            <Drawer open={openGardenRemark} onOpenChange={setOpenGardenRemark}>
                <DrawerTrigger asChild>
                    {trigger}
                </DrawerTrigger>
                <DrawerContent className="h-[70dvh] flex flex-col px-4 pb-4">
                    <DrawerHeader>
                        <DrawerTitle>点评</DrawerTitle>
                    </DrawerHeader>
                    <div data-scroll className={`flex-1 min-h-0 overflow-y-auto px-4`}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGardenRemark" className="">
                                <FieldGroup>
                                    <FormField name="point" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>分数</FormLabel> */}
                                                <FormControl>
                                                    <StarBar {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormItem>
                                        <FormLabel>图片上传</FormLabel>
                                        <FormControl>
                                            <PicUploaderAdvance defaultPics={defaultValues?.pics} onChange={setPicUrls} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormField name="remark" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>内容</FormLabel> */}
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[120px] resize-none"
                                                        onFocus={(e) => {
                                                            setTimeout(() => {
                                                                const scroller = e.target.closest("[data-scroll]")
                                                                scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" })
                                                            }, 350)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                </FieldGroup>
                            </form>
                        </Form>
                    </div>
                    <DrawerFooter className="pt-4">
                        <Button type="submit" form="formGardenRemark" disabled={isLoadGardenRemark}>
                            {isLoadGardenRemark && <Spinner />}保存
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default FormGardenRemark;