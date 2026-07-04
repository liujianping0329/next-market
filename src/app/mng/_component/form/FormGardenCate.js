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
import { slugify } from "transliteration";

const FormGardenCate = ({ trigger, openGardenCateCtrl, setOpenGardenCateCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [openGardenCate, setOpenGardenCate] = useState(false);
    const [isLoadGardenCate, setIsLoadGardenCate] = useState(false);

    const userInfoStore = useUserStore(state => state.userInfo);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.name || "",
            parentId: defaultValues?.parentId || 0,
        }
    });

    const onSubmit = async (values) => {
        setIsLoadGardenCate(true);

        try {
            await ky.post('/api/garden_cate/upsert', {
                json: {
                    ...(defaultValues?.id && { id: defaultValues.id }),
                    planetId: userInfoStore.planet?.id,
                    name: values.name,
                    parentId: values.parentId,
                    value: slugify(values.name, {
                        separator: "",
                    }),
                }
            }).json();
            onSuccess();
            setOpenGardenCateCtrl ? setOpenGardenCateCtrl(false) : setOpenGardenCate(false);
            form.reset();
        } catch (error) {
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoadGardenCate(false);
        }
    }

    return (
        <>
            <Dialog open={openGardenCateCtrl ?? openGardenCate} onOpenChange={setOpenGardenCateCtrl ?? setOpenGardenCate}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{defaultValues?.id ? "修改" : "新增"}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGardenCate" className="">
                                <FieldGroup className="gap-4">
                                    <FormField name="name" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>类目名称</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField name="parentId" control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>父类目</FormLabel>
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
                        <Button type="submit" form="formGardenCate" disabled={isLoadGardenCate}>
                            {isLoadGardenCate && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormGardenCate;