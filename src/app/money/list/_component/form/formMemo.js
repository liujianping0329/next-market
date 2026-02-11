"use client";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldSeparator
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import ky from "ky";

import Datepicker from "../../../../../components/datepicker";
import { formatDateLocal } from "@/lib/date";

const FormMemo = ({ onSuccess, btnStatus }) => {
    const form = useForm({
        defaultValues: {
            date: new Date(),
            price: 0,
            kind: "家电",
            memo: ""
        }
    });

    const onSubmit = async (values) => {
        btnStatus(true);
        await ky.post('/api/money/memo/upsert', {
            json: {...values, date: formatDateLocal(values.date)}
        }).json();
        onSuccess();
        btnStatus(false);
    }
    
    return (
        <>
            <div className="w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="formMemo" className="">
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
                            <FormField name="price" control={form.control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>价格（万日元）</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" inputMode="decimal" value={field.value}
                                            onChange={(e) => {
                                                const n = e.target.valueAsNumber;
                                                field.onChange(Number.isNaN(n) ? 0 : n);
                                            }}
                                            onBlur={() => field.onChange(Number(field.value.toFixed(2)))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField name="kind" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>种类</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <SelectTrigger className="w-full">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="家电">家电</SelectItem>
                                                <SelectItem value="旅游">旅游</SelectItem>
                                                <SelectItem value="吃饭">吃饭</SelectItem>
                                                <SelectItem value="衣服">衣服</SelectItem>
                                                <SelectItem value="游戏">游戏</SelectItem>
                                                <SelectItem value="其他">其他</SelectItem>
                                              </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField name="memo" control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>备注</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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

export default FormMemo;