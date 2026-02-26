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
} from "@/components/ui/input-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";
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
    const merged = new Date(d);
    merged.setHours(Number(hh), Number(mm), 0, 0);
    return merged;
};

const Datepicker = ({ dateDf, onChange, dtFormat = "yyyy-MM-dd", withTime = false }) => {
    const [date, setDate] = useState(dateDf);
    const [time, setTime] = useState("08:00");
    const [open, setOpen] = useState(false);

    const calendarSelect = (date) => {
        if (!date) return;
        setDate(date);
        onChange(withTime ? mergeDateTime(date, time) : date);
        alert(withTime ? mergeDateTime(date, time) : date)
        setOpen(false);
    }

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Input className="text-left cursor-pointer" id="date" value={formatDateLocal(
                        withTime ? mergeDateTime(date, time) : date, dtFormat)} readOnly />
                </PopoverTrigger>
                <PopoverContent align="start" className="pt-0">
                    <Calendar mode="single" selected={date} captionLayout="dropdown"
                        onSelect={calendarSelect} className="text-sm" />
                    {withTime &&
                        <Field>
                            <FieldLabel htmlFor="time-from">开始时间</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="time-from" type="time" value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                                <InputGroupAddon>
                                    <Clock2Icon className="text-muted-foreground" />
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>}
                </PopoverContent>
            </Popover>

        </>
    );
}

export default Datepicker;