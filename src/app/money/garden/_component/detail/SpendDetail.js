"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldSeparator
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import ky from "ky";
import { Textarea } from "@/components/ui/textarea"

import Datepicker from "@/components/datepicker";
import StarBar from "@/components/StarBar";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FormHarvest from "@/app/money/garden/_component/form/FormHarvest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import supabase from "@/app/utils/database";
import { Pencil, Trash2 } from "lucide-react";
import FormGranary from "@/app/money/garden/_component/form/FormGranary";
import { useGranaryStore } from "@/app/money/garden/_store/granaryStore";
import { getDiffClassName, formatDiff } from "@/app/utils/numDiff";
import { useUserStore } from "@/app/money/garden/_store/userStore";
import ActionButton from "@/components/ActionButton";
import { Tags } from "lucide-react";
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
} from "recharts";

const SpendDetail = ({ open, onOpenChange, target, onSuccess }) => {
  const [userId, setUserId] = useState(false);
  const [detail, setDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDfValue, setEditDfValue] = useState([]);
  const [editVersion, setEditVersion] = useState(0);

  const cashStore = useGranaryStore(state => state.cash);
  const userInfoStore = useUserStore(state => state.userInfo);
  const cateRefs = useRef({});

  const fetchDetail = async () => {
    if (!target?.id) return;

    const response = await ky.post("/api/spend/detail", {
      json: {
        userId: userInfoStore?.id,
        planetId: userInfoStore?.planetId,
      },
    }).json();

    setDetail(response.detail);
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

  const handleEdit = (detailList) => {
    setEditDfValue({ date: detail.date, detailList });
    setEditVersion(v => v + 1);
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    if (!item?.id || deleting) return;

    const ok = window.confirm("确定删除？");
    if (!ok) return;

    setDeleting(true);
    try {
      await ky.post("/api/spend/delete", {
        json: { id: item.id },
      }).json();

      toast.success("删除成功");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setDeleting(false);
    }
  };
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
  const chartTotal = chartData.reduce((sum, item) => sum + item.value, 0);

  const rankData = [...chartData].sort((a, b) => b.value - a.value);

  return (
    <>
      {detail && (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[100dvh] flex flex-col px-4 pb-0">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-xl font-semibold">详情</DrawerTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap justify-center gap-3">
                  <div>结算日:{detail.date}</div>
                </div>
              </div>
            </DrawerHeader>

            <div className="pb-5 flex flex-col bg-white overflow-y-auto overflow-x-hidden">
              <div className="mx-auto flex h-[180px] w-full max-w-[390px] shrink-0 items-center">
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
              </div>
              {detail.map((spendCate) => {
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
                      {spendCate.spends.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[72px_1fr_auto] items-start gap-2 py-1.5"
                        >
                          {/* 用户头像 + 用户名 */}
                          <div className="flex flex-col items-center pt-1">
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
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default SpendDetail;
