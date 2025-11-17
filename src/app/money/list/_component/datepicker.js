"use client";
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";
import { formatDateLocal } from "../../../../lib/date";

const Datepicker = ({ dateDf, onChange }) => {
    const [date, setDate] = useState(dateDf);
    const [open, setOpen] = useState(false);
    

    const calendarSelect = (date) => {
        setDate(date);
        onChange(date);
        setOpen(false);
    }
    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Input className="text-left cursor-pointer" id="date" value={formatDateLocal(date)} readOnly />
                </PopoverTrigger>
                <PopoverContent align="start">
                    <Calendar mode="single" selected={date} captionLayout="dropdown"
                    onSelect={calendarSelect} />
                </PopoverContent>
            </Popover>
            
        </>
    );
}

export default Datepicker;