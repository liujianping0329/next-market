import {
  formatDateLocal, parseLocalDate
} from "@/app/utils/date";
import * as holiday_jp from "@holiday-jp/holiday_jp";
import {
  useMemo,
} from "react";


const weekMap = ["日", "月", "火", "水", "木", "金", "土"]
export default function MonthInfo({ startDateStr, endDateStr = formatDateLocal(new Date()), monthData, selDate, setSelDate }) {

  const monthStartDate = parseLocalDate(startDateStr);
  monthStartDate.setDate(1);

  const monthEndDate = parseLocalDate(startDateStr);
  monthEndDate.setMonth(monthEndDate.getMonth() + 1);
  monthEndDate.setDate(0);

  const startDate = parseLocalDate(startDateStr);
  const endDate = parseLocalDate(endDateStr);

  const holidays = useMemo(() => {
    return holiday_jp.between(monthStartDate, monthEndDate);
  }, [startDateStr]);

  const getDateRangeArray = () => {
    const result = [];

    let currentDate = new Date(monthStartDate);

    while (currentDate <= monthEndDate) {
      const dateStr = formatDateLocal(currentDate);

      const dateObj = {
        dateDis: dateStr.slice(8),
        dateStr,
      };

      if (currentDate < startDate || currentDate > endDate) {
        dateObj.greyOut = 1;
      }

      result.push(dateObj);

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const firstDay = monthStartDate.getDay();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...result,
    ];
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-7 gap-2 text-center py-1 rounded-lg border border-slate-200 p-2 bg-slate-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`${i === 0 ? "text-red-500" : i === 6 ? "text-sky-500" : ""}`} >
            {weekMap[i]}
          </div>
        ))}
      </div>
      <div className="my-2 grid grid-cols-7 gap-2 text-center py-1 rounded-lg border border-slate-200 p-2">
        {getDateRangeArray().map((item, i) => {
          const dayData = monthData?.find((d) => d.date === item?.dateStr);
          const holidayName = item
            ? holidays?.find((h) => formatDateLocal(h.date) === item.dateStr)?.name
            : null;
          return (
            <div key={i} className={`rounded-sm
            ${i % 7 === 0 ? "text-red-500" : i % 7 === 6 ? "text-sky-500" : ""}
            ${item?.greyOut === 1 ? "text-slate-300" : ""}
            ${holidayName ? "text-red-500" : ""}
          ${selDate === item?.dateStr ? "shadow-[inset_0_0_0_2px_rgb(14_165_233)]" : ""}
          ${!dayData || Number(dayData.total) <= 0 ? "text-slate-400" : ""}
          `}
              onClick={() => {
                if (!item) return;
                if (item.greyOut === 1) return;
                if (!dayData || Number(dayData.total) <= 0) return;
                setSelDate(item?.dateStr);
              }}>
              <div className="leading-5">
                {item?.dateDis}
              </div>

              {holidayName && (
                <div className="mt-0.5 truncate text-[9px] leading-3 text-red-400">
                  {holidayName}
                </div>
              )}

              {dayData?.total > 0 && (
                <div className="mt-0.5 text-[10px] leading-3 text-orange-400 tabular-nums">
                  {dayData.total}
                </div>
              )}

            </div>)
        })}
      </div>
    </div>
  );
}