"use client";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldSeparator
} from "@/components/ui/field"
import Datepicker from "../datepicker";
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { formatDateLocal } from "../../../../../lib/date";
import ky from "ky";


const FormL = ({ onSuccess, exchanges }) => {
    const form = useForm({
        defaultValues: {
            date: new Date(),
            jpyL: "",
            zfb: "",
            cnbj: "",
            zsbc: ""
        }
    });
    const onSubmit = async (values) => {
        await ky.post('/api/money/upsert', {
          json: {
            ...values,
            date : formatDateLocal(values.date),
            from : "L",
            ...exchanges
          }
        }).json();
        onSuccess();
    }

    return (
            <>
            <div className="w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formL" className="">
                <FieldGroup>
                    <FieldSet>
                        <FieldGroup>
                            <FormField name="date" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>日期</FormLabel>
                                        <FormControl>
                                            <Datepicker dateDf={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField name="jpyL" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>日币（万）</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField name="zfb" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>支付宝</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <FieldSet>
                        <FieldLabel>金库</FieldLabel>
                        <FieldGroup>
                            <FormField name="cnbj" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>中行日元（万）</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField name="zsbc" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>招行人民币</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
                </form>
                </Form>
            </div>
            </>
    );
}

export default FormL;