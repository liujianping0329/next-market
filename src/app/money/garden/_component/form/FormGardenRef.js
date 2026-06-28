"use client";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import ky from "ky";
import { useState } from "react";
import { useForm } from "react-hook-form";

const FormGardenRef = ({ trigger, onSuccess, defaultValues = null }) => {

    const [openGardenRef, setOpenGardenRef] = useState(false);
    const [isLoadGardenRef, setIsLoadGardenRef] = useState(false);
    const form = useForm({
        defaultValues: {
            refInfo: Array.isArray(defaultValues?.refInfo)
                ? defaultValues.refInfo
                    .map((item) => `${item.name ?? ""} ${item.url ?? ""}`.trim())
                    .join("\n")
                : "",
        }
    });

    const onSubmit = async (values) => {
        setIsLoadGardenRef(true);
        await ky.post('/api/garden_ext/upsert', {
            json: {
                ...(defaultValues?.id ? { id: defaultValues.id } : { gardenId: defaultValues.gardenId }),
                refInfo: values.refInfo.split("\n").map(t => t.trim()).filter(Boolean).map((ref) => {
                    const [name, url] = ref.split(/[\s　]+/);

                    return { name, url };
                })
            },
        }).json();
        onSuccess();
        setIsLoadGardenRef(false);
        setOpenGardenRef(false);
        form.reset();
    }

    return (
        <>
            <Dialog open={openGardenRef} onOpenChange={setOpenGardenRef}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>参考信息</DialogTitle>
                    </DialogHeader>
                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="formGardenRef" className="">
                                <FieldGroup>
                                    <FormField name="refInfo" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>每行对应一条参考信息，名称和链接空格隔开</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[120px] resize-none" />
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
                        <Button type="submit" form="formGardenRef" disabled={isLoadGardenRef}>
                            {isLoadGardenRef && <Spinner />}保存
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog>
        </>
    );
}

export default FormGardenRef;
