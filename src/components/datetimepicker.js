"use client";
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton
} from "@/components/ui/input-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useMemo } from "react";
import { formatDateLocal } from "@/app/utils/date";
import { Clock2Icon } from "lucide-react"

const toHHmm = (d) => {
    if (!d) return "08:00";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

const mergeDateTime = (d, t) => {
    const [hh, mm] = (t || "00:00").split(":");
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    return new Date(year, month, day, Number(hh), Number(mm), 0, 0);
};

const DateTimePicker = ({ dateDf = new Date(), onChange, dtFormat = "yyyy-MM-dd HH:mm" }) => {
    const [date, setDate] = useState(dateDf);
    const [timeStr, setTimeStr] = useState("08:00");
    const [open, setOpen] = useState(false);
    const dateTime = useMemo(() => mergeDateTime(date, timeStr), [date, timeStr]);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Input className="text-left cursor-pointer" id="date" value={formatDateLocal(dateTime, dtFormat)} readOnly />
                </PopoverTrigger>
                <PopoverContent align="start" className="pt-0">
                    <Calendar mode="single" selected={date} captionLayout="dropdown"
                        onSelect={(date) => {
                            if (!date) return;
                            setDate(date);
                        }} className="text-sm" />
                    <Field>
                        <FieldLabel htmlFor="time-from">开始时间</FieldLabel>
                        <div className="flex gap-2 justify-between items-center">
                            <InputGroup>
                                <InputGroupAddon>
                                    <Clock2Icon className="text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="time-from" type="time" value={timeStr}
                                    onChange={(e) => setTimeStr(e.target.value)}
                                    className="flex-1 w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </InputGroup>
                            <Button variant="default" size="sm"
                                onClick={() => {
                                    onChange(dateTime)
                                    setOpen(false)
                                }}>
                                确定
                            </Button >
                        </div>
                    </Field>
                </PopoverContent>
            </Popover >
        </>
    );
}

export default DateTimePicker;