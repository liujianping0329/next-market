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

const FormGardenCateExport = ({ trigger, openCtrl, setOpenCtrl, onSuccess, defaultValues = null, userInfo }) => {

    const [open, setOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);

    const form = useForm({
        defaultValues: {
            prompt: "",
            needAll: false,
        }
    });

    useEffect(() => {
        const getPrompt = async () => {
            setIsLoad(true);
            const response = await ky.post('/api/constants/list/match', {
                json: {
                    category: "GardenCateExport"
                }
            }).json();

            form.setValue("prompt", response.list[0]?.value || "");
            setIsLoad(false);
        }
        if (openCtrl ?? open) {
            getPrompt();
        }
    }, [openCtrl ?? open]);

    const onSubmit = async (values) => {
        setIsLoad(true);

        try {
            const response = await ky.post('/api/garden_cate/list/matchTheGarden', {
                json: {
                    id: defaultValues.id,
                    prompt: values.prompt,
                    needAll: values.needAll,
                }
            }).json();

            const cleanCate = ({
                created_at,
                value,
                planetId,
                status,
                children = [],
                ...rest
            }) => ({
                ...rest,
                ...(children.length > 0 && {
                    children: children.map(cleanCate),
                }),
            });

            const {
                children = [],
                ...parentRest
            } = cleanCate(defaultValues);

            const jsonText = JSON.stringify({
                ...parentRest,
                gardenList: response.gardenList,
                labels: children,
            });

            const clipboardText = [
                "<<json_start>>",
                jsonText,
                "<<json_end>>",
                "",
                values.prompt,
            ].join("\n");

            await navigator.clipboard.writeText(clipboardText);
            toast.success("提示词生成成功,请输入至AI")
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
                        <DialogTitle>导出生成类目数据AI信息</DialogTitle>
                    </DialogHeader>

                    <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} id="form" className="">
                                <FieldGroup className="gap-4">
                                    <FormField name="prompt" control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>AI补充提示词</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[120px] resize-none" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <div className="flex space-x-3">
                                        <FormField control={form.control} name="needAll" defaultValue={false}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start items-center space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={(checked) => field.onChange(checked === true)}
                                                            className="h-5 w-5 border-2 border-gray-500 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="mr-0">需要全部重新生成</FormLabel>
                                                </FormItem>
                                            )} />
                                    </div>
                                </FieldGroup>
                            </form>
                        </Form>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">关闭</Button>
                        </DialogClose>
                        <Button type="submit" form="form" disabled={isLoad}>
                            {isLoad && <Spinner />}保存AI提示词到剪贴板
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormGardenCateExport;