import {
  formatDateLocal, parseLocalDate
} from "@/app/utils/date";
import {
  useState,
} from "react";

const weekMap = ["日", "月", "火", "水", "木", "金", "土"]
export default function MonthInfo({ startDateStr, endDateStr = formatDateLocal(new Date()) }) {
  const [selDate, setSelDate] = useState(endDateStr);
  const getDateRangeArray = () => {
    const result = [];

    let startDate = parseLocalDate(startDateStr);
    const endDate = parseLocalDate(endDateStr);

    while (startDate <= endDate) {
      result.push({
        dateDis: formatDateLocal(startDate).slice(8),
        dateStr: formatDateLocal(startDate),
      });

      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate() + 1);
    }

    const firstDay = parseLocalDate(startDateStr).getDay();

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
      <div className="mt-2 grid grid-cols-7 gap-2 text-center py-1 rounded-lg border border-slate-200 p-2">
        {getDateRangeArray().map((item, i) => (
          <div key={i} className={`rounded-sm 
            ${i % 7 === 0 ? "text-red-500" : i % 7 === 6 ? "text-sky-500" : ""}
          ${selDate === item?.dateStr ? "bg-sky-200" : ""}
          `} >
            {item?.dateDis}
          </div>
        ))}
      </div>
    </div>
  );
}