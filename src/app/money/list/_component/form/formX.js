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

const FormX = ({ onSuccess, exchanges }) => {
    const form = useForm({
        defaultValues: {
            date: new Date(),
            jpyX: "",
            twd: "",
            nisaX: ""
        }
    });

    const onSubmit = async (values) => {
        alert(JSON.stringify(exchanges, null, 2));
        await ky.post('/api/money/upsert', {
          json: {
            ...values,
            date : formatDateLocal(values.date),
            from : "X",
            ...exchanges
          }
        }).json();
        onSuccess();
    }
    return (
        <>
            <div className="w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formX" className="">
                <FieldGroup>
                    <FieldSet>
                        <FieldGroup>
                            {/* <Field>
                                <FieldLabel htmlFor="dateX">日期</FieldLabel>
                                <Datepicker dateDf={new Date()} />
                            </Field> */}
                            <FormField name="date" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>日期</FormLabel>
                                    <FormControl>
                                        <Datepicker
                                          dateDf={field.value}
                                          onChange={field.onChange}  
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <Field>
                                <FieldLabel htmlFor="jpyX">日币（万）</FieldLabel>
                                <Input id="jpyX" type="text" placeholder="请输入金额" />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="twdX">台币</FieldLabel>
                                <Input id="twdX" type="text" placeholder="请输入金额" />
                            </Field> */}
                            <FormField name="jpyX" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>日币（万）</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField name="twd" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>台币</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <FieldSet>
                        <FieldLabel>投资</FieldLabel>
                        <FieldGroup>
                            {/* <Field>
                                <FieldLabel htmlFor="nisaX">NISA（万jpy）</FieldLabel>
                                <Input id="nisaX" type="text" placeholder="请输入金额" />
                            </Field> */}
                            <FormField name="nisaX" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NISA（万jpy）</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
                </form>
                </Form>
            </div>
        </>
    )
}

export default FormX;