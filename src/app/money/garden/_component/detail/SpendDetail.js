"use client";
import {
  useEffect,
  useRef,
  useState,
  useMemo
} from "react";
import ky from "ky";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import supabase from "@/app/utils/database";
import { useGranaryStore } from "@/app/money/garden/_store/granaryStore";
import { useUserStore } from "@/app/money/garden/_store/userStore";
import {
  Tags,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CopyCheck,
  CalendarPlus
} from "lucide-react";
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import OpenCC from "opencc-js";
import useLongPress from "@/hooks/useLongPress";
import SpendMoreOpMenu from "@/app/money/garden/_component/detail/SpendMoreOpMenu";
import MonthInfo from "@/components/MonthInfo";
import {
  formatDateLocal, changeDateStrDay
} from "@/app/utils/date";

const toCn = OpenCC.Converter({ from: "tw", to: "cn" });
const toTw = OpenCC.Converter({ from: "cn", to: "tw" });

const SpendDetail = ({ open, onOpenChange, target, onSuccess, prevTar }) => {
  const [userId, setUserId] = useState(false);
  const [detail, setDetail] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDfValue, setEditDfValue] = useState([]);
  const [editVersion, setEditVersion] = useState(0);
  const [mode, setMode] = useState("detail");
  const [checkedIds, setCheckedIds] = useState([]);
  const [checkMode, setCheckMode] = useState("single");
  const [moreOpMenuOpen, setMoreOpMenuOpen] = useState(false);
  const [moreOpMenuTarget, setMoreOpMenuTarget] = useState(null);

  const cashStore = useGranaryStore(state => state.cash);
  const userInfoStore = useUserStore(state => state.userInfo);
  const cateRefs = useRef({});

  const fetchDetail = async () => {
    if (!target?.id) return;

    const response = await ky.post("/api/spend/detail", {
      json: {
        userId: userInfoStore?.id,
        planetId: userInfoStore?.planetId,
        gteDate: target.date,
        ltDateMaybe: prevTar?.date,
      },
    }).json();

    setDetail(
      response.detail.map((cate) => ({
        ...cate,
        spends: cate.spends.map((spend) => ({
          ...spend,
          titleCn: toCn(spend.title || ""),
          titleTw: toTw(spend.title || ""),
        })),
      }))
    );
  };

  useEffect(() => {
    if (!target) return;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
    };

    loadSession();
    fetchDetail();
  }, [target]);

  const chartData = Array.isArray(detail)
    ? detail.filter((cate) => cate.total && Number(cate.total) > 0).map((cate) => ({
      name: cate.label,
      value: Number(cate.total || 0),
      color: cate.children?.bgColor || "#94A3B8",
    }))
    : [];
  const PieSector = (props) => {
    return <Sector {...props} fill={props.payload.color} />;
  };
  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    value,
    percent,
  }) => {
    if (!percent || percent < 0.08) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#111827"
        fontSize={12}
        fontWeight={600}
      >
        <tspan x={x} dy="-1.1em">{name}</tspan>
        <tspan x={x} dy="1.1em">{value}</tspan>
        <tspan x={x} dy="1.1em">{Math.round(percent * 100)}%</tspan>
      </text>
    );
  };
  const monthData = useMemo(() => {
    if (!Array.isArray(detail)) return [];

    const dateMap = {};

    detail.forEach((detailItem) => {
      detailItem.spends?.forEach((spend) => {
        if (spend.isFix) return false;
        const date = spend.date;

        if (!dateMap[date]) {
          dateMap[date] = {
            date,
            total: 0,
            detail: [],
          };
        }

        dateMap[date].total += Number(spend.amount || 0);

        let targetDetail = dateMap[date].detail.find(
          (item) => item.id === detailItem.id
        );

        if (!targetDetail) {
          targetDetail = {
            ...detailItem,
            total: 0,
            spends: [],
          };

          dateMap[date].detail.push(targetDetail);
        }

        targetDetail.total += Number(spend.jpyCost || 0);
        targetDetail.spends.push(spend);
      });
    });

    return Object.values(dateMap)
      .map((item) => ({
        ...item,
        total: Number(item.total.toFixed(0)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [detail]);

  const chartTotal = chartData.reduce((sum, item) => sum + item.value, 0);

  const rankData = [...chartData].sort((a, b) => b.value - a.value);

  const checkedTotal = Array.isArray(detail)
    ? detail
      .flatMap((cate) => cate.spends || [])
      .filter((spend) => checkedIds.includes(spend.id))
      .reduce((sum, spend) => sum + Number(spend.jpyCost), 0)
    : 0;

  const checkedPercent =
    chartTotal > 0 ? (checkedTotal / chartTotal) * 100 : 0;

  const longPressHandle = useLongPress({
    getPayload: (e) => {
      return detail?.flatMap(item => item.spends || []).find(spend => spend.id === Number(e.currentTarget.dataset.no))
    },
    onLongPress: (item) => {
      if (mode === "play") return;
      setMoreOpMenuOpen(true);
      setMoreOpMenuTarget(item);
    },
  });

  const [selDate, setSelDate] = useState(() => formatDateLocal(new Date()));

  useEffect(() => {
    if (!prevTar?.date) return;

    setSelDate(changeDateStrDay(prevTar.date, -1));
  }, [prevTar?.date]);

  return (
    <>
      {detail && (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[100dvh] flex flex-col px-4 pb-0">
            <DrawerHeader className="pb-2 px-0">
              <DrawerTitle className="text-xl font-semibold flex">
                <div className="w-20 flex justify-start">
                  <Button variant="ghost" size="sm" className={`h-auto px-1 py-1.5`}
                    onClick={() => {
                      if (mode === "play") {
                        setMode("detail")
                      }
                      if (mode === "detail") {
                        setMode("month")
                      }
                    }}>
                    <span className="flex items-center gap-1">
                      {(mode === "play" || mode === "detail") && <ChevronLeft className="h-7 w-7" />}
                      <span className="text-[13px] leading-none text-muted-foreground">
                        {mode === "play" && <>总览</>}
                        {mode === "detail" && <>月报</>}
                      </span>
                    </span>
                  </Button>
                </div>
                <div className="flex-1 text-center">
                  {mode === "play" && <span>演算纸</span>}
                  {mode === "detail" && <span>总览</span>}
                  {mode === "month" && <span>月报</span>}
                </div>
                <div className="w-20 flex justify-end">
                  <Button variant="ghost" size="sm" className={`h-auto px-1 py-1.5`}
                    onClick={() => {
                      if (mode === "detail") {
                        setMode("play")
                      }
                      if (mode === "month") {
                        setMode("detail")
                      }
                    }}>
                    <span className="flex items-center gap-1">
                      <span className="text-[13px] leading-none text-muted-foreground">
                        {mode === "detail" && <>演算纸</>}
                        {mode === "month" && <>总览</>}
                      </span>
                      {(mode === "detail" || mode === "month") && <ChevronRight className="h-7 w-7" />}
                    </span>
                  </Button>
                </div>
              </DrawerTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap justify-center gap-3">
                  <div>结算周期:{target.date.slice(5)}~{prevTar ? changeDateStrDay(prevTar?.date, -1).slice(5) : ""}</div>
                </div>
              </div>
            </DrawerHeader>

            <div className="pb-5 flex flex-col bg-white overflow-y-auto overflow-x-hidden">
              {mode === "month" && <div className="mx-auto flex w-full max-w-[390px] shrink-0 items-center">
                <MonthInfo startDateStr={target.date}
                  {...(prevTar?.date ? { endDateStr: changeDateStrDay(prevTar?.date, -1) } : {})}
                  monthData={monthData} selDate={selDate} setSelDate={setSelDate} />
              </div>}
              {mode === "detail" && <div className="mx-auto flex h-[180px] w-full max-w-[390px] shrink-0 items-center">
                <div className="h-full flex-1 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={90}
                        paddingAngle={1}
                        labelLine={false}
                        label={renderPieLabel}
                        shape={<PieSector />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-full flex-1 min-w-0">
                  <div className="flex h-full w-full shrink-0 flex-col rounded-xl bg-slate-50 pt-2">
                    {/* 总额 */}
                    <div className="mb-1.5 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[16px] font-medium">
                          总额
                        </span>

                        <span className="text-lg font-bold text-red-500 tabular-nums">
                          {(chartTotal / 10000).toFixed(1)}万円
                        </span>
                      </div>
                    </div>

                    {/* 排行榜 */}
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      {rankData.map((item, index) => (
                        <div
                          key={item.name}
                          className="mb-0.5 flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 shadow-sm"
                          onClick={() => {
                            cateRefs.current[item.name]?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}>
                          <span className="w-4 shrink-0 text-xs font-bold text-slate-400">
                            {index + 1}
                          </span>
                          <span
                            className="h-3 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />

                          <span className="w-[52px] shrink-0 truncate text-xs font-medium text-slate-700">
                            {item.name}
                          </span>
                          <span className="w-11 shrink-0 text-left text-[11px] font-bold text-slate-500 tabular-nums">
                            {chartTotal > 0 ? `${Math.round((item.value / chartTotal) * 100)}%` : "0%"}
                          </span>

                          <span className="flex-1 shrink-0 text-xs text-right font-semibold text-slate-900 tabular-nums">
                            {(item.value / 10000).toFixed(1)}
                          </span>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>}

              {mode === "play" && (
                <div className="sticky top-0 z-10 mb-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
                  {/* 第一行：已选合计 */}
                  <div className="grid grid-cols-[1fr_auto_auto] items-center">
                    <div className="text-sm font-semibold text-slate-600">
                      已选合计
                    </div>

                    <div className="pr-5 text-base font-bold text-orange-500 tabular-nums">
                      {checkedPercent.toFixed(1)}%
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-red-500 tabular-nums">
                        {checkedTotal.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        jpy
                      </span>
                    </div>
                  </div>

                  {/* 第二行：操作按钮 */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                    <Button variant="outline" size="sm" className={`h-auto px-1 py-1.5 h-7 w-7`}
                      onClick={() => setCheckedIds([])}>
                      <span className="flex items-center">
                        <RotateCcw className="h-12 w-12" />
                      </span>
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`px-1 py-1.5 transition active:scale-95 ${checkMode === "multi"
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "active:bg-slate-200"
                          }`}
                        onClick={() =>
                          setCheckMode((prev) => (prev === "multi" ? "single" : "multi"))
                        }
                      >
                        <CopyCheck className="h-4 w-4" />同名快选
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className={`px-1 py-1.5 transition active:scale-95 ${checkMode === "sameDate"
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "active:bg-slate-200"
                          }`}
                        onClick={() =>
                          setCheckMode((prev) => (prev === "sameDate" ? "single" : "sameDate"))
                        }
                      >
                        <CalendarPlus className="h-4 w-4" />同日快选
                      </Button>
                    </div>

                  </div>
                </div>
              )}
              {detail.map((spendCate) => {
                if (mode === "month") {
                  var selDateData = monthData.find(t => t.date === selDate)
                  if (!selDateData) return null;
                  var selDateCate = selDateData?.detail.find(t => t.id === spendCate.id)
                  if (!selDateCate) return null;
                }
                return (
                  <div key={spendCate.id} ref={(el) => {
                    cateRefs.current[spendCate.label] = el;
                  }} className="border-b border-slate-200">
                    {/* 分类标题行 */}
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-6 w-3 rounded-full"
                          style={{
                            backgroundColor: spendCate.children?.bgColor || "#94A3B8",
                          }}
                        />
                        <span className="grid grid-cols-[50px_50px] items-center text-base text-xl font-bold text-slate-900">
                          <span>{spendCate.label}</span>
                          <span className="text-right text-slate-500 text-sm">
                            共{spendCate.spends.length}笔
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-[44px_80px_44px] items-center text-base">
                        <span className="text-right text-slate-500">

                        </span>

                        <span className="text-[24px] text-right font-medium text-red-500 tabular-nums">
                          {spendCate.total}
                        </span>
                        <span className="pl-2 text-left text-xs font-medium text-slate-400">
                          jpy
                        </span>
                      </div>
                    </div>

                    {/* 分类下的每一条明细 */}
                    <div className="divide-y divide-slate-100">
                      {spendCate.spends.map((item) => {

                        return (
                          <div
                            key={item.id}
                            className={`grid ${mode === "play"
                              ? "grid-cols-[28px_72px_1fr_auto]"
                              : "grid-cols-[72px_1fr_auto]"
                              } items-start gap-2 py-1.5`}
                            onClick={() => {
                              if (mode === "play") {
                                setCheckedIds((prev) =>
                                  prev.includes(item.id)
                                    ? prev.filter((id) => id !== item.id)
                                    : checkMode === "multi" ? [...prev, ...detail.flatMap(item => item.spends || [])
                                      .filter(spend => spend.title?.includes(item.title) ||
                                        spend.titleCn?.includes(item.titleCn) ||
                                        spend.titleTw?.includes(item.titleTw))
                                      .map(spend => spend.id)]

                                      : checkMode === "sameDate" ? [...prev, ...detail.flatMap(item => item.spends || [])
                                        .filter(spend => spend.date === item.date)
                                        .map(spend => spend.id)]

                                        : [...prev, item.id]
                                );
                              }
                            }}
                            {...longPressHandle} data-no={item.id}
                          >
                            {mode === "play" && <div className="flex h-full items-center justify-center">
                              <Checkbox className="border-2 border-slate-400"
                                checked={checkedIds.includes(item.id)}
                              />
                            </div>}
                            {/* 用户头像 + 用户名 */}
                            < div className="flex flex-col items-center pt-1" >
                              <img
                                src={item.f_user?.raw_user_meta_data?.avatar_url || "/default-avatar.png"}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                              />

                              <div
                                className={`mt-1 max-w-[72px] truncate text-center text-xs font-medium`}
                              >
                                {item.f_user?.raw_user_meta_data?.name}
                              </div>
                            </div>

                            {/* 中间内容 */}
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2 text-lg font-semibold text-slate-900">

                                <span className="truncate text-[18px]">
                                  {item.title}
                                </span>

                                {item.isFix && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
                                    <Tags className="h-3 w-3" />
                                    固定
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 text-base text-slate-500">
                                {item.date?.slice(5)}
                              </div>


                            </div>

                            {/* 右侧金额 */}
                            <div className="flex flex-col">
                              <div className="grid grid-cols-[80px_44px] items-baseline text-lg">
                                <span className="text-right font-medium text-orange-300 tabular-nums">
                                  {item.amount}
                                </span>

                                <span className="pl-2 text-left text-xs font-medium text-slate-400">
                                  {item.cashType}
                                </span>
                              </div>
                              {item.cashType !== "jpy" && (
                                <div className="grid grid-cols-[80px_44px] items-baseline pt-1 text-lg">
                                  <span className="text-right pl-2 text-left text-xs font-medium text-gray-300">
                                    {item.jpyCost}
                                  </span>

                                  <span className="pl-2 text-left text-xs font-medium text-gray-300">
                                    jpy
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>)
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </DrawerContent >
        </Drawer >
      )}
      <SpendMoreOpMenu open={moreOpMenuOpen} onOpenChange={setMoreOpMenuOpen} target={moreOpMenuTarget} onSuccess={
        () => {
          fetchDetail();
        }
      } />
    </>
  );
};

export default SpendDetail;
