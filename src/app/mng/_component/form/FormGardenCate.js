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
import { Textarea } from "@/components/ui/textarea";
const parseChildren = (text = "") => {
    const children = [];
    let currentChild = null;

    text.split("\n").forEach((rawLine) => {
        if (!rawLine.trim()) return;

        // 半角空格开头：三级目录
        if (rawLine.startsWith(" ")) {
            if (!currentChild) return;

            const grandchildren = rawLine
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map((name) => ({
                    name,
                    value: slugify(name, {
                        separator: "",
                    }),
                }));

            currentChild.children.push(...grandchildren);
            return;
        }

        // 不以半角空格开头：二级目录
        const name = rawLine.trim();

        currentChild = {
            name,
            value: slugify(name, {
                separator: "",
            }),
            children: [],
        };

        children.push(currentChild);
    });

    return children;
};

const CHILDREN_EXAMPLE = [
    "主食",
    " 米饭 面条 馒头",
    "肉类",
    " 牛肉 猪肉 鸡肉",
    "饮料",
    " 咖啡 茶 果汁",
].join("\n");


const FormGardenCate = ({ trigger, openGardenCateCtrl, setOpenGardenCateCtrl, onSuccess, defaultValues = null, userInfo, isAddChild = false }) => {

    const [openGardenCate, setOpenGardenCate] = useState(false);
    const [isLoadGardenCate, setIsLoadGardenCate] = useState(false);

    const userInfoStore = useUserStore(state => state.userInfo);
    const form = useForm({
        defaultValues: {
            name: defaultValues?.name || "",
            ...((!defaultValues?.id || isAddChild) && { children: "" }),
        }
    });

    const onSubmit = async (values) => {
        setIsLoadGardenCate(true);

        try {
            if (isAddChild) {
                await ky.post("/api/garden_cate/upsertWithChildren", {
                    json: {
                        id: defaultValues.id,
                        planetId: userInfoStore.planet?.id,
                        children: parseChildren(values.children),
                    },
                }).json();
            } else {
                await ky.post('/api/garden_cate/upsertWithChildren', {
                    json: {
                        ...(defaultValues?.id && { id: defaultValues.id }),
                        planetId: userInfoStore.planet?.id,
                        name: values.name,
                        value: slugify(values.name, {
                            separator: "",
                        }),
                        ...(!defaultValues?.id && {
                            children: parseChildren(values.children),
                        }),
                    }
                }).json();
            }

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
                                    {!isAddChild &&
                                        <FormField name="name" control={form.control}
                                            render={({ field }) => (
                                                <FormItem className="">
                                                    <FormLabel>类目名称</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />}
                                    {(!defaultValues?.id || isAddChild) && <FormField name="children" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between gap-3">
                                                    <FormLabel>子类目</FormLabel>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => {
                                                            form.setValue("children", CHILDREN_EXAMPLE);
                                                        }}
                                                    >
                                                        输入示例
                                                    </Button>
                                                </div>
                                                <p className="text-xs leading-5 text-muted-foreground">
                                                    每行一个二级类目；三级类目以前导半角空格开头，并用空格分隔。
                                                </p>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[120px] resize-none" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />}
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