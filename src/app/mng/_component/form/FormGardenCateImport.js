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
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import {
    useEffect,
    useState
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const FormGardenCateImport = ({ trigger, openCtrl, setOpenCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [open, setOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);

    const form = useForm({
        defaultValues: {
            aiAnswers: ""
        }
    });

    useEffect(() => {
        const getAiAnswers = async () => {
            const text = await navigator.clipboard.readText();

            form.setValue("aiAnswers", text);
        }
        if (openCtrl ?? open) {
            getAiAnswers();
        }
    }, [openCtrl ?? open]);

    const onSubmit = async (values) => {
        setIsLoad(true);

        try {
            const response = await ky.post('/api/garden_labels/upsert/addBatch', {
                json: {
                    info: JSON.parse(values.aiAnswers)
                }
            }).json();
            onSuccess();

            setOpenCtrl ? setOpenCtrl(false) : setOpen(false);
            form.reset();
        } catch (error) {
            const { errorMsg } = await error.response.json();
            toast.error(errorMsg);
        } finally {
            setIsLoad(false);
        }
    }

    return (
        <>
            <Dialog open={openCtrl ?? open} onOpenChange={setOpenCtrl ?? setOpen}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>导入类目数据</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="form" className="">
                                <FieldGroup className="gap-4">
                                    <FormField name="aiAnswers" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>AI答案</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[120px] max-h-[420px] resize-none" />
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
                        <Button type="submit" form="form" disabled={isLoad}>
                            {isLoad && <Spinner />}保存AI答案
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormGardenCateImport;