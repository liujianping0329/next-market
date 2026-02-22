"use client";
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
import { Textarea } from "@/components/ui/textarea";
import ky from "ky";
import { useForm } from "react-hook-form";


const FormSoy = ({ onSuccess, btnStatus }) => {
    const form = useForm({
        defaultValues: {
            titles: ""
        }
    });

    const onSubmit = async (values) => {
        btnStatus(true);

        await ky.post('/api/money/garden/upsert', {
            json: values.titles.split("\n").map(t => t.trim()).filter(Boolean).map(title => ({
                title,
                topic: "SoyBean",
                status: "1"
            }))
        }).json();
        onSuccess();
        btnStatus(false);
    }

    return (
        <>
            <div className="w-full max-h-dvh overflow-y-auto overscroll-contain">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formSoy" className="">
                        <FieldGroup>
                            <FormField name="titles" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>每行对应一条记录</FormLabel>
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
        </>
    );
}

export default FormSoy;