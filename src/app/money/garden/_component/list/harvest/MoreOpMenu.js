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

const MoreOpMenu = ({ open, onOpenChange }) => {

    const handleUpdate = async () => {
        onOpenChange(false)
    }

    const handleDelete = async () => {
        if (!confirm("确认删除？")) return;

        onOpenChange(false)
    }

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[30dvh] flex flex-col px-4 pb-4">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl">更多操作</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col divide-y pt-2">
                        <Button variant="ghost" className="h-14 text-lg"
                            onClick={handleUpdate}>
                            编辑
                        </Button>
                        <Button variant="ghost" className="h-14 text-lg text-destructive"
                            onClick={handleDelete}>
                            删除
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default MoreOpMenu;