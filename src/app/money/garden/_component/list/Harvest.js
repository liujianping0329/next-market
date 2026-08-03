
import {
    useEffect,
    useState,
    useRef,
} from "react";

import { Button } from "@/components/ui/button";
import ky from "ky";
import {
    Hotel,
    Airplane,
    Notes
} from "@icon-park/react";
import Datepicker from "@/components/datepicker";
import {
    pullToZero,
    pullToHour,
    diffHours,
    formatDateLocal,
    changeDay,
    parseLocalDate,
    changeHour,
} from "@/app/utils/date";

import FormHarvest from "../form/FormHarvest";
import FormHarvestJourney from "../form/FormHarvestJourney";
import FormJourney from "../form/FormJourney";

import MoreOpMenu from "@/app/money/garden/_component/list/harvest/MoreOpMenu";
import useLongPress from "@/hooks/useLongPress";
import HarvestDetail from "@/app/money/garden/_component/detail/HarvestDetail";
import JourneyDetail from "@/app/money/garden/_component/detail/JourneyDetail";

import * as holiday_jp from "@holiday-jp/holiday_jp";
import { useCallback } from "react";
import { PlusCircle, Route } from "lucide-react";
import { cn } from "@/lib/utils";

const Harvest = ({ userInfo, isUserReady }) => {

    const [startTime, setStartTime] = useState(new Date());

    const [editVer, setEditVer] = useState(0);

    const [timelist, setTimeList] = useState([]);

    const [moreOpMenuOpen, setMoreOpMenuOpen] = useState(false);
    const [moreOpMenuTarget, setMoreOpMenuTarget] = useState(null);
    const [emptyBlockAddOpen, setEmptyBlockAddOpen] = useState(false);
    const [emptyBlockAddTarget, setEmptyBlockAddTarget] = useState(false);
    const [emptyBlockJourneyAddOpen, setEmptyBlockJourneyAddOpen] = useState(false);
    const [emptyBlockJourneyAddTarget, setEmptyBlockJourneyAddTarget] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailJourneyOpen, setDetailJourneyOpen] = useState(false);
    const [detailJourneyTarget, setDetailJourneyTarget] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [redPointDates, setRedPointDates] = useState([]);
    const [journeys, setJourneys] = useState([]);
    const [selectedJourney, setSelectedJourney] = useState(null);
    const journeyScrollRefs = useRef([]);

    const timeConst = Array.from({ length: 14 }).map((_, i) => i + 8);     // 1-12 冻结列
    const rest = Array.from({ length: 98 }).map((_, i) => i + 1);           // 13+ 右侧滚动区
    const header = Array.from({ length: 8 }).map((_, i) => {
        const curDt = pullToZero(startTime, i - 1);
        const weekMap = ["日", "月", "火", "水", "木", "金", "土"]

        return i == 0 ? "行程" : `${formatDateLocal(curDt, "MM/dd")}(${weekMap[curDt.getDay()]})`
    });

    const headerScrollRef = useRef(null);
    const bodyScrollRef = useRef(null);
    const [journeyHarvests, setJourneyHarvests] = useState([]);
    const fetchList = async () => {
        var startTime0 = pullToZero(startTime);
        var endTime = changeDay(startTime0, 7);
        setHolidays(holiday_jp.between(startTime0, endTime));
        console.log("holidays", holidays);

        const response = await ky.post('/api/money/harvest/list/match', {
            json: {
                startTime__gte: formatDateLocal(startTime0, "yyyy-MM-dd HH:mm"),
                startTime__lt: formatDateLocal(endTime, "yyyy-MM-dd HH:mm"),
                ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id })
            }
        }).json();
        let dbList = response.list.filter(item => !item.journeyId);
        setJourneyHarvests(
            response.list.filter((item) => item.journeyId)
        );
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

        dbList.forEach(element => {
            const index = diffHours(pullToHour(element.startTime), pullToZero(startTime))
            console.log("index", index);
            allTimes[index].harvest.push(element)
            element.index = index
        });
        setTimeList(allTimes);
        setEditVer(prev => prev + 1);

        ky.get('/api/journey/list').json().then((data) => {
            setJourneys(data.list);
        });
    }

    useEffect(() => {
        if (!isUserReady) return
        fetchList(startTime);
    }, [startTime, isUserReady]);

    const journeyStart = selectedJourney
        ? pullToZero(parseLocalDate(selectedJourney.startDate))
        : null;

    const journeyEnd = selectedJourney
        ? pullToZero(parseLocalDate(selectedJourney.endDate))
        : null;

    const getblocks = (journeyType) => {
        let blocks = selectedJourney
            ? header.slice(1).map((_, index) => {
                const date = pullToZero(startTime, index);

                const inRange =
                    date >= journeyStart &&
                    date <= journeyEnd;

                return inRange
                    ? {
                        date,
                        harvest: journeyHarvests.find((item) => {
                            return (
                                pullToZero(item.startTime).getTime() ===
                                date.getTime() &&
                                item.journeyId === selectedJourney.id &&
                                item.journeyType === journeyType
                            );
                        }) || null,
                    }
                    : null;
            })
            : []
        if (blocks.every(block => block === null)) {
            setSelectedJourney(null);
        }
        return blocks;
    }

    const journeyItems = selectedJourney
        ? [
            {
                id: "memo",
                icon: (
                    <Notes
                        theme="two-tone"
                        size="18"
                        strokeWidth={3}
                        fill={["#d97706", "#fef3c7"]}
                    />
                ),
                blocks: getblocks("memo"),
            },
            {
                id: "flight",
                icon: (
                    <Airplane
                        theme="two-tone"
                        size="18"
                        strokeWidth={3}
                        fill={["#7c3aed", "#ddd6fe"]}
                    />
                ),
                blocks: getblocks("flight"),
            },
            {
                id: "hotel",
                icon: (
                    <Hotel
                        theme="two-tone"
                        size="18"
                        strokeWidth={3}
                        fill={["#0369a1", "#bae6fd"]}
                    />
                ),
                blocks: getblocks("hotel"),
            },
        ]
        : [];

    const longPressHandle = useLongPress({
        getPayload: (e) => {
            const no = e.currentTarget.dataset.no;
            return timelist[no];
        },
        onLongPress: (item) => {
            setMoreOpMenuOpen(true);
            setMoreOpMenuTarget(item);
        },
    });
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
    const detailJourneyHandle = (block, item) => {
        if (!block) return;
        if (block?.harvest) {
            setDetailJourneyOpen(true);
            setDetailJourneyTarget(block);
        } else {
            setEmptyBlockJourneyAddTarget({
                startTime: block.date,
                journeyId: selectedJourney.id,
                journeyType: item.id
            })
            setEmptyBlockJourneyAddOpen(true);
        }
    }

    const handleMonthChange = useCallback(async (start, end) => {
        const sumInfo = await ky.post("/api/money/harvest/summary", {
            json: {
                start: formatDateLocal(start),
                end: formatDateLocal(changeDay(end, 1)),
                ...(userInfo?.planet
                    ? { planetId: userInfo.planet.id }
                    : { userId: userInfo?.id }),
            },
        }).json();

        setRedPointDates(sumInfo.map((item) => new Date(item.startTime)));
    }, [userInfo?.planet?.id, userInfo?.id]);

    return (
        <>
            <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        规划每一次满载而归的旅程与目标。将期待化成行动，记录下过程与收获，让每一段经历都有迹可循。
                    </span>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center gap-3">
                            <Datepicker dateDf={startTime} dtFormat="MM/dd" onChange={(date) => {
                                setStartTime(date);
                            }} redPointDates={redPointDates} onMonthChange={handleMonthChange} />
                            <Button size="sm" variant="ghost" className="underline px-1" onClick={() => {
                                setStartTime(pullToZero(startTime, 7));
                            }}>下周</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <FormJourney trigger={
                                <Button size="sm" variant="outline">
                                    <Route className="h-4 w-4" />
                                    新增旅程
                                </Button>
                            } onSuccess={() => fetchList(startTime)} />
                            <FormHarvest trigger={
                                <Button size="sm" variant="outline">
                                    <PlusCircle className="h-4 w-4" />
                                    新增
                                </Button>
                            } onSuccess={() => fetchList(startTime)} />
                        </div>
                    </div>
                    {/* 灰线 */}
                    <div className="border-t border-border" />
                    {/* 旅程标签区域 */}
                    <div className="flex flex-wrap gap-1.5">
                        {journeys.map((item) => {
                            const selected = selectedJourney?.id === item.id;
                            return (
                                <button
                                    key={item.id} type="button" onClick={() => {
                                        const isCancel = selectedJourney?.id === item.id;
                                        setSelectedJourney(isCancel ? null : item);
                                        setStartTime(
                                            isCancel
                                                ? new Date()
                                                : parseLocalDate(item.startDate)
                                        );
                                    }}
                                    className={cn(
                                        "inline-flex h-7 items-center rounded-md border px-2.5",
                                        "text-xs font-medium transition-colors",
                                        selected
                                            ? "border-sky-700 bg-sky-700 text-white"
                                            : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                    )}
                                >
                                    <span className="max-w-32 truncate">
                                        {item.title}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div >
            <div className="p-4 py-2 sticky top-0 z-30 bg-background border-b flex flex-col gap-1">
                <div className="flex gap-1">
                    {/* 第一格固定 */}
                    <div className="h-[35px] w-[36px] shrink-0 rounded border flex items-center justify-center font-medium">
                        行程
                    </div>

                    {/* 后面的日期跟随下面横向滚动 */}
                    <div
                        ref={headerScrollRef}
                        className="flex-1 overflow-x-hidden"
                    >
                        <div className="h-[35px] min-w-max flex gap-1 items-center font-medium">
                            {header.slice(1).map((n, index) => {
                                const i = index + 1;
                                const curDt = pullToZero(startTime, i - 1);

                                const holiday = holidays.find(
                                    (h) =>
                                        pullToZero(h.date).getTime() ===
                                        curDt.getTime()
                                );

                                const isHoliday = Boolean(holiday);

                                return (
                                    <div
                                        key={n}
                                        className={`
                                h-full w-[166px] shrink-0
                                border rounded
                                flex flex-col items-center justify-center
                                ${/土|日/.test(n)
                                                ? "bg-red-50 text-red-500 border-red-200"
                                                : ""}
                                ${isHoliday
                                                ? "bg-rose-100 text-rose-600 border-rose-300"
                                                : ""}
                            `}
                                    >
                                        <div className="text-sm font-medium">
                                            {n}
                                        </div>

                                        {isHoliday && (
                                            <div className="max-w-full truncate px-1 text-[11px] leading-tight">
                                                {holiday.name}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {selectedJourney &&
                    journeyItems.map((item, itemIndex) => (
                        <div key={item.id} className="flex gap-1">
                            <div className="flex h-[35px] w-[36px] shrink-0 items-center justify-center rounded border font-medium">
                                {item.icon}
                            </div>

                            <div className="flex-1 overflow-x-hidden"
                                ref={(el) => {
                                    journeyScrollRefs.current[itemIndex] = el;
                                }}>
                                <div className="flex h-[35px] min-w-max items-center gap-1 font-medium">
                                    {item.blocks.map((block, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex h-full w-[166px] shrink-0 rounded border",
                                                block
                                                    ? "border-sky-200 bg-sky-50"
                                                    : "border-transparent"
                                            )}
                                            onClick={() => detailJourneyHandle(block, item)}
                                        >
                                            {/* 左侧正方形 */}
                                            {block?.harvest?.garden && (<div className="h-full aspect-square flex-shrink-0">
                                                <img
                                                    src={block?.harvest?.garden?.pics?.[0]}
                                                    className="w-full h-full object-cover rounded-l"
                                                    alt=""
                                                />
                                            </div>)}
                                            <div className="flex-1 flex items-center justify-center px-1 line-clamp-2 leading-tight">
                                                {block?.harvest?.title ?? ""}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
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
                            const scrollLeft = e.currentTarget.scrollLeft;

                            if (headerScrollRef.current) {
                                headerScrollRef.current.scrollLeft = scrollLeft;
                            }

                            journeyScrollRefs.current.forEach((el) => {
                                if (el) {
                                    el.scrollLeft = scrollLeft;
                                }
                            });
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
                                    {...longPressHandle}>
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
                            <FormHarvestJourney openHarvestCtrl={emptyBlockJourneyAddOpen} setOpenHarvestCtrl={setEmptyBlockJourneyAddOpen} needPassCode={true} onSuccess={
                                () => {
                                    fetchList(startTime)
                                    setEmptyBlockJourneyAddOpen(false);
                                }
                            } defaultValues={emptyBlockJourneyAddTarget} key={`JourneyAddTarget-${emptyBlockJourneyAddTarget?.journeyId ?? "emptyBlockJourneyAddTarget"}`} />
                            <JourneyDetail open={detailJourneyOpen} onOpenChange={setDetailJourneyOpen} target={detailJourneyTarget} onSuccess={
                                () => {

                                }
                            } />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Harvest;
