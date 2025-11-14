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

const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
};

const Datepicker = ({ dateDf }) => {
    const [date, setDate] = useState(dateDf);
    const [open, setOpen] = useState(false);
    

    const calendarSelect = (date) => {
        setDate(date);
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