"use client";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useState,
  useMemo,
  useEffect,
} from "react";
import * as holiday_jp from "@holiday-jp/holiday_jp";

import { formatDateLocal } from "@/app/utils/date";
import { addMonths, endOfDay, startOfDay } from "date-fns";
import { toast } from "sonner";

const DateRangePicker = ({ dateDf, onChange, dtFormat = "yyyy-MM-dd", onMonthChange, redPointDates = [] }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(dateDf?.from || dateDf?.to || new Date());

  const holidays = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return holiday_jp.between(start, end).map((item) => {
      return {
        date: new Date(item.date),
        name: item.name
      }
    });
  }, [month]);

  useEffect(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    onMonthChange?.(start, end);
  }, [month, onMonthChange]);

  const calendarSelect = (range) => {
    const nextRange = {
      from: range.from,
      to: range.to ?? undefined,
    };

    if (
      nextRange.from &&
      nextRange.to &&
      nextRange.from.getTime() !== nextRange.to.getTime() &&
      nextRange.to > addMonths(nextRange.from, 1)
    ) {
      toast.error("日期范围最多只能选择一个月");
      return;
    }
    onChange?.(nextRange);
    if (nextRange.from && nextRange.to && nextRange.from.getTime() !== nextRange.to.getTime()) {
      setOpen(false);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="grid grid-cols-2 gap-2">

            <Input className="text-left cursor-pointer" value={dateDf?.from
              ? formatDateLocal(dateDf.from, dtFormat)
              : ""} readOnly placeholder="开始日期" onClick={() => {
                if (dateDf?.from) {
                  setMonth(dateDf.from);
                }
                setOpen(true);
              }} />
            <Input className="text-left cursor-pointer" value={dateDf?.to
              ? formatDateLocal(dateDf.to, dtFormat)
              : ""} readOnly placeholder="结束日期" onClick={() => {
                setOpen(true);
              }} />
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto max-w-108 p-0">
          <Calendar mode="range" selected={dateDf} captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={2}
            className="[--cell-size:28px]"
            classNames={{
              months: "flex flex-row gap-4",
              nav: "absolute top-4 left-0 right-0 flex items-center justify-between px-2",
              button_previous: "relative top-1",
              button_next: "relative top-1",
            }}
            modifiers={{
              holiday: holidays.map(h => h.date),
              weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
              redPointDates
            }}
            modifiersClassNames={{
              holiday: "bg-red-100 text-red-600",
              weekend: "text-blue-600",
              redPointDates: "relative after:absolute after:right-[2px] after:top-[2px] after:h-2 after:w-2 after:rounded-full after:bg-red-500 after:ring-1 after:ring-background after:content-['']",
            }}
            onSelect={calendarSelect}
          />
        </PopoverContent>
      </Popover>

    </>
  );
}

export default DateRangePicker;