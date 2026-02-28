import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState, useRef } from "react";
import FormSoy from "../form/FormSoy";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2, ChevronRight, ChevronsRight } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";
import FolderOpBar from "./soy/FolderOpBar";
import Datepicker from "@/components/datepicker";
import { pullToZero, pushToLast, pullToHour, diffHours, formatDateLocal, changeDay } from "@/app/utils/date";
import { id } from "date-fns/locale";

const Harvest = () => {

    const [startTime, setStartTime] = useState(new Date());

    const [editVer, setEditVer] = useState(0);

    const [timelist, setTimeList] = useState([]);

    const timeConst = Array.from({ length: 14 }).map((_, i) => i + 8);     // 1-12 冻结列
    const rest = Array.from({ length: 98 }).map((_, i) => i + 1);           // 13+ 右侧滚动区
    const header = Array.from({ length: 8 }).map((_, i) => {
        const curDt = pullToZero(startTime, i - 1);
        const weekMap = ["日", "月", "火", "水", "木", "金", "土"]

        return i == 0 ? "日程" : `${formatDateLocal(curDt, "MM/dd")}(${weekMap[curDt.getDay()]})`
    });

    const headerScrollRef = useRef(null);
    const bodyScrollRef = useRef(null);

    const fetchList = async () => {
        console.log(3)
        const response = await ky.post('/api/money/harvest/list/match', {
            json: {
                startTime__gte: formatDateLocal(pullToZero(startTime), "yyyy-MM-dd HH:mm"),
                startTime__lt: formatDateLocal(
                    changeDay(pullToZero(startTime), 7), "yyyy-MM-dd HH:mm"),
            }
        }).json();
        console.log(4)
        let dbList = response.list;
        let allTimes = Array.from({ length: 24 * 7 }).map((_, i) => {
            return {
                no: i,
                hidden: i % 24 <= 7 || i % 24 >= 22,
                harvest: []
            };
        });
        dbList.forEach(element => {
            const index = diffHours(pullToHour(element.startTime), pullToZero(startTime))
            allTimes[index].harvest.push(element)
            element.index = index
        });
        console.log("dbList", dbList);
        setTimeList(allTimes);
        console.log("allTimes", allTimes);
        setEditVer(prev => prev + 1);
    }

    useEffect(() => {
        fetchList(startTime);
    }, [startTime]);

    return (
        <>
            <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        规划种草执行的记录，包含旅游计划等，记录执行情况和结果，方便以后回顾和总结。
                    </span>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center gap-3">
                            <Datepicker dateDf={startTime} dtFormat="MM/dd" onChange={(date) => {
                                setStartTime(date);
                            }} />
                            <ActionButton icon={ChevronRight} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 py-2 sticky top-0 z-30 bg-background border-b">
                <div ref={headerScrollRef}
                    className="h-[35px] gap-3 flex overflow-x-hidden items-center font-medium">
                    {header.map((n, i) => (
                        <div
                            key={n}
                            className={`
                                h-full border rounded flex items-center justify-center shrink-0
                                ${i === 0 ? "w-[36px]" : "w-[166px]"}
                            `}
                        >
                            {n}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4">
                <div className="flex gap-3">
                    {/* 左侧冻结列（不滚动） */}
                    <div className="grid gap-3 shrink-0 [grid-template-rows:repeat(14,50px)] w-[36px]">
                        {timeConst.map((n) => (
                            <div
                                key={n}
                                className="h-[50px] border rounded flex items-center justify-center"
                            >
                                {n}
                            </div>
                        ))}
                    </div>

                    {/* 右侧滚动区（横向滚动） */}
                    <div ref={bodyScrollRef}
                        onScroll={(e) => {
                            const fromEl = e.currentTarget;
                            const toEl = headerScrollRef.current;
                            toEl.scrollLeft = fromEl.scrollLeft;
                        }}
                        className="overflow-x-auto flex-1">
                        <div
                            className="min-w-max grid grid-flow-col gap-3 [grid-template-rows:repeat(14,50px)] auto-cols-[166px] " >
                            {timelist.map((n) => (
                                <div
                                    key={n.no}
                                    className={`h-[50px] border rounded flex items-center justify-center ${n.hidden ? "hidden" : ""
                                        }`}>
                                    {n.harvest?.[0]?.title}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Harvest;