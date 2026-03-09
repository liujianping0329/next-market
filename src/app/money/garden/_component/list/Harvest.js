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
import { pullToZero, pushToLast, pullToHour, diffHours, formatDateLocal, changeDay, parseLocalDate, changeHour } from "@/app/utils/date";
import { id } from "date-fns/locale";
import FormHarvest from "../form/FormHarvest";
import useLongPress from "@/app/hooks/useLongPress";
import MoreOpMenu from "@/app/money/garden/_component/list/harvest/MoreOpMenu";
import HarvestDetail from "@/app/money/garden/_component/detail/HarvestDetail";
import { AlertCircle } from "lucide-react";

const Harvest = () => {

    const [startTime, setStartTime] = useState(new Date());

    const [editVer, setEditVer] = useState(0);

    const [timelist, setTimeList] = useState([]);

    const [moreOpMenuOpen, setMoreOpMenuOpen] = useState(false);
    const [moreOpMenuTarget, setMoreOpMenuTarget] = useState(null);
    const [emptyBlockAddOpen, setEmptyBlockAddOpen] = useState(false);
    const [emptyBlockAddTarget, setEmptyBlockAddTarget] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);

    const timeConst = Array.from({ length: 14 }).map((_, i) => i + 8);     // 1-12 冻结列
    const rest = Array.from({ length: 98 }).map((_, i) => i + 1);           // 13+ 右侧滚动区
    const header = Array.from({ length: 8 }).map((_, i) => {
        const curDt = pullToZero(startTime, i - 1);
        const weekMap = ["日", "月", "火", "水", "木", "金", "土"]

        return i == 0 ? "行程" : `${formatDateLocal(curDt, "MM/dd")}(${weekMap[curDt.getDay()]})`
    });

    const headerScrollRef = useRef(null);
    const bodyScrollRef = useRef(null);

    const fetchList = async () => {
        const response = await ky.post('/api/money/harvest/list/match', {
            json: {
                startTime__gte: formatDateLocal(pullToZero(startTime), "yyyy-MM-dd HH:mm"),
                startTime__lt: formatDateLocal(
                    changeDay(pullToZero(startTime), 7), "yyyy-MM-dd HH:mm"),
                view: "harvestList"
            }
        }).json();
        let dbList = response.list;
        let dayStart = pullToZero(startTime)
        let allTimes = Array.from({ length: 24 * 7 }).map((_, i) => {
            return {
                no: i,
                hidden: i % 24 <= 7 || i % 24 >= 22,
                harvest: [],
                curTime: formatDateLocal(changeHour(dayStart, i), "yyyy-MM-dd HH:mm"),
                isNow: formatDateLocal(changeHour(dayStart, i), "yyyy-MM-dd HH:mm")
                    === formatDateLocal(pullToHour(new Date()), "yyyy-MM-dd HH:mm")
            };
        });
        console.log("dbList", response);
        dbList.forEach(element => {
            const index = diffHours(pullToHour(element.startTime), pullToZero(startTime))
            console.log("index", index);
            allTimes[index].harvest.push(element)
            element.index = index
        });
        setTimeList(allTimes);
        console.log("allTimes", allTimes);
        setEditVer(prev => prev + 1);
    }

    useEffect(() => {
        fetchList(startTime);
    }, [startTime]);

    const journeys = [
        { title: "大阪游", startDate: "2026-03-19" },
        { title: "哈尔滨游", startDate: "2026-04-24" }
    ]

    const timerRef = useRef(null);
    const longPressHandle = {
        startPress: (e) => {
            clearTimeout(timerRef.current);
            const no = e.currentTarget.dataset.no;
            const item = timelist[no];

            timerRef.current = setTimeout(() => {
                setMoreOpMenuOpen(true);
                setMoreOpMenuTarget(item);
            }, 500);
        },
        endPress: () => {
            clearTimeout(timerRef.current);
        }
    }
    const detailHandle = (e) => {
        const no = e.currentTarget.dataset.no;
        const item = timelist[no];
        if (item.harvest.length > 0) {
            setDetailOpen(true);
            setMoreOpMenuTarget(item);
        } else {
            setEmptyBlockAddTarget({
                startTime: item.curTime
            })
            setEmptyBlockAddOpen(true);
        }
    }

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
                            <Button size="sm" variant="ghost" className="underline px-1" onClick={() => {
                                setStartTime(pullToZero(startTime, 7));
                            }}>下周</Button>
                            {journeys.map((n, i) => (
                                <Button key={n.title} size="sm" variant="ghost" className="underline px-1" onClick={() => {
                                    setStartTime(parseLocalDate(n.startDate));
                                }}>{n.title}</Button>
                            ))}
                        </div>
                        <div>
                            <FormHarvest trigger={
                                <Button size="sm" variant="outline">新增</Button>
                            } onSuccess={() => fetchList(startTime)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 py-2 sticky top-0 z-30 bg-background border-b">
                <div ref={headerScrollRef}
                    className="h-[35px] gap-1 flex overflow-x-hidden items-center font-medium">
                    {header.map((n, i) => (
                        <div
                            key={n}
                            className={`
                                h-full border rounded flex items-center justify-center shrink-0
                                ${i === 0 ? "w-[36px]" : "w-[166px]"}
                                ${/土|日/.test(n) ? "bg-red-50 text-red-500 border-red-200" : ""}
                            `}
                        >
                            {n}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 pt-1">
                <div className="flex gap-1">
                    {/* 左侧冻结列（不滚动） */}
                    <div className="grid gap-1 shrink-0 [grid-template-rows:repeat(14,50px)] w-[36px]">
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
                            className="min-w-max grid grid-flow-col gap-1 [grid-template-rows:repeat(14,50px)] auto-cols-[166px] " >
                            {timelist.map((n) => (
                                <div key={n.no}
                                    data-no={n.no}
                                    className={`relative h-[50px] border rounded flex items-center justify-center select-none ${n.hidden ? "hidden" : ""
                                        } transition-all duration-150 active:bg-blue-100 active:scale-95`}
                                    onClick={detailHandle}
                                    onPointerDown={longPressHandle.startPress}
                                    onPointerUp={longPressHandle.endPress}
                                    onPointerLeave={longPressHandle.endPress}
                                    onPointerCancel={longPressHandle.endPress}
                                    onContextMenu={(e) => e.preventDefault()}>
                                    {/* 左侧正方形 */}
                                    {n.harvest?.[0]?.garden && (<div className="h-full aspect-square flex-shrink-0">
                                        <img
                                            src={n.harvest?.[0]?.garden?.pics?.[0]}
                                            className="w-full h-full object-cover rounded-l"
                                            alt=""
                                        />
                                    </div>)}


                                    {/* 右侧内容 */}
                                    <div className="flex-1 flex items-center justify-center px-1">
                                        {(n.harvest?.[0]?.title || "").slice(0, 18) +
                                            (n.harvest?.[0]?.title?.length > 18 ? "..." : "")}
                                    </div>

                                    {/* 头像 */}
                                    {n.harvest?.[0]?.f_user?.raw_user_meta_data?.avatar_url && (
                                        <img
                                            src={n.harvest?.[0]?.f_user?.raw_user_meta_data?.avatar_url}
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white object-cover"
                                            alt=""
                                        />
                                    )}

                                    {/* 惊叹号 */}
                                    {/* {n.harvest?.[0] && !n.harvest[0].pushId && (
                                        <div
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white "
                                        >
                                            !
                                        </div>
                                    )} */}

                                    {/* 数量 */}
                                    {/* {n.harvest.length > 1 && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                                            {n.harvest.length}
                                        </div>
                                    )} */}

                                </div>
                            ))}
                            <MoreOpMenu open={moreOpMenuOpen} onOpenChange={setMoreOpMenuOpen} target={moreOpMenuTarget} onSuccess={
                                () => {
                                    fetchList();
                                }
                            } />
                            <HarvestDetail open={detailOpen} onOpenChange={setDetailOpen} target={moreOpMenuTarget} onSuccess={
                                () => {

                                }
                            } />
                            <FormHarvest openHarvestCtrl={emptyBlockAddOpen} setOpenHarvestCtrl={setEmptyBlockAddOpen} needPassCode={true} onSuccess={
                                () => {
                                    fetchList(startTime)
                                    setEmptyBlockAddOpen(false);
                                }
                            } defaultValues={emptyBlockAddTarget} key={emptyBlockAddTarget?.startTime ?? "emptyBlockAddTarget"} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Harvest;