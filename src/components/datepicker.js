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
import { useState, useMemo } from "react";
import * as holiday_jp from "@holiday-jp/holiday_jp";
import { DayButton as DefaultDayButton } from "react-day-picker";
import { pullToZero, pushToLast, pullToHour, diffHours, formatDateLocal, changeDay, parseLocalDate, changeHour } from "@/app/utils/date";

const Datepicker = ({ dateDf, onChange, dtFormat = "yyyy-MM-dd" }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  const calendarSelect = (date) => {
    onChange(date);
    setOpen(false);
  }

  const holidays = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    console.log(holiday_jp.between(start, end).map((item) => {
      return {
        date: new Date(item.date),
        name: item.name
      }
    }));

    return holiday_jp.between(start, end).map((item) => {
      return {
        date: new Date(item.date),
        name: item.name
      }
    });
  }, [month]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input className="text-left cursor-pointer" id="date" value={formatDateLocal(dateDf, dtFormat)} readOnly />
        </PopoverTrigger>
        <PopoverContent align="start">
          <Calendar mode="single" selected={dateDf} captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            modifiers={{ holiday: holidays.map(h => h.date) }}
            modifiersClassNames={{
              holiday: "bg-red-100 text-red-600"
            }}
            onSelect={calendarSelect}
          />
        </PopoverContent>
      </Popover>

    </>
  );
}

export default Datepicker;