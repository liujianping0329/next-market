"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea"

import Datepicker from "@/components/datepicker";
import StarBar from "@/components/StarBar";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FormHarvest from "@/app/money/garden/_component/form/FormHarvest";

const MoreOpMenu = ({ open, onOpenChange, target, onSuccess }) => {

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("确认删除？")) return;
        setIsDeleting(true);
        await ky.post('/api/money/harvest/delete', {
            json: { id: target.harvest[0].id }
        }).json();
        onSuccess();
        setIsDeleting(false);
        onOpenChange(false)
    }

    useEffect(() => {
        if (open && !target.harvest.length) {
            toast.error("当前没有可操作的记录");
            onOpenChange(false);
        }
    }, [open, target]);

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[35dvh] flex flex-col px-4 pb-0">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl">更多操作</DrawerTitle>
                        <p className="text-sm text-muted-foreground">
                            同一时间段多条记录时，针对第一条
                        </p>
                    </DrawerHeader>
                    <div className="flex flex-col divide-y pt-2">
                        <FormHarvest trigger={
                            <Button variant="ghost" className="h-14 text-lg">
                                编辑
                            </Button>
                        } defaultValues={target?.harvest?.[0]} onSuccess={() => {
                            onOpenChange(false)
                            onSuccess();
                        }} />
                        <Button variant="ghost" className="h-14 text-lg text-destructive"
                            onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Spinner />}删除
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default MoreOpMenu;