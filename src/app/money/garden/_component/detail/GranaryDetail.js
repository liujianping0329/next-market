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
import { useGranaryStore } from "@/app/money/garden/_store/granaryStore"

const GranaryDetail = ({ open, onOpenChange, target, onSuccess }) => {
  const [userId, setUserId] = useState(false);
  const [detail, setDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDfValue, setEditDfValue] = useState([]);
  const [editVersion, setEditVersion] = useState(0);

  const cashStore = useGranaryStore(state => state.cash);
  const userTemplateStore = useGranaryStore(state => state.userTemplate);

  const fetchDetail = async () => {
    if (!target?.id) return;

    const response = await ky.post("/api/granary/detail", {
      json: {
        granaryId: target.id,
        userId,
      },
    }).json();

    setDetail(response.detail);
    console.log(response.detail);
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

  const handleDelete = async () => {
    if (!detail?.id || deleting) return;

    const ok = window.confirm("确定删除？");
    if (!ok) return;

    setDeleting(true);
    try {
      await ky.post("/api/granary/delete", {
        json: { id: detail.id, userId },
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

  const tabItems = detail.granary_user_sum ?? [];
  const defaultTabValue = tabItems.find(item => item.f_user?.id === userId) ? userId : (tabItems[0]?.f_user?.id ?? -1);
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

            <Tabs defaultValue={defaultTabValue} className="flex flex-1 min-h-0 flex-col">
              <TabsList variant="line">
                {detail.granary_user_sum.map((item) => (
                  <TabsTrigger key={item.id} value={item.f_user?.id ?? -1}>
                    <Avatar>
                      <AvatarImage src={item.f_user?.raw_user_meta_data?.avatar_url} alt="img" />
                      <AvatarFallback>guest</AvatarFallback>
                    </Avatar>
                    <span>{item.f_user?.raw_user_meta_data?.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {detail.granary_user_sum.map((item) => {
                const detailList = detail.granary_detail.filter((detailItem) => detailItem.userId === item.userId);
                const isOwnTab = item.userId === userId;

                return (
                  <TabsContent
                    key={item.id}
                    value={item.f_user?.id ?? -1}
                    className="flex flex-1 min-h-0 flex-col"
                  >
                    <div className="mt-1 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-4 shadow-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium tracking-wide text-sky-700">小计</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-semibold leading-none text-slate-900">
                            {item.total}
                          </span>
                          <span className="text-sm text-slate-500">(wjpy)</span>
                        </div>
                      </div>

                      {isOwnTab && (
                        <div className="mt-4 border-t border-sky-100 pt-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="h-9 w-full justify-center gap-1.5 rounded-xl border-sky-200 bg-white/90 px-3 text-sm font-medium text-slate-700 shadow-none hover:bg-white"
                              onClick={() => {
                                handleEdit(detailList);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>修改</span>
                            </Button>

                            <Button
                              variant="outline"
                              className="h-9 w-full justify-center gap-1.5 rounded-xl border-red-200 bg-white/90 px-3 text-sm font-medium text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
                              onClick={handleDelete}
                              disabled={deleting}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>删除</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                        <span>项目</span>
                        <span className="text-right">金额</span>
                        <span className="text-right">币种</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {detailList.map((detailItem) => (
                          <div
                            key={detailItem.id}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
                          >
                            <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                              {detailItem.granary_user_template?.name}
                            </span>

                            <span className="text-right text-sm font-semibold text-slate-900 tabular-nums">
                              {Number(detailItem.price).toLocaleString()}
                            </span>

                            <span className="text-right text-sm text-slate-500 uppercase">
                              {detailItem.granary_user_template?.cashType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
            <FormGranary key={`${detail.id}-${editVersion}`} openGranaryCtrl={editOpen} setOpenGranaryCtrl={setEditOpen} onSuccess={() => {
              fetchDetail();
              onSuccess?.(); // ✅ 通知外层的 Granary.js 重新 fetchData()
            }} cash={cashStore} userTemplate={userTemplateStore} defaultValues={editDfValue} />
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default GranaryDetail;
